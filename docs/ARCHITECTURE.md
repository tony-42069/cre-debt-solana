# Architecture Documentation

## System Overview

CRE-Debt-Solana is a decentralized commercial real estate lending platform built on Solana. The system enables:

- Property verification and valuation
- Borrower KYC and risk assessment
- Loan origination and management
- USDC-based lending and payments
- Cross-program invocations between smart contracts

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Pages   │  │  Forms   │  │  Wallet  │  │  Charts  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴─────────────┴─────────────┘                │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                             │
│              │   API Service       │                             │
│              │   (Express.js)      │                             │
│              └──────────┬──────────┘                             │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Controllers │  │  Services    │  │  Middleware  │           │
│  │  - Properties│  │  - Monitoring│  │  - Auth      │           │
│  │  - Loans     │  │  - Events    │  │  - Validation│           │
│  │  - Payments  │  │  - Blockchain│  │  - Rate Limit│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Database (PostgreSQL)                  │   │
│  │   users | properties | borrowers | loans | payments       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Blockchain Layer                           │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  Loan Core     │  │ Property       │  │ Borrower       │     │
│  │  Program       │  │ Registry       │  │ Registry       │     │
│  │  - Loans       │  │ - Properties   │  │ - Borrowers    │     │
│  │  - Payments    │  │ - Verification │  │ - KYC          │     │
│  │  - Amortization│  │                │  │                │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│           │                   │                   │              │
│           └───────────────────┴───────────────────┘              │
│                           │                                      │
│                           ▼                                      │
│              ┌──────────────────────────┐                        │
│              │   Solana Validator       │                        │
│              │   (USDC Token Program)   │                        │
│              └──────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Wallet**: @solana/wallet-adapter
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: express-validator
- **Documentation**: Swagger UI
- **Logging**: Winston

### Smart Contracts
- **Framework**: Anchor (Solana)
- **Language**: Rust
- **Programs**:
  - `loan-core`: Core loan logic
  - `property-registry`: Property management
  - `borrower-registry`: Borrower KYC

## Data Flow

### Loan Creation Flow
```
1. Borrower initiates loan application
2. Frontend submits to API (/api/loans)
3. API validates property ownership
4. API calculates LTV ratio
5. Smart contract creates loan account
6. Loan status set to PENDING
7. Platform admin reviews application
8. Admin approves/rejects via smart contract
9. Approved loans become FUNDABLE
10. Lender funds loan via smart contract
11. USDC transferred to borrower
12. Loan status set to ACTIVE
```

### Payment Flow
```
1. Borrower initiates payment
2. Frontend submits payment request (/api/payments)
3. API validates loan status and amount
4. Borrower signs transaction with wallet
5. Smart contract processes USDC transfer
6. Payment split: interest to treasury, principal to reduce balance
7. Payment recorded in database
8. Loan balance updated
9. If fully paid -> loan status COMPLETED
```

## Database Schema

### Users
- `id`: UUID
- `walletAddress`: String (PK)
- `email`: String
- `role`: Enum (ADMIN, BORROWER, LENDER)
- `isActive`: Boolean
- `createdAt`: DateTime

### Properties
- `id`: UUID
- `propertyId`: String (PK)
- `ownerId`: UUID (FK -> Users)
- `propertyType`: Enum
- `address`, `city`, `state`, `zipCode`: String
- `appraisedValue`: BigInt
- `verified`: Boolean
- `createdAt`: DateTime

### Borrowers
- `id`: UUID
- `borrowerId`: String (PK)
- `wallet`: String
- `entityType`: Int
- `kycStatus`: Enum
- `riskScore`: Int
- `activeLoans`: Int
- `totalBorrowed`: BigInt

### Loans
- `id`: UUID
- `loanId`: String (PK)
- `borrowerId`: UUID (FK -> Borrowers)
- `propertyId`: UUID (FK -> Properties)
- `principalAmount`: BigInt
- `interestRate`: Int (basis points)
- `termMonths`: Int
- `status`: Enum
- `remainingBalance`: BigInt

### Payments
- `id`: UUID
- `paymentId`: String (PK)
- `loanId`: UUID (FK -> Loans)
- `amount`: BigInt
- `principalPortion`: BigInt
- `interestPortion`: BigInt
- `status`: Enum
- `transactionSignature`: String

## Smart Contract Architecture

### Loan Core Program
- **State**: PlatformConfig, Loan accounts
- **Instructions**:
  - `initialize_platform`: Set platform parameters
  - `create_loan`: Create new loan application
  - `approve_loan`: Admin approves loan
  - `fund_loan`: Lender funds approved loan
  - `process_payment`: Handle loan payments
  - `mark_delinquent`: Mark late payments
  - `mark_defaulted`: Mark defaulted loans

### Cross-Program Invocations
```
Loan Core
  ├── Property Registry (read property data)
  ├── Borrower Registry (read borrower data)
  └── Token Program (USDC transfers)
```

## Security Measures

1. **Wallet Authentication**
   - Signature verification with tweetnacl
   - Message signing for sensitive operations

2. **Input Validation**
   - Zod schemas for all inputs
   - Server-side validation

3. **Rate Limiting**
   - 100 requests per 15 minutes
   - Per-IP tracking

4. **CORS Configuration**
   - Whitelist-based origin validation
   - Credentials control

5. **File Upload Security**
   - Type allowlist validation
   - Size limits (10MB)
   - Path traversal protection

## Deployment Architecture

```
                                    ┌─────────────────┐
                                    │   Cloudflare    │
                                    │   (CDN + WAF)   │
                                    └────────┬────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │                                               │
                     ▼                                               ▼
            ┌─────────────────┐                             ┌─────────────────┐
            │   Vercel        │                             │   Railway       │
            │   (Frontend)    │                             │   (API)         │
            └─────────────────┘                             └────────┬────────┘
                                                                     │
                                                                     ▼
                                                            ┌─────────────────┐
                                                            │   PostgreSQL    │
                                                            │   (Neon/Supabase)│
                                                            └─────────────────┘
```

## Monitoring Stack

- **Logs**: Winston → files + external (Datadog)
- **Metrics**: Prometheus format endpoint
- **Health Checks**: /health endpoint
- **Alerts**: On-call rotation with PagerDuty
