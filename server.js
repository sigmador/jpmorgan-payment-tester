import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JPMorgan API Configuration
const JPMC_CONFIG = {
    sandbox: {
        baseUrl: 'https://api-sandbox.payments.jpmorgan.com',
        wiresPath: '/tsapi/v1/payments/payment-orders',
        achPath: '/tsapi/v1/payments/ach'
    }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get API configuration
app.get('/api/config', (req, res) => {
    res.json({
        apis: [
            {
                id: 'wires',
                name: 'Wires API',
                description: 'Create and manage wire transfers',
                baseUrl: JPMC_CONFIG.sandbox.baseUrl,
                endpoints: [
                    {
                        id: 'create-wire',
                        method: 'POST',
                        path: '/tsapi/v1/payments/payment-orders',
                        name: 'Create Wire Payment',
                        description: 'Initiate a wire transfer payment',
                        samplePayload: {
                            "clientReferenceId": "WIRE-" + Date.now(),
                            "paymentType": "WIRE",
                            "amount": {
                                "value": 1000.00,
                                "currency": "USD"
                            },
                            "debitAccount": {
                                "accountNumber": "1234567890",
                                "bankId": "021000021"
                            },
                            "creditAccount": {
                                "accountNumber": "9876543210",
                                "bankId": "026009593",
                                "accountName": "Beneficiary Name"
                            },
                            "paymentDetails": {
                                "purposeCode": "BUSINESS",
                                "remittanceInformation": "Payment for invoice #12345"
                            },
                            "requestedExecutionDate": new Date().toISOString().split('T')[0]
                        }
                    },
                    {
                        id: 'get-wire-status',
                        method: 'GET',
                        path: '/tsapi/v1/payments/payment-orders/{paymentId}',
                        name: 'Get Wire Status',
                        description: 'Check the status of a wire transfer',
                        samplePayload: null
                    }
                ]
            },
            {
                id: 'ach',
                name: 'ACH API',
                description: 'Create and manage ACH transactions',
                baseUrl: JPMC_CONFIG.sandbox.baseUrl,
                endpoints: [
                    {
                        id: 'create-ach',
                        method: 'POST',
                        path: '/tsapi/v1/payments/ach',
                        name: 'Create ACH Payment',
                        description: 'Initiate an ACH transfer',
                        samplePayload: {
                            "clientReferenceId": "ACH-" + Date.now(),
                            "transactionType": "CREDIT",
                            "secCode": "CCD",
                            "amount": {
                                "value": 500.00,
                                "currency": "USD"
                            },
                            "debitAccount": {
                                "accountNumber": "1234567890",
                                "routingNumber": "021000021"
                            },
                            "creditAccount": {
                                "accountNumber": "9876543210",
                                "routingNumber": "026009593",
                                "accountName": "Beneficiary Name",
                                "accountType": "CHECKING"
                            },
                            "effectiveDate": new Date().toISOString().split('T')[0],
                            "companyName": "Test Company",
                            "companyId": "1234567890",
                            "addenda": "Payment for services"
                        }
                    },
                    {
                        id: 'get-ach-status',
                        method: 'GET',
                        path: '/tsapi/v1/payments/ach/{transactionId}',
                        name: 'Get ACH Status',
                        description: 'Check the status of an ACH transaction',
                        samplePayload: null
                    },
                    {
                        id: 'create-ach-batch',
                        method: 'POST',
                        path: '/tsapi/v1/payments/ach/batch',
                        name: 'Create ACH Batch',
                        description: 'Submit multiple ACH transactions in a batch',
                        samplePayload: {
                            "batchHeader": {
                                "companyName": "Test Company",
                                "companyId": "1234567890",
                                "effectiveDate": new Date().toISOString().split('T')[0],
                                "secCode": "CCD"
                            },
                            "transactions": [
                                {
                                    "clientReferenceId": "ACH-BATCH-1",
                                    "transactionType": "CREDIT",
                                    "amount": {
                                        "value": 250.00,
                                        "currency": "USD"
                                    },
                                    "creditAccount": {
                                        "accountNumber": "1111111111",
                                        "routingNumber": "026009593",
                                        "accountName": "Recipient 1"
                                    }
                                },
                                {
                                    "clientReferenceId": "ACH-BATCH-2",
                                    "transactionType": "CREDIT",
                                    "amount": {
                                        "value": 350.00,
                                        "currency": "USD"
                                    },
                                    "creditAccount": {
                                        "accountNumber": "2222222222",
                                        "routingNumber": "026009593",
                                        "accountName": "Recipient 2"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    });
});

// Proxy endpoint for making API calls
app.post('/api/proxy', async (req, res) => {
    try {
        const { method, url, headers, body } = req.body;

        console.log('Proxying request:', { method, url });

        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...headers
            },
            validateStatus: () => true // Accept any status code
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.data = body;
        }

        const response = await axios(config);

        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Proxy request failed',
            message: error.message,
            details: error.response?.data || null
        });
    }
});

// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, 'client/build');

    // Check if build directory exists
    if (fs.existsSync(buildPath)) {
        app.use(express.static(buildPath));

        app.get('*', (req, res) => {
            res.sendFile(path.join(buildPath, 'index.html'));
        });
    } else {
        app.get('*', (req, res) => {
            res.status(503).json({
                error: 'Application not built',
                message: 'The React application has not been built yet. Run "npm run build:client" first.',
                buildPath: buildPath
            });
        });
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});