import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
    const [apis, setApis] = useState([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('body');
    const [envCredentials, setEnvCredentials] = useState({
        clientId: false,
        apiKey: false
    });
    const [requestData, setRequestData] = useState({
        url: '',
        headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        },
        body: ''
    });
    const [response, setResponse] = useState(null);

    useEffect(() => {
        console.log('React app mounted!');
        console.log('Fetching API configuration from /api/config...');

        const fetchConfig = async () => {
            setInitialLoading(true);
            setError(null);

            try {
                // First, check what credentials are available on the server
                try {
                    const envRes = await axios.get('/api/env-status');
                    console.log('Environment credentials available:', envRes.data.available);
                    setEnvCredentials(envRes.data.available);
                } catch (envError) {
                    console.warn('Could not fetch environment status:', envError);
                }

                const res = await axios.get('/api/config');
                console.log('API config loaded successfully:', res.data);
                setApis(res.data.apis);

                // Select first endpoint by default
                if (res.data.apis.length > 0 && res.data.apis[0].endpoints.length > 0) {
                    const firstApi = res.data.apis[0];
                    const firstEndpoint = firstApi.endpoints[0];

                    setSelectedEndpoint({ ...firstEndpoint, api: firstApi });
                    setResponse(null);

                    const fullUrl = `${firstApi.baseUrl}${firstEndpoint.path}`;

                    // Set headers based on what's available in environment
                    const defaultHeaders = {
                        'Content-Type': 'application/json'
                    };

                    // Only show Authorization if NOT available in environment
                    // JPMC_API_KEY contains the JWT Bearer token
                    if (!envCredentials.apiKey) {
                        defaultHeaders['Authorization'] = 'Bearer YOUR_ACCESS_TOKEN';
                    }

                    // Only show credential fields if NOT available in environment
                    if (!envCredentials.clientId) {
                        defaultHeaders['X-Client-Id'] = 'YOUR_CLIENT_ID';
                    }

                    setRequestData({
                        url: fullUrl,
                        headers: defaultHeaders,
                        body: firstEndpoint.samplePayload ? JSON.stringify(firstEndpoint.samplePayload, null, 2) : ''
                    });
                }
                setInitialLoading(false);
            } catch (error) {
                console.error('Error fetching config:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load API configuration';
                setError(errorMessage);
                setInitialLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const selectEndpoint = (endpoint, api) => {
        setSelectedEndpoint({ ...endpoint, api });
        setResponse(null);

        const fullUrl = `${api.baseUrl}${endpoint.path}`;

        // Set headers based on what's available in environment
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // Only show Authorization if NOT available in environment
        // JPMC_API_KEY contains the JWT Bearer token
        if (!envCredentials.apiKey) {
            defaultHeaders['Authorization'] = 'Bearer YOUR_ACCESS_TOKEN';
        }

        // Only show credential fields if NOT available in environment
        if (!envCredentials.clientId) {
            defaultHeaders['X-Client-Id'] = 'YOUR_CLIENT_ID';
        }

        setRequestData({
            url: fullUrl,
            headers: defaultHeaders,
            body: endpoint.samplePayload ? JSON.stringify(endpoint.samplePayload, null, 2) : ''
        });
    };

    const sendRequest = async () => {
        if (!selectedEndpoint) return;

        console.log('=== SENDING REQUEST ===');
        console.log('Selected endpoint:', selectedEndpoint);
        console.log('Request data:', requestData);

        setLoading(true);
        setResponse(null);

        try {
            // Build headers - exclude credentials that come from environment
            const headersToSend = { ...requestData.headers };

            // Remove Authorization if it will be injected by server (JPMC_API_KEY is the JWT)
            if (envCredentials.apiKey) {
                delete headersToSend['Authorization'];
                console.log('Authorization will be provided by server environment (JWT from JPMC_API_KEY)');
            }

            // Remove X-Client-Id if it will be injected by server
            if (envCredentials.clientId) {
                delete headersToSend['X-Client-Id'];
                console.log('X-Client-Id will be provided by server environment');
            }

            const payload = {
                method: selectedEndpoint.method,
                url: requestData.url,
                headers: headersToSend
            };

            if (requestData.body && selectedEndpoint.method !== 'GET') {
                try {
                    payload.body = JSON.parse(requestData.body);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    throw new Error('Invalid JSON in request body');
                }
            }

            console.log('Sending to /api/proxy with payload:', payload);
            const res = await axios.post('/api/proxy', payload);
            console.log('Received response from proxy:', res);
            setResponse(res.data);
        } catch (error) {
            console.error('=== REQUEST ERROR ===');
            console.error('Error:', error);
            console.error('Error response:', error.response);

            setResponse({
                status: error.response?.status || 500,
                statusText: error.response?.statusText || 'Error',
                data: {
                    error: error.message,
                    details: error.response?.data || null
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const updateHeader = (key, value) => {
        setRequestData(prev => ({
            ...prev,
            headers: {
                ...prev.headers,
                [key]: value
            }
        }));
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(requestData.body);
            setRequestData(prev => ({
                ...prev,
                body: JSON.stringify(parsed, null, 2)
            }));
        } catch (e) {
            alert('Invalid JSON');
        }
    };

    // Show loading state
    if (initialLoading) {
        return (
            <div className="app">
                <div className="loading-container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div className="spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading API Configuration...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="app">
                <div className="error-container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '40px'
                }}>
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '20px',
                        maxWidth: '600px',
                        width: '100%'
                    }}>
                        <h2 style={{ color: '#991b1b', marginBottom: '10px' }}>Error Loading Application</h2>
                        <p style={{ color: '#7f1d1d', marginBottom: '15px' }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Check browser console (F12) for more details
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h1>JP Morgan Payments</h1>
                    <p>API Testing Portal</p>
                </div>

                {apis.map(api => (
                    <div key={api.id} className="api-section">
                        <div className="api-section-title">{api.name}</div>
                        {api.endpoints.map(endpoint => (
                            <div
                                key={endpoint.id}
                                className={`endpoint-item ${selectedEndpoint?.id === endpoint.id ? 'active' : ''}`}
                                onClick={() => selectEndpoint(endpoint, api)}
                            >
                                <span className={`endpoint-method ${endpoint.method.toLowerCase()}`}>
                                    {endpoint.method}
                                </span>
                                <span className="endpoint-name">{endpoint.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="main-content">
                {selectedEndpoint ? (
                    <>
                        <div className="content-header">
                            <h2>{selectedEndpoint.name}</h2>
                            <p>{selectedEndpoint.description}</p>
                        </div>

                        <div className="content-body">
                            {/* Endpoint Info */}
                            <div className="section">
                                <h3 className="section-title">Endpoint Details</h3>
                                <div className="info-box">
                                    <div className="info-row">
                                        <div className="info-label">Method</div>
                                        <div className="info-value">
                                            <span className={`endpoint-method ${selectedEndpoint.method.toLowerCase()}`}>
                                                {selectedEndpoint.method}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Base URL</div>
                                        <div className="info-value">{selectedEndpoint.api.baseUrl}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Path</div>
                                        <div className="info-value">{selectedEndpoint.path}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Builder */}
                            <div className="section">
                                <h3 className="section-title">Try It Out</h3>
                                <div className="request-builder">
                                    <div className="request-builder-header">
                                        <span className="request-builder-title">Request Configuration</span>
                                        <div className="tab-group">
                                            <button
                                                className={`tab ${activeTab === 'body' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('body')}
                                            >
                                                Body
                                            </button>
                                            <button
                                                className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('headers')}
                                            >
                                                Headers
                                            </button>
                                        </div>
                                    </div>

                                    <div className="request-builder-body">
                                        {/* URL Input */}
                                        <div className="form-group">
                                            <label className="form-label">Request URL</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={requestData.url}
                                                onChange={(e) => setRequestData(prev => ({ ...prev, url: e.target.value }))}
                                                placeholder="https://api-sandbox.payments.jpmorgan.com/..."
                                            />
                                        </div>

                                        {/* Body Tab */}
                                        {activeTab === 'body' && selectedEndpoint.method !== 'GET' && (
                                            <div className="form-group">
                                                <label className="form-label">Request Body (JSON)</label>
                                                <div className="code-editor">
                                                    <textarea
                                                        value={requestData.body}
                                                        onChange={(e) => setRequestData(prev => ({ ...prev, body: e.target.value }))}
                                                        placeholder="Enter JSON payload..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Headers Tab */}
                                        {activeTab === 'headers' && (
                                            <div>
                                                {/* Info banner if credentials come from environment */}
                                                {(envCredentials.clientId || envCredentials.apiKey) && (
                                                    <div style={{
                                                        backgroundColor: '#f0f9ff',
                                                        border: '1px solid #bae6fd',
                                                        borderRadius: '6px',
                                                        padding: '12px',
                                                        marginBottom: '16px',
                                                        fontSize: '14px',
                                                        color: '#0369a1'
                                                    }}>
                                                        <strong>ℹ️ Credentials from Environment</strong>
                                                        <div style={{ marginTop: '6px', fontSize: '13px' }}>
                                                            {envCredentials.apiKey && '• Authorization: Using JWT Bearer token from JPMC_API_KEY'}
                                                            {envCredentials.apiKey && <br />}
                                                            {envCredentials.clientId && '• X-Client-Id: Using value from JPMC_CLIENT_ID'}
                                                            <div style={{ marginTop: '6px', fontStyle: 'italic' }}>
                                                                These credentials are automatically injected by the server and never exposed to the client.
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {Object.entries(requestData.headers).map(([key, value]) => (
                                                    <div key={key} className="form-group">
                                                        <label className="form-label">{key}</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={value}
                                                            onChange={(e) => updateHeader(key, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="button-group">
                                            <button
                                                className="btn btn-primary"
                                                onClick={sendRequest}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        ▶ Send Request
                                                    </>
                                                )}
                                            </button>
                                            {activeTab === 'body' && (
                                                <button className="btn btn-secondary" onClick={formatJson}>
                                                    Format JSON
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Response Viewer */}
                            {response && (
                                <div className="section">
                                    <h3 className="section-title">Response</h3>
                                    <div className="response-viewer">
                                        <div className="response-header">
                                            <div className="response-status">
                                                <span className={`status-badge ${response.status < 400 ? 'success' : 'error'}`}>
                                                    {response.status} {response.statusText}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="response-body">
                                            <div className="response-code">
                                                <pre>{JSON.stringify(response.data, null, 2)}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!response && !loading && (
                                <div className="section">
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📡</div>
                                        <div className="empty-state-text">
                                            Configure your request above and click "Send Request" to see the response
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;