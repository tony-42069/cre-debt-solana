# CRE-Debt-Solana Platform

A decentralized commercial real estate lending platform built on Solana. This platform enables property owners to access up to 90% of their property equity through blockchain-based secured debt instruments using USDC.

## 🎯 Platform Overview

CRE-Debt-Solana bridges traditional commercial real estate finance with DeFi by offering:

- **Higher LTV Ratios**: Up to 90% LTV (vs. traditional 65-75%)
- **Fast Processing**: Blockchain automation reduces settlement from weeks to minutes
- **Stablecoin Payments**: USDC disbursements for immediate utility
- **Non-Securities Structure**: Pure debt instruments avoid securities classification
- **Full Compliance**: UCC filings and KYC/AML integration

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/tony-42069/cre-debt-solana.git
cd cre-debt-solana

# Start the full stack
docker compose up -d

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:4000
# API Docs: http://localhost:4000/api-docs
```

### Option 2: Manual Setup

```bash
# Install dependencies
cd api && npm install
cd ../app && npm install

# Configure environment
cp .env.example .env

# Start services
cd api && npm run dev
cd ../app && npm run dev
```

## 📁 Project Structure

```
cre-debt-solana/
├── app/                    # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and stores
│   │   └── providers/     # Context providers
│   └── public/            # Static assets
├── api/                    # Express.js Backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── prisma/            # Database schema & migrations
├── programs/              # Solana Smart Contracts
│   ├── loan-core/        # Core loan logic
│   ├── property-registry/ # Property management
│   └── borrower-registry/ # Borrower KYC
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD pipelines
```

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Zustand |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 |
| Blockchain | Solana, Anchor Framework, Rust |
| Smart Contracts | loan-core, property-registry, borrower-registry |
| Authentication | Wallet-based (Phantom, Solflare) |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                       │
│   Pages: Home | Properties | Loans | Dashboard | Payments    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express.js)                     │
│   REST API | Wallet Auth | Validation | Webhooks | Logging   │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │   Solana     │  │   Redis      │
│  (Prisma)    │  │  Blockchain  │  │  (Caching)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 🔑 Key Features

### For Property Owners (Borrowers)
- Property registration and verification
- Loan application with real-time LTV calculator
- Amortization schedule visualization
- USDC payment processing
- Dashboard with payment tracking

### For Lenders
- Browse available loan opportunities
- Due diligence tools
- Portfolio management
- Performance analytics

### For Platform Administrators
- Borrower KYC verification
- Loan approval workflow
- Platform configuration
- Analytics and reporting

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](./docs/API.md) - Complete API reference
- [Architecture](./docs/ARCHITECTURE.md) - System design and data flows
- [User Guides](./docs/user-guides/)
  - [Borrower Guide](./docs/user-guides/BORROWER.md)
  - [Lender Guide](./docs/user-guides/LENDER.md)
  - [Admin Guide](./docs/user-guides/ADMIN.md)

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Docker 24.0+
- Solana CLI tools
- Anchor Framework

### Running Tests

```bash
# Smart contract tests
cd programs/loan-core
anchor test

# Backend tests
cd api
npm test

# Frontend tests
cd app
npm test
```

### Building

```bash
# Build smart contracts
anchor build

# Build frontend
cd app && npm run build

# Build backend
cd api && npm run build
```

## 🔐 Security

- **Wallet Authentication**: TweetNaCl signature verification
- **Input Validation**: Zod schemas with server-side enforcement
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origin validation
- **File Upload**: Type allowlist and size limits

## 📊 Monitoring

The platform includes comprehensive monitoring:

- **Health Endpoints**: `/health`, `/health/live`, `/health/ready`
- **Metrics**: `/metrics` (Prometheus format)
- **Logging**: Structured JSON logs with Winston
- **Dashboard**: Real-time platform statistics

## 🚢 Deployment

### Production Deployment

See the [Deployment Guide](./docs/DEPLOYMENT.md) for:

- Docker Compose deployment
- Kubernetes configuration
- Environment setup
- SSL/TLS configuration
- Database migrations
- Backup and recovery

### Environment Variables

```bash
# Copy template
cp .env.example .env

# Required variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
SOLANA_CLUSTER=mainnet-beta
SOLANA_RPC_URL=https://...
```

## 📈 Smart Contracts

### Loan Core Program
- `initialize_platform` - Set platform parameters
- `create_loan` - Create loan application
- `approve_loan` - Admin approval
- `fund_loan` - Fund approved loan
- `process_payment` - Handle payments
- `mark_delinquent` - Mark late loans
- `mark_defaulted` - Mark defaulted loans

### Cross-Program Invocations
- Property Registry (property verification)
- Borrower Registry (KYC status)
- Token Program (USDC transfers)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- Create an issue on GitHub
- Check documentation in [docs/](docs/)
- Review [FAQ](./docs/FAQ.md)

---

**Built with ❤️ on Solana**
