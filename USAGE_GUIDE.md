# Visual Usage Guide

This guide shows you how to navigate and use the JPMorgan Payments API Tester interface.

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  JP Morgan Payments API Tester                                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────────┐
│              │  Create Wire Payment                             │
│  WIRES API   │  Professional API testing interface              │
│              ├──────────────────────────────────────────────────┤
│  POST Create │  Endpoint Details                                │
│       Wire   │  Method: POST                                    │
│              │  Base URL: https://api-sandbox...                │
│  GET  Wire   │  Path: /tsapi/v1/payments/payment-orders        │
│       Status │                                                   │
│              │  Try It Out                                       │
│  ACH API     │  ┌────────────────────────────────────────────┐ │
│              │  │  Request Configuration  │ Body │ Headers │  │ │
│  POST Create │  ├────────────────────────────────────────────┤ │
│       ACH    │  │  Request URL:                              │ │
│              │  │  https://api-sandbox.payments.jpmorgan...  │ │
│  GET  ACH    │  │                                            │ │
│       Status │  │  Request Body (JSON):                      │ │
│              │  │  ┌──────────────────────────────────────┐ │ │
│  POST Batch  │  │  │ {                                    │ │ │
│       ACH    │  │  │   "clientReferenceId": "WIRE-123",  │ │ │
│              │  │  │   "paymentType": "WIRE",             │ │ │
└──────────────┤  │  │   "amount": {                        │ │ │
    Sidebar    │  │  │     "value": 1000.00                 │ │ │
               │  │  │   }                                   │ │ │
               │  │  │ }                                     │ │ │
               │  │  └──────────────────────────────────────┘ │ │
               │  │                                            │ │
               │  │  [▶ Send Request] [Format JSON]           │ │
               │  └────────────────────────────────────────────┘ │
               │                                                  │
               │  Response                                        │
               │  ┌────────────────────────────────────────────┐ │
               │  │  200 OK                                    │ │
               │  ├────────────────────────────────────────────┤ │
               │  │  {                                         │ │
               │  │    "status": "success",                    │ │
               │  │    "paymentId": "PAY-123456"               │ │
               │  │  }                                         │ │
               │  └────────────────────────────────────────────┘ │
               └──────────────────────────────────────────────────┘
