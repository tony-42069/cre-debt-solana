# API Documentation

## Base URL

**Development**: `http://localhost:4000`
**Production**: `https://api.yourdomain.com`

## Authentication

All protected endpoints require wallet authentication:

```typescript
Headers:
  Content-Type: application/json
  X-Wallet-Address: <wallet_public_key>
  X-Wallet-Signature: <signed_message>
  X-Wallet-Message: <original_message>
```

## Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Full health check with all service statuses |
| GET | `/health/live` | Simple liveness probe |
| GET | `/health/ready` | Readiness probe with database check |
| GET | `/metrics` | Prometheus metrics |

### Properties

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/properties` | List all properties | No |
| GET | `/api/properties/:id` | Get property details | No |
| POST | `/api/properties` | Create property listing | Yes |
| PUT | `/api/properties/:id` | Update property | Yes |
| DELETE | `/api/properties/:id` | Delete property | Yes |

**Request Body (POST/PUT)**:
```json
{
  "propertyId": "string",
  "propertyType": "COMMERCIAL|MIXED_USE|OFFICE|RETAIL|INDUSTRIAL",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "appraisedValue": number,
  "squareFootage": number,
  "units": number,
  "yearBuilt": number
}
```

### Borrowers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/borrowers` | List all borrowers | Admin |
| GET | `/api/borrowers/:id` | Get borrower details | Yes |
| POST | `/api/borrowers` | Register new borrower | Yes |
| PUT | `/api/borrowers/:id/kyc` | Update KYC status | Admin |
| PUT | `/api/borrowers/:id/risk-score` | Update risk score | Admin |

**Request Body (POST)**:
```json
{
  "borrowerId": "string",
  "entityType": 1|2|3,
  "metadataUri": "string"
}
```

### Loans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/loans` | List all loans | Yes |
| GET | `/api/loans/:id` | Get loan details | Yes |
| POST | `/api/loans` | Create loan application | Yes |
| POST | `/api/loans/:id/approve` | Approve loan | Admin |
| POST | `/api/loans/:id/reject` | Reject loan | Admin |
| POST | `/api/loans/:id/fund` | Fund approved loan | Lender |
| GET | `/api/loans/stats` | Get loan statistics | Admin |

**Request Body (POST)**:
```json
{
  "loanId": "string",
  "propertyId": "string",
  "principalAmount": number,
  "interestRate": number,
  "termMonths": number,
  "balloonPayment": number
}
```

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/payments` | List all payments | Yes |
| GET | `/api/payments/:id` | Get payment details | Yes |
| POST | `/api/payments` | Make a payment | Yes |
| GET | `/api/payments/loan/:loanId` | Get payments for loan | Yes |

**Request Body (POST)**:
```json
{
  "loanId": "string",
  "amount": number,
  "paymentType": "PRINCIPAL|INTEREST|FULL"
}
```

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/stats` | Get platform statistics | Admin |
| GET | `/api/dashboard/activity` | Recent activity feed | Yes |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/blockchain` | Receive blockchain events |

**Webhook Events**:
- `LoanCreatedEvent`
- `LoanApprovedEvent`
- `LoanFundedEvent`
- `PaymentProcessedEvent`
- `LoanDelinquentEvent`
- `LoanDefaultedEvent`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per IP
- Headers included in response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
