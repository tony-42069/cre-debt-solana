# CRE-Debt-Solana Platform

A decentralized platform for commercial real estate equity access on Solana. This platform enables property owners to access up to 90% of their property equity through blockchain-based secured debt instruments.

## 🏢 Project Overview

The CRE-Debt-Solana platform bridges traditional commercial real estate finance with DeFi by offering:

- Higher LTV ratios (up to 90%) compared to traditional 65-75% caps
- Faster processing through blockchain automation
- Stablecoin (USDC) disbursements for immediate utility
- Structured as pure debt instruments to avoid securities classification
- Full compliance with legal requirements through UCC filings and KYC/AML

## 🏗️ Architecture

The platform consists of three main components:

1. **Smart Contracts**: Solana programs written in Rust using the Anchor framework that handle loan origination, servicing, and management.
2. **Backend API**: Node.js services that manage off-chain data, property valuation, document generation, and interface with the blockchain.
3. **Frontend Application**: React-based user interface for property owners to access the platform.

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html)
- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://yarnpkg.com/getting-started/install)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cre-debt-solana.git
cd cre-debt-solana
```

2. Install dependencies
```bash
# Install smart contract dependencies
cd programs/loan-core
cargo build

# Install frontend dependencies
cd ../../app
yarn install

# Install backend dependencies
cd ../api
yarn install
```

3. Configure environment
```bash
# Copy environment template files
cp .env.example .env
```

### Running Locally

1. Start local Solana validator
```bash
solana-test-validator
```

2. Deploy smart contracts
```bash
anchor deploy
```

3. Start backend API
```bash
cd api
yarn start
```

4. Start frontend application
```bash
cd app
yarn start
```

## 📖 Documentation

- [Architecture Overview](./docs/architecture/system-overview.md)
- [Smart Contract Specification](./docs/smart-contracts/loan-core.md)
- [API Documentation](./docs/api/loan.md)
- [User Guide](./docs/user-guides/borrower.md)
- [Development Guide](./docs/development/setup.md)

## 🧪 Testing

```bash
# Run smart contract tests
anchor test

# Run backend tests
cd api
yarn test

# Run frontend tests
cd app
yarn test
```

## 🛣️ Roadmap

### Phase 1: MVP (Hackathon)
- Core loan origination and servicing functionality
- Basic borrower dashboard
- Property submission and valuation
- UCC filing integration

### Phase 2: Institutional Lender Integration
- Lender marketplace for institutional capital
- Advanced risk assessment models
- Loan syndication features
- Secondary market for loans

### Phase 3: Advanced Features
- Cross-chain integration
- Advanced treasury management
- Automated compliance monitoring
- Market analytics and reporting

## 💼 Legal and Regulatory Compliance

The platform is designed to comply with relevant regulations:

- Wyoming registration for smart contract recognition
- UCC-1 filings for secured interests
- KYC/AML compliance built-in
- Structured as pure debt instruments to avoid securities classification

## 👥 Team

- [Name] - Project Lead / Financial Expert
- [Name] - Smart Contract Developer
- [Name] - Backend Developer
- [Name] - Frontend Developer
- [Name] - Full-stack Developer

## 📄 License

This project is licensed under the [MIT License](LICENSE)