```

## Step-by-Step Usage

### 1. Select an API Endpoint

**Location:** Left sidebar

```
┌──────────────┐
│ WIRES API    │ ← API Category
├──────────────┤
│ POST Create  │ ← Click to select
│      Wire    │
│              │
│ GET  Wire    │
│      Status  │
└──────────────┘
```

**What happens:**
- Endpoint details load in main area
- Sample payload appears in editor
- URL is pre-populated

### 2. Review Endpoint Details

**Location:** Top of main content area

```
┌────────────────────────────────────┐
│ Endpoint Details                   │
├────────────────────────────────────┤
│ Method:   POST                     │
│ Base URL: https://api-sandbox...   │
│ Path:     /tsapi/v1/payments/...   │
└────────────────────────────────────┘
```

### 3. Configure Your Request

#### A. Edit Request Body (Body Tab)

```
┌──────────────────────────────────────┐
│ Request Configuration  │Body│Headers││
├──────────────────────────────────────┤
│ Request URL:                         │
│ [https://api-sandbox.payments...]    │
│                                       │
│ Request Body (JSON):                 │
│ ┌──────────────────────────────────┐ │
│ │ {                                │ │
│ │   "clientReferenceId": "WIRE-X", │ │
│ │   "amount": {                    │ │
│ │     "value": 1000.00,            │ │
│ │     "currency": "USD"            │ │
│ │   },                             │ │
│ │   ...                            │ │
│ │ }                                │ │
│ └──────────────────────────────────┘ │
│                                       │
│ [▶ Send Request] [Format JSON]       │
└──────────────────────────────────────┘
```

**Tips:**
- Use "Format JSON" to clean up formatting
- Modify any field values as needed
- Reference ID auto-generates with timestamp

#### B. Update Headers (Headers Tab)

```
┌──────────────────────────────────────┐
│ Request Configuration  Body│Headers│ │
├──────────────────────────────────────┤
│ Authorization                        │
│ [Bearer YOUR_ACCESS_TOKEN]           │
│                                       │
│ Content-Type                         │
│ [application/json]                   │
│                                       │
│ X-Client-Id                          │
│ [YOUR_CLIENT_ID]                     │
└──────────────────────────────────────┘
```

**Important:**
- Replace `YOUR_ACCESS_TOKEN` with real token
- Replace `YOUR_CLIENT_ID` with your client ID
- Other headers can be customized

### 4. Send Request

```
[▶ Send Request]  ← Click here
```

**Loading state:**
```
[⟲ Sending...] ← Shows while processing
```

### 5. View Response

**Success Response:**
```
┌────────────────────────────────────┐
│ Response                           │
├────────────────────────────────────┤
│ 200 OK                          ✓  │
├────────────────────────────────────┤
│ {                                  │
│   "status": "success",             │
│   "paymentId": "PAY-123456789",    │
│   "transactionDate": "2024-11-24", │
│   "amount": 1000.00                │
│ }                                  │
└────────────────────────────────────┘
```

**Error Response:**
```
┌────────────────────────────────────┐
│ Response                           │
├────────────────────────────────────┤
│ 401 Unauthorized                ✗  │
├────────────────────────────────────┤
│ {                                  │
│   "error": "Invalid token",        │
│   "message": "Authentication..."   │
│ }                                  │
└────────────────────────────────────┘
```

## Color Coding

### HTTP Methods

- **POST** - 🟢 Green (Create operations)
- **GET** - 🔵 Blue (Read operations)
- **PUT** - 🟡 Yellow (Update operations)
- **DELETE** - 🔴 Red (Delete operations)

### Status Codes

- **2xx** - 🟢 Green badge (Success)
- **4xx/5xx** - 🔴 Red badge (Error)

## Common Workflows

### Workflow 1: Create Wire Payment

1. Click "POST Create Wire" in sidebar
2. Review the pre-filled payload
3. Update amount, account numbers
4. Switch to Headers tab
5. Add your access token
6. Click "Send Request"
7. Check response for payment ID

### Workflow 2: Create ACH Payment

1. Click "POST Create ACH" in sidebar
2. Modify the sample payload:
   - Update account numbers
   - Set effective date
   - Adjust amount
3. Add authentication headers
4. Send request
5. Save transaction ID from response

### Workflow 3: Check Payment Status

1. Click "GET Wire Status" or "GET ACH Status"
2. Update the URL with your payment ID:
   ```
   .../payment-orders/{paymentId}
   ```
3. Add authentication headers
4. Send request
5. Review status in response

### Workflow 4: Create ACH Batch

1. Click "POST Batch ACH"
2. Review batch structure:
   ```json
   {
     "batchHeader": {...},
     "transactions": [
       { transaction 1 },
       { transaction 2 }
     ]
   }
   ```
3. Add/remove transactions as needed
4. Send request
5. Check batch submission status

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter** - Send request (when in editor)
- **Ctrl/Cmd + F** - Format JSON
- **Tab** - Indent in JSON editor
- **Shift + Tab** - Outdent in JSON editor

## Tips and Tricks

### 1. Quick Testing
- Use the pre-filled samples for quick tests
- Modify only what you need
- Keep successful payloads for reference

### 2. Authentication
- Get a fresh token if requests fail with 401
- Store your token securely
- Token typically expires after 1 hour

### 3. JSON Formatting
- Always use "Format JSON" before sending
- Check for syntax errors (red highlighting)
- Validate payload structure

### 4. Debugging
- Check response status code first
- Read error messages carefully
- Verify all required fields are present
- Ensure amounts have proper decimal places

### 5. Batch Operations
- Start with 2-3 transactions
- Test single transactions first
- Validate each transaction in batch

## Error Prevention Checklist

Before sending a request:

- [ ] Valid JSON in request body
- [ ] All required fields included
- [ ] Account numbers in correct format
- [ ] Dates in ISO format (YYYY-MM-DD)
- [ ] Amounts with proper decimals
- [ ] Authentication token is current
- [ ] Client ID is correct
- [ ] Using correct endpoint URL

## Interface Sections

### Header Bar
- Purple gradient background
- Shows current endpoint name
- Displays endpoint description

### Sidebar
- White background
- Organized by API type
- Shows all available endpoints
- Active endpoint highlighted

### Main Content
- White background
- Tabbed interface (Body/Headers)
- Code editor with dark theme
- Response viewer below

### Status Indicators
- Green badge = Success (2xx)
- Red badge = Error (4xx/5xx)
- Blue spinner = Loading

---

## Need Help?

- Review **QUICKSTART.md** for setup
- Check **README.md** for full documentation
- See **DEPLOYMENT.md** for deployment guides
- Review **PROJECT_SUMMARY.md** for overview

---

**Happy Testing! 🚀**
