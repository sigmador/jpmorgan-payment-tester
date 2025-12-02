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

// Load and validate environment variables
const ENV_CONFIG = {
    CLIENT_ID: process.env.JPMC_CLIENT_ID,
    CLIENT_SECRET: process.env.JPMC_CLIENT_SECRET,
    API_KEY: process.env.JPMC_API_KEY
};

// Log environment variable status
console.log('='.repeat(50));
console.log('Environment Variables Check:');
console.log(`JPMC_CLIENT_ID: ${ENV_CONFIG.CLIENT_ID ? '✓ Set' : '✗ Not Set'}`);
console.log(`JPMC_CLIENT_SECRET: ${ENV_CONFIG.CLIENT_SECRET ? '✓ Set' : '✗ Not Set'}`);
console.log(`JPMC_API_KEY: ${ENV_CONFIG.API_KEY ? '✓ Set' : '✗ Not Set'}`);
console.log('='.repeat(50));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// JPMorgan API Configuration
const JPMC_CONFIG = {
    sandbox: {
        baseUrl: 'https://api-sandbox.payments.jpmorgan.com',
        wiresPath: '/tsapi/v1/payments/payment-orders',
        achPath: '/tsapi/v1/payments/ach'
    }
};

// API Routes - MUST BE BEFORE STATIC FILE SERVING

