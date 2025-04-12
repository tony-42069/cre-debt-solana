# CRE-Debt-Solana: Project Structure

This document outlines the recommended project structure for the CRE-Debt-Solana platform, including directory organization, file naming conventions, and code management best practices.

## Root Directory Structure

```
cre-debt-solana/
├── .github/                  # GitHub workflows and templates
├── programs/                 # Solana smart contracts
│   ├── loan-core/            # Main loan program
│   ├── property-registry/    # Property registry program
│   └── borrower-registry/    # Borrower registry program
├── app/                      # Frontend application
│   ├── public/               # Static assets
│   └── src/                  # Frontend source code
├── api/                      # Backend API services
│   └── src/                  # API source code
├── tests/                    # End-to-end and integration tests
├── scripts/                  # Deployment and utility scripts
├── docs/                     # Documentation
│   ├── architecture/         # Architecture diagrams
│   └── api/                  # API documentation
├── sdk/                      # Client SDK for integration
│   └── src/                  # SDK source code
├── .gitignore                # Git ignore file
├── Anchor.toml               # Anchor configuration
├── Cargo.toml                # Rust package configuration
├── package.json              # Node.js package configuration
└── README.md                 # Project overview
```

## Smart Contract Structure

The `programs/` directory contains Solana programs developed using the Anchor framework:

```
programs/
├── loan-core/                # Main loan program
│   ├── src/
│   │   ├── lib.rs            # Program entry point
│   │   ├── state/            # Program state definitions
│   │   │   ├── loan.rs       # Loan account structure
│   │   │   ├── payment.rs    # Payment account structure
│   │   │   └── config.rs     # Platform configuration
│   │   ├── instructions/     # Program instructions
│   │   │   ├── create_loan.rs # Create loan instruction
│   │   │   ├── approve_loan.rs # Approve loan instruction
│   │   │   ├── fund_loan.rs  # Fund loan instruction
│   │   │   └── ...           # Other instructions
│   │   ├── error.rs          # Error definitions
│   │   └── events.rs         # Event definitions
│   ├── Cargo.toml            # Package manifest
│   └── Xargo.toml            # Cross-compilation configuration
├── property-registry/        # Property registry program
│   ├── src/
│   │   ├── lib.rs            # Program entry point
│   │   ├── state/            # Program state definitions
│   │   ├── instructions/     # Program instructions
│   │   ├── error.rs          # Error definitions
│   │   └── events.rs         # Event definitions
│   ├── Cargo.toml            # Package manifest
│   └── Xargo.toml            # Cross-compilation configuration
└── borrower-registry/        # Borrower registry program
    ├── src/
    │   ├── lib.rs            # Program entry point
    │   ├── state/            # Program state definitions
    │   ├── instructions/     # Program instructions
    │   ├── error.rs          # Error definitions
    │   └── events.rs         # Event definitions
    ├── Cargo.toml            # Package manifest
    └── Xargo.toml            # Cross-compilation configuration
```

## Frontend Application Structure

The `app/` directory contains the React frontend application:

```
app/
├── public/                   # Static assets
│   ├── index.html            # HTML entry point
│   └── assets/               # Images, fonts, etc.
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Generic UI components
│   │   ├── borrower/         # Borrower-specific components
│   │   ├── property/         # Property-specific components
│   │   ├── loan/             # Loan-specific components
│   │   └── admin/            # Admin components
│   ├── pages/                # Main application pages
│   │   ├── Home.tsx          # Landing page
│   │   ├── Dashboard.tsx     # User dashboard
│   │   ├── PropertyList.tsx  # Property management
│   │   ├── LoanApplication.tsx # Loan application form
│   │   └── ...               # Other pages
│   ├── hooks/                # Custom React hooks
│   │   ├── useWallet.ts      # Wallet connection hook
│   │   ├── useLoan.ts        # Loan data hook
│   │   └── ...               # Other hooks
│   ├── contexts/             # React contexts
│   │   ├── WalletContext.tsx # Wallet context
│   │   └── AuthContext.tsx   # Authentication context
│   ├── services/             # API service wrappers
│   │   ├── api.ts            # API client
│   │   ├── loan.ts           # Loan service
│   │   └── ...               # Other services
│   ├── utils/                # Utility functions
│   │   ├── formatting.ts     # Data formatting utilities
│   │   ├── validation.ts     # Form validation
│   │   └── ...               # Other utilities
│   ├── types/                # TypeScript type definitions
│   │   ├── loan.ts           # Loan-related types
│   │   ├── property.ts       # Property-related types
│   │   └── ...               # Other types
│   ├── assets/               # Asset imports
│   ├── App.tsx               # Main application component
│   ├── index.tsx             # Application entry point
│   └── theme.ts              # UI theme configuration
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
├── .env.development          # Development environment variables
└── .env.production           # Production environment variables
```

## Backend API Structure

The `api/` directory contains the Node.js backend services:

