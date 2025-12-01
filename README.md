# JPMorgan Payments API Tester

A professional API testing tool for JPMorgan's Payment APIs, featuring Wires and ACH endpoints. Built with a modern readme.io-inspired interface for easy testing and integration.

![JPMorgan API Tester](https://img.shields.io/badge/JPMorgan-API_Tester-blue)

## Features

- ✨ **Professional UI** - Clean, readme.io-inspired interface
- 🔌 **Multiple APIs** - Support for Wires and ACH APIs
- 🧪 **Interactive Testing** - Send real requests to sandbox endpoints
- 📝 **Request Builder** - Easy-to-use payload editor with JSON formatting
- 📊 **Response Viewer** - Clear visualization of API responses
- 🔐 **Authentication** - Built-in header management for API keys
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Supported APIs

### Wires API
- Create Wire Payment
- Get Wire Status

### ACH API
- Create ACH Payment
- Get ACH Status
- Create ACH Batch

## Tech Stack

**Frontend:**
- React 18
- Axios for HTTP requests
- CSS3 with modern design patterns

**Backend:**
- Node.js & Express
- Axios for API proxying
- CORS support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- JPMorgan API credentials (for production use)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd jpmorgan-payment-tester

# Or if starting fresh:
# git init
# (add the project files)
# git add .
# git commit -m "Initial commit"
# git remote add origin <your-github-repo-url>
# git push -u origin master
```

### 2. Install server dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your JPMorgan API credentials:

```env
PORT=3001
NODE_ENV=development

JPMC_CLIENT_ID=your_client_id_here
JPMC_CLIENT_SECRET=your_client_secret_here
JPMC_API_KEY=your_api_key_here
```

## Running the Application

### Development Mode

**Start the backend server:**
```bash
npm run dev
```

**In a new terminal, start the React frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Mode

**Build the React app:**
```bash
npm run build:client
```

**Start the production server:**
```bash
NODE_ENV=production npm start
```

The application will be available at http://localhost:3001

## Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command:** `npm install && npm run install:client && npm run build:client`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables in the Render dashboard
5. Deploy!

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JPMC_CLIENT_ID=your_client_id
heroku config:set JPMC_CLIENT_SECRET=your_client_secret

# Deploy
git push heroku master
```

## Usage

### 1. Select an API Endpoint
- Browse the sidebar to see available APIs
- Click on any endpoint to view its details

### 2. Configure Your Request
- Review the pre-filled sample payload
- Modify the JSON body as needed
- Update headers (especially the Authorization token)
- Edit the request URL if necessary

### 3. Send the Request
- Click "Send Request" button
- View the response status and body
- Copy response data for your records

### 4. Test Different Scenarios
- Switch between endpoints
- Try different payload variations
- Test error handling with invalid data

## API Configuration

The application comes pre-configured with sample payloads for each endpoint. You can customize these in `server.js`:

```javascript
const JPMC_CONFIG = {
  sandbox: {
    baseUrl: 'https://api-sandbox.payments.jpmorgan.com',
    wiresPath: '/tsapi/v1/payments/payment-orders',
    achPath: '/tsapi/v1/payments/ach'
  }
};
```

## Authentication

JPMorgan APIs require authentication. Update the headers in the UI:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json",
  "X-Client-Id": "YOUR_CLIENT_ID"
}
```

To obtain an access token, you'll need to:
1. Register with JPMorgan Developer Portal
2. Create an application
3. Use OAuth 2.0 to get an access token
4. Include the token in all API requests

## Project Structure

```
jpmorgan-payment-tester/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Application styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server.js              # Express backend
├── package.json           # Server dependencies
├── .env.example           # Environment template
└── README.md
```

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit `.env` files or API credentials to version control
- Always use environment variables for sensitive data
- Use the sandbox environment for testing
- Rotate API keys regularly
- Implement proper authentication on the server side for production
- Add rate limiting for production deployments
- Validate all input data before sending to APIs

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change it in `.env`:
```env
PORT=3002
```

### CORS Errors
The server includes CORS middleware. If you still encounter issues, check your browser console and ensure the proxy is correctly configured in `client/package.json`.

### API Authentication Errors
- Verify your credentials are correct
- Check that your access token hasn't expired
- Ensure you're using the correct environment (sandbox vs production)

### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

## Adding More APIs

To add additional JPMorgan APIs:

1. Update the API configuration in `server.js`:
```javascript
apis.push({
    id: 'new-api',
    name: 'New API',
    description: 'Description of the new API',
    baseUrl: JPMC_CONFIG.sandbox.baseUrl,
    endpoints: [
        {
            id: 'new-endpoint',
            method: 'POST',
            path: '/path/to/endpoint',
            name: 'Endpoint Name',
            description: 'Endpoint description',
            samplePayload: {}
        }
    ]
});
```

2. Restart the server to see your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review JPMorgan's API documentation
- Open an issue on GitHub

## Acknowledgments

- Built for testing JPMorgan Payment APIs
- UI inspired by readme.io API documentation
- Created with React and Express

## Related Tools

### JPMorgan MCP Server for Documentation

JPMorgan provides an official MCP (Model Context Protocol) server that gives you access to their Payments Developer Portal documentation. This is a complementary tool that helps you:

- **Search** API documentation
- **Read** documentation pages in Markdown format
- **Discover** related documentation

**Repository:** [jpmorgan-payments/pdp-mcp](https://github.com/jpmorgan-payments/pdp-mcp)

**Use Case:** While this API tester helps you **test live API endpoints**, the MCP server helps you **access documentation** to understand the APIs. Use both together for the best development experience!

**Quick Setup:**
```bash
# Clone the MCP server
git clone https://github.com/jpmorgan-payments/pdp-mcp
cd pdp-mcp/mcp-for-api-documentation

# Install and run
pip install uv
uv venv
uv pip install -e .
python -m jpmc.mcp_for_api_documentation.server
```

---

**Note:** This is a testing tool for development purposes. Always follow JPMorgan's API usage guidelines and terms of service.
