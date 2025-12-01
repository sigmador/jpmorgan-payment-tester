# Changelog

All notable changes to the JPMorgan Payments API Tester project.

## [1.1.0] - 2024-11-25

### Added
- Reference to JPMorgan's official MCP server for documentation access
- Related Tools section in README.md
- Integration guide for using MCP server alongside API tester
- CHANGELOG.md file for tracking project changes

### Changed
- Updated all deployment documentation to reference `master` branch instead of `main`
- Enhanced README.md with MCP server integration information
- Improved QUICKSTART.md with MCP server setup instructions
- Updated DEPLOYMENT.md with master branch references

### Documentation
- Clarified the difference between Treasury Services APIs (Wires/ACH) and Commerce APIs
- Added note that MCP server is for documentation access, not API testing
- Improved git setup instructions in README.md

## [1.0.0] - 2024-11-24

### Added
- Initial release of JPMorgan Payments API Tester
- Professional readme.io-inspired UI
- Support for Wires API (2 endpoints)
- Support for ACH API (3 endpoints)
- React 18 frontend application
- Express.js backend with API proxy
- Pre-configured sample payloads for all endpoints
- JSON formatting and validation
- Header management for authentication
- Real-time response viewer with status badges
- Comprehensive documentation suite:
  - README.md
  - QUICKSTART.md
  - DEPLOYMENT.md
  - USAGE_GUIDE.md
  - PROJECT_SUMMARY.md
- Deployment configurations:
  - Render (render.yaml)
  - Heroku (Procfile)
  - Docker (documentation)
  - AWS EC2 (documentation)
- Setup automation script (setup.sh)
- Environment configuration template (.env.example)

### Features

#### Frontend
- Sidebar navigation with color-coded HTTP methods
- Tabbed interface (Body/Headers)
- Dark-themed code editor
- Response viewer with syntax highlighting
- Loading states and error handling
- Responsive mobile design

#### Backend
- Express server with CORS support
- API proxy for handling JPMorgan API requests
- Health check endpoint
- Configuration endpoint for API metadata
- Environment-based configuration

#### Developer Experience
- One-command setup script
- Hot reload in development
- Production build optimization
- Comprehensive error messages
- Sample payloads with current timestamps

## API Coverage

### Wires API
- **POST** Create Wire Payment - `/tsapi/v1/payments/payment-orders`
- **GET** Get Wire Status - `/tsapi/v1/payments/payment-orders/{paymentId}`

### ACH API
- **POST** Create ACH Payment - `/tsapi/v1/payments/ach`
- **GET** Get ACH Status - `/tsapi/v1/payments/ach/{transactionId}`
- **POST** Create ACH Batch - `/tsapi/v1/payments/ach/batch`

## Repository Structure

```
jpmorgan-payment-tester/
├── server.js              # Express backend
├── package.json           # Server dependencies
├── client/               # React frontend
│   ├── src/
│   │   ├── App.js       # Main application
│   │   └── App.css      # Styling
│   └── package.json
├── documentation/        # Complete docs
└── deployment/          # Deploy configs
```

## Acknowledgments

This project complements JPMorgan's official tools:
- **JPMorgan MCP Server**: For accessing API documentation
- **JPMorgan Payments Developer Portal**: Official API documentation

## Notes

- This is a development and testing tool
- Not an official JPMorgan product
- Requires valid JPMorgan API credentials
- Always use sandbox environment for testing
- Follow JPMorgan's API usage guidelines

---

For detailed information about each version, see the corresponding documentation files.