```
api/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── loan.ts           # Loan-related handlers
│   │   ├── property.ts       # Property-related handlers
│   │   └── ...               # Other handlers
│   ├── models/               # Data models
│   │   ├── loan.ts           # Loan model
│   │   ├── property.ts       # Property model
│   │   └── ...               # Other models
│   ├── services/             # Business logic
│   │   ├── loan.ts           # Loan service
│   │   ├── property.ts       # Property service
│   │   ├── blockchain.ts     # Blockchain integration
│   │   └── ...               # Other services
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── validation.ts     # Request validation
│   │   └── ...               # Other middleware
│   ├── utils/                # Utility functions
│   │   ├── solana.ts         # Solana utilities
│   │   ├── crypto.ts         # Cryptographic utilities
│   │   └── ...               # Other utilities
│   ├── config/               # Configuration
│   │   ├── database.ts       # Database configuration
│   │   ├── solana.ts         # Solana RPC configuration
│   │   └── ...               # Other configurations
│   ├── routes/               # API routes
│   │   ├── loan.ts           # Loan routes
│   │   ├── property.ts       # Property routes
│   │   └── ...               # Other routes
│   ├── types/                # TypeScript type definitions
│   ├── app.ts                # Express application setup
│   └── index.ts              # Application entry point
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
├── .env.development          # Development environment variables
└── .env.production           # Production environment variables
```

## Test Structure

The `tests/` directory contains end-to-end and integration tests:

```
tests/
├── e2e/                      # End-to-end tests
│   ├── loan.test.ts          # Loan flow tests
│   ├── property.test.ts      # Property flow tests
│   └── ...                   # Other e2e tests
├── integration/              # Integration tests
│   ├── api/                  # API integration tests
│   └── blockchain/           # Blockchain integration tests
├── unit/                     # Unit tests
│   ├── loan/                 # Loan unit tests
│   ├── property/             # Property unit tests
│   └── ...                   # Other unit tests
├── fixtures/                 # Test fixtures
│   ├── loans.json            # Sample loan data
│   ├── properties.json       # Sample property data
│   └── ...                   # Other fixtures
├── helpers/                  # Test helper functions
│   ├── setup.ts              # Test setup utilities
│   ├── cleanup.ts            # Test cleanup utilities
│   └── ...                   # Other helpers
├── package.json              # Test package configuration
└── jest.config.js            # Jest configuration
```

## SDK Structure

The `sdk/` directory contains the client SDK for integration:

```
sdk/
├── src/
│   ├── loan/                 # Loan-related functionality
│   │   ├── create.ts         # Loan creation
│   │   ├── manage.ts         # Loan management
│   │   └── ...               # Other loan functions
│   ├── property/             # Property-related functionality
│   ├── borrower/             # Borrower-related functionality
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── index.ts              # SDK entry point
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # SDK documentation
```

## Documentation Structure

The `docs/` directory contains project documentation:

```
docs/
├── architecture/             # Architecture diagrams
│   ├── system-overview.md    # System overview
│   ├── data-flow.md          # Data flow diagrams
│   └── component-diagram.md  # Component diagrams
├── api/                      # API documentation
│   ├── loan.md               # Loan API documentation
│   ├── property.md           # Property API documentation
│   └── ...                   # Other API documentation
├── smart-contracts/          # Smart contract documentation
│   ├── loan-core.md          # Loan core program documentation
│   ├── property-registry.md  # Property registry documentation
│   └── ...                   # Other contract documentation
├── user-guides/              # User guides
│   ├── borrower.md           # Borrower guide
│   ├── admin.md              # Admin guide
│   └── ...                   # Other user guides
└── development/              # Development guides
    ├── setup.md              # Development setup
    ├── contributing.md       # Contribution guidelines
    └── ...                   # Other development guides
```

## File Naming Conventions

### Rust (Smart Contracts)

- Use snake_case for file names, functions, and variables
- Use CamelCase for struct and enum names
- Use SCREAMING_SNAKE_CASE for constants
- Instruction files should be named after the action they perform (e.g., `create_loan.rs`)
- State files should be named after the state they represent (e.g., `loan.rs`)

### TypeScript/JavaScript (Frontend and Backend)

- Use camelCase for variables, functions, and file names
- Use PascalCase for React components, classes, and interfaces
- Use kebab-case for CSS files and class names
- React component files should have a .tsx extension
- Service and utility files should have a .ts extension

## Git Workflow

- Use feature branches for new features
- Name branches with descriptive prefixes (e.g., `feature/loan-approval`, `bugfix/payment-calculation`)
- Create pull requests for code reviews
- Squash and merge when merging into the main branch
- Tag releases with semantic versioning

## Version Control Best Practices

- Commit early and often
- Write meaningful commit messages
- Structure commit messages with a summary line and detailed description
- Reference issues in commit messages when applicable
- Keep commits focused on a single change

## Environment Variables

Store environment-specific configuration in .env files:

```
# .env.development

# Solana
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_SOLANA_NETWORK=devnet

# API
REACT_APP_API_URL=http://localhost:3001/api

# USDC
REACT_APP_USDC_MINT=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
```

## Dependency Management

- Use specific versions in package.json and Cargo.toml
- Audit dependencies regularly for security issues
- Minimize external dependencies when possible
- Document the purpose of each dependency

By following this structure, the CRE-Debt-Solana platform will maintain a clean, organized codebase that facilitates efficient development and collaboration during the hackathon and beyond.