// Health check
app.get('/api/health', (req, res) => {
    console.log('Health check called');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Environment variables status (for debugging)
app.get('/api/env-status', (req, res) => {
    console.log('Environment status check called');
    res.json({
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        credentials: {
            clientId: ENV_CONFIG.CLIENT_ID ? 'Set (Hidden)' : 'Not Set',
            clientSecret: ENV_CONFIG.CLIENT_SECRET ? 'Set (Hidden)' : 'Not Set',
            apiKey: ENV_CONFIG.API_KEY ? 'Set (Hidden)' : 'Not Set'
        },
        note: 'If credentials are "Not Set", they must be added in Render environment variables'
    });
});

// Debug: List all registered routes
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            // Route middleware
            const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
            routes.push(`${methods} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
                    routes.push(`${methods} ${handler.route.path}`);
                }
            });
        }
    });

    res.json({
        registeredRoutes: routes,
        note: 'These are all the routes registered in Express'
    });
});

// Get API configuration
app.get('/api/config', (req, res) => {
    console.log('Config endpoint called');
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
    console.log('=== PROXY ENDPOINT CALLED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const { method, url, headers, body } = req.body;

        if (!method || !url) {
            console.error('Missing required fields:', { method, url });
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields: method and url'
            });
        }

        console.log('Proxying request:', { method, url });
        console.log('Client provided headers:', headers);

        // Merge headers: start with defaults, add client headers
        const mergedHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
        };

        // Replace placeholder values with actual env vars
        const PLACEHOLDER_PATTERNS = ['YOUR_', 'your_', 'YOUR-', 'your-'];

        // Check and replace X-Client-Id
        if (mergedHeaders['X-Client-Id']) {
            const clientIdValue = mergedHeaders['X-Client-Id'];
            const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => clientIdValue.includes(pattern));

            if (isPlaceholder || !clientIdValue || clientIdValue.trim() === '') {
                if (ENV_CONFIG.CLIENT_ID) {
                    console.log('Replacing placeholder X-Client-Id with environment variable');
                    mergedHeaders['X-Client-Id'] = ENV_CONFIG.CLIENT_ID;
                } else {
                    console.warn('X-Client-Id is placeholder but no env var available');
                }
            }
        } else if (ENV_CONFIG.CLIENT_ID) {
            console.log('Adding X-Client-Id from environment variable');
            mergedHeaders['X-Client-Id'] = ENV_CONFIG.CLIENT_ID;
        }

        // Check and replace X-Api-Key
        if (mergedHeaders['X-Api-Key']) {
            const apiKeyValue = mergedHeaders['X-Api-Key'];
            const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => apiKeyValue.includes(pattern));

            if (isPlaceholder || !apiKeyValue || apiKeyValue.trim() === '') {
                if (ENV_CONFIG.API_KEY) {
                    console.log('Replacing placeholder X-Api-Key with environment variable');
                    mergedHeaders['X-Api-Key'] = ENV_CONFIG.API_KEY;
                } else {
                    console.warn('X-Api-Key is placeholder but no env var available');
                }
            }
        } else if (ENV_CONFIG.API_KEY) {
            console.log('Adding X-Api-Key from environment variable');
            mergedHeaders['X-Api-Key'] = ENV_CONFIG.API_KEY;
        }

        // Check Authorization header for placeholder
        if (mergedHeaders['Authorization']) {
            const authValue = mergedHeaders['Authorization'];
            const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => authValue.includes(pattern));

            if (isPlaceholder) {
                console.warn('⚠️  Authorization header contains placeholder text!');
                console.warn('   Please update the Authorization header with a real Bearer token');
                console.warn('   Example: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...');
            }
        }

        // Log what credentials are being used (without exposing values)
        console.log('Final headers check:');
        console.log('  Authorization:', mergedHeaders['Authorization'] ?
            (mergedHeaders['Authorization'].includes('YOUR') ? '⚠️  PLACEHOLDER' : '✓ Present') : '✗ Missing');
        console.log('  X-Client-Id:', mergedHeaders['X-Client-Id'] ?
            (mergedHeaders['X-Client-Id'].includes('YOUR') ? '⚠️  PLACEHOLDER' : '✓ Present') : '✗ Missing');
        console.log('  X-Api-Key:', mergedHeaders['X-Api-Key'] ?
            (mergedHeaders['X-Api-Key'].includes('YOUR') ? '⚠️  PLACEHOLDER' : '✓ Present') : '✗ Missing');

        const config = {
            method,
            url,
            headers: mergedHeaders,
            validateStatus: () => true // Accept any status code
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.data = body;
            console.log('Request body:', JSON.stringify(body, null, 2));
        }

        console.log('Sending request to:', url);
        const response = await axios(config);
        console.log('Received response:', response.status, response.statusText);

        // Log response preview (first 500 chars)
        const responsePreview = JSON.stringify(response.data).substring(0, 500);
        console.log('Response preview:', responsePreview);

        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
    } catch (error) {
        console.error('=== PROXY ERROR ===');
        console.error('Error:', error.message);
        console.error('Error code:', error.code);

        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error('No response received');
            console.error('Stack:', error.stack);
        }

        res.status(500).json({
            error: 'Proxy request failed',
            message: error.message,
            code: error.code,
            details: error.response?.data || null
        });
    }
});

// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, 'client/build');

    console.log('Production mode - checking for build directory...');
    console.log('Build path:', buildPath);
    console.log('Build exists:', fs.existsSync(buildPath));

    // Check if build directory exists
    if (fs.existsSync(buildPath)) {
        console.log('Serving static files from:', buildPath);

        // Serve static files (CSS, JS, images, etc.)
        app.use(express.static(buildPath));

        // Handle React routing - return index.html for GET requests to non-API routes
        app.get('*', (req, res) => {
            // Only serve index.html for non-API routes
            if (!req.path.startsWith('/api')) {
                console.log('Serving index.html for:', req.path);
                res.sendFile(path.join(buildPath, 'index.html'));
            } else {
                // This shouldn't happen as API routes are defined above
                console.error('GET request to undefined API route:', req.path);
                res.status(404).json({ error: 'API route not found', path: req.path });
            }
        });

        // Catch-all for other HTTP methods to API routes (POST, PUT, DELETE, etc.)
        app.all('/api/*', (req, res) => {
            console.error('Request to undefined API route:', req.method, req.path);
            res.status(404).json({
                error: 'API route not found',
                method: req.method,
                path: req.path,
                availableRoutes: [
                    'GET /api/health',
                    'GET /api/config',
                    'POST /api/proxy'
                ]
            });
        });
    } else {
        console.error('Build directory does not exist!');
        console.error('Expected path:', buildPath);

        // Log directory contents for debugging
        try {
            const clientPath = path.join(__dirname, 'client');
            console.log('Client directory exists:', fs.existsSync(clientPath));
            if (fs.existsSync(clientPath)) {
                console.log('Client directory contents:', fs.readdirSync(clientPath));
            }
        } catch (err) {
            console.error('Error reading directories:', err);
        }

        app.get('*', (req, res) => {
            res.status(503).json({
                error: 'Application not built',
                message: 'The React application has not been built yet. Run "npm run build:client" first.',
                buildPath: buildPath,
                clientExists: fs.existsSync(path.join(__dirname, 'client'))
            });
        });
    }
} else {
    // Development mode
    console.log('Development mode - API only');
    app.get('*', (req, res) => {
        res.json({
            message: 'Development mode - Run client separately with: cd client && npm start',
            apiEndpoints: ['/api/health', '/api/config', '/api/proxy']
        });
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access your app at: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('Available API endpoints:');
    console.log('  GET  /api/health       - Health check');
    console.log('  GET  /api/env-status   - Check environment variables');
    console.log('  GET  /api/routes       - List all registered routes');
    console.log('  GET  /api/config       - Get API configuration');
    console.log('  POST /api/proxy        - Proxy API requests');
    console.log('='.repeat(50));
    console.log('Environment Variable Status:');
    console.log(`  JPMC_CLIENT_ID: ${ENV_CONFIG.CLIENT_ID ? '✓ Set' : '✗ MISSING'}`);
    console.log(`  JPMC_API_KEY: ${ENV_CONFIG.API_KEY ? '✓ Set' : '✗ MISSING'}`);
    if (!ENV_CONFIG.CLIENT_ID || !ENV_CONFIG.API_KEY) {
        console.log('\n⚠️  WARNING: Missing credentials!');
        console.log('   Add them in Render Dashboard → Environment tab');
        console.log('   The proxy will automatically replace placeholder values');
        console.log('   Visit /api/env-status for details');
    } else {
        console.log('\n✓ Credentials loaded! Placeholder values will be auto-replaced.');
    }
    console.log('='.repeat(50));
});