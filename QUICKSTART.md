# Quick Start Guide

Get up and running with the JPMorgan Payments API Tester in minutes!

## 🚀 Quick Setup (Development)

### Option 1: Using the setup script

```bash
# Make the script executable (if not already)
chmod +x setup.sh

# Run the setup script
./setup.sh

# Edit .env with your credentials
nano .env  # or use your preferred editor

# Start the backend (Terminal 1)
npm run dev

# Start the frontend (Terminal 2)
cd client
npm start
```

### Option 2: Manual setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Copy environment template
cp .env.example .env

# Edit .env with your API credentials
# JPMC_CLIENT_ID=your_client_id
# JPMC_CLIENT_SECRET=your_client_secret
# JPMC_API_KEY=your_api_key

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2)
cd client && npm start
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

## 🧪 Testing the APIs

1. **Select an Endpoint**
   - Browse the sidebar
   - Click on "Create Wire Payment" or "Create ACH Payment"

2. **Configure Request**
   - The request body is pre-filled with sample data
   - Update the Authorization header with your access token
   - Modify any fields as needed

3. **Send Request**
   - Click "Send Request"
   - View the response below

## 🔐 Getting API Credentials

You need to obtain credentials from JPMorgan's Developer Portal:

1. Visit [JPMorgan Developer Portal](https://developer.payments.jpmorgan.com)
2. Register for an account
3. Create a new application
4. Copy your credentials:
   - Client ID
   - Client Secret
   - API Key

## 🔑 Getting an Access Token

Before making API calls, you need an OAuth access token:

```bash
# Example using curl
curl -X POST https://api-sandbox.payments.jpmorgan.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Copy the `access_token` from the response and use it in the Authorization header:
```
Bearer YOUR_ACCESS_TOKEN
```

## 📝 Sample Request

### Wire Payment Example

```json
{
  "clientReferenceId": "WIRE-1234567890",
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
  "requestedExecutionDate": "2024-12-01"
}
```

### ACH Payment Example

```json
{
  "clientReferenceId": "ACH-1234567890",
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
  "effectiveDate": "2024-12-01",
  "companyName": "Test Company",
  "companyId": "1234567890"
}
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in .env
PORT=3002
```

### Authentication errors
- Verify your credentials in .env
- Ensure your access token is valid and not expired
- Check that you're using the sandbox environment

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm cache clean --force
npm install
cd client && npm install
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out JPMorgan's API documentation
- Explore different endpoints in the sidebar
- Test various scenarios with different payloads

## 🔗 Related Tools

### JPMorgan MCP Server for Documentation

Need help understanding the APIs? JPMorgan provides an official MCP server that gives you access to their documentation:

```bash
# Quick install
git clone https://github.com/jpmorgan-payments/pdp-mcp
cd pdp-mcp/mcp-for-api-documentation
pip install uv && uv venv && uv pip install -e .
python -m jpmc.mcp_for_api_documentation.server
```

Use the MCP server to **read documentation** while using this tool to **test APIs**!

## 💡 Tips

- Use the "Format JSON" button to clean up your request body
- Switch between Body and Headers tabs to configure different aspects
- The sample payloads are automatically generated with current timestamps
- Copy successful responses for your integration code
- Test in sandbox before moving to production

---

Need help? Check the [README.md](README.md) or open an issue on GitHub.
