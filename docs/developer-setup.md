# CRE-Debt-Solana: Developer Setup Guide

This guide provides step-by-step instructions for setting up the development environment for the CRE-Debt-Solana platform.

## Development Environment

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 20GB free space minimum
- **CPU**: Quad-core processor or better recommended

### Required Software

- **Git**: Version control
- **Rust**: For smart contract development
- **Solana CLI**: For interacting with Solana blockchain
- **Anchor Framework**: For Solana program development
- **Node.js**: For backend and frontend development
- **Yarn**: Package manager for JavaScript
- **PostgreSQL**: Database for backend services
- **VS Code**: Recommended editor (with Rust and Solana extensions)

## Installation Steps

### 1. Install Git

**Windows**:
- Download and install from [git-scm.com](https://git-scm.com/download/win)

**macOS**:
```bash
brew install git
```

**Linux**:
```bash
sudo apt update
sudo apt install git
```

### 2. Install Rust

Follow the instructions at [rustup.rs](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, add Rust to your PATH:
```bash
source $HOME/.cargo/env
```

### 3. Install Solana CLI

Follow the instructions at [docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools):

**Linux/macOS**:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

**Windows**:
Download and install from [Solana Releases](https://github.com/solana-labs/solana/releases)

Verify installation:
```bash
solana --version
```

Configure Solana for development:
```bash
solana config set --url localhost
```

### 4. Install Anchor Framework

**Prerequisites**: Ensure Rust and Solana CLI are installed.

```bash
cargo install --git https://github.com/project-serum/anchor avm --locked
avm install latest
avm use latest
```

Verify installation:
```bash
anchor --version
```

### 5. Install Node.js and Yarn

**Node.js** (v16 or later recommended):
- Download and install from [nodejs.org](https://nodejs.org/)

**Yarn**:
```bash
npm install -g yarn
```

Verify installations:
```bash
node --version
yarn --version
```

### 6. Install PostgreSQL

**Windows/macOS**:
- Download and install from [postgresql.org](https://www.postgresql.org/download/)

**Linux**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Start PostgreSQL service:
```bash
# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql
```

### 7. Setup VS Code (Recommended)

1. Download and install from [code.visualstudio.com](https://code.visualstudio.com/)

2. Install recommended extensions:
   - Rust Analyzer
   - Solana
   - Better TOML
   - ESLint
   - Prettier
   - GitHub Copilot (optional)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cre-debt-solana.git
cd cre-debt-solana
```

### 2. Set Up Smart Contracts

```bash
# Install dependencies
cd programs
cargo build

# Build Anchor programs
cd ..
anchor build
```

Update the program IDs in `Anchor.toml` and `declare_id!()` statements in your Rust programs with the values from:

```bash
solana address -k target/deploy/loan_core-keypair.json
solana address -k target/deploy/property_registry-keypair.json
solana address -k target/deploy/borrower_registry-keypair.json
```

### 3. Set Up Backend

```bash
cd api
yarn install

# Create and configure environment file
cp .env.example .env
```

Edit `.env` file to configure:
- Database connection
- Solana RPC URL
- Admin wallet addresses
- USDC mint address (for local testing)

Initialize the database:
```bash
yarn db:migrate
yarn db:seed
```

### 4. Set Up Frontend

```bash
cd ../app
yarn install

# Create and configure environment file
cp .env.example .env
```

Edit `.env` file to configure:
- API endpoint
- Solana RPC URL
- USDC mint address (for local testing)

## Running the Project

### 1. Start Local Solana Validator

```bash
solana-test-validator
```

### 2. Deploy Smart Contracts

```bash
# From project root
anchor deploy
```

### 3. Start Backend API

```bash
cd api
yarn dev
```

The API should be available at `http://localhost:3001`

### 4. Start Frontend

```bash
cd ../app
yarn dev
```

The frontend should be available at `http://localhost:3000`

## Testing

### Smart Contract Tests

```bash
# From project root
anchor test
```

### Backend Tests

```bash
cd api
yarn test
```

### Frontend Tests

```bash
cd app
yarn test
```

## Local Development Workflow

1. **Create a Solana wallet**:
   ```bash
   solana-keygen new -o wallet.json
   ```

2. **Fund the wallet**:
   ```bash
   solana airdrop 2 $(solana address -k wallet.json) --url localhost
   ```

3. **Create a test USDC mint**:
   ```bash
   # Script is available in scripts/create-test-usdc.js
   node scripts/create-test-usdc.js
   ```

4. **Initialize the platform**:
   ```bash
   # Script is available in scripts/initialize-platform.js
   node scripts/initialize-platform.js
   ```

5. **Create test data**:
   ```bash
   # Script is available in scripts/create-test-data.js
   node scripts/create-test-data.js
   ```

## Common Issues and Solutions

### 1. Solana Program Deployment Errors

**Issue**: `Error: Transaction simulation failed: Error processing Instruction 0`

**Solution**: Check your program size. Solana has a limit of 10KB for on-chain programs. Consider:
- Using program optimization flags
- Breaking functionality into multiple programs
- Using account compression

### 2. Anchor Build Errors

**Issue**: `error[E0433]: failed to resolve: use of undeclared type or module`

**Solution**: Ensure all dependencies are correctly specified in `Cargo.toml` and imports are correct.

### 3. Database Connection Issues

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: Ensure PostgreSQL service is running and credentials in `.env` are correct.

### 4. Wallet Connection Issues

**Issue**: Frontend can't connect to wallet

**Solution**: 
- Ensure you have a browser wallet extension installed (e.g., Phantom, Solflare)
- Check that you're connecting to the correct Solana network in wallet settings
- Verify wallet adapter configuration in `app/src/contexts/WalletContext.tsx`

## Development Best Practices

1. **Branch Strategy**:
   - `main`: Production-ready code
   - `dev`: Development branch
   - Feature branches: `feature/feature-name`
   - Bug fix branches: `bugfix/bug-name`

2. **Commit Messages**:
   Follow conventional commits format:
   ```
   feat: add loan creation functionality
   fix: correct interest calculation
   docs: update README with setup instructions
   ```

3. **Pull Request Process**:
   - Create a PR from your feature branch to `dev`
   - Ensure tests pass
   - Get code review from at least one team member
   - Squash and merge when approved

4. **Code Style**:
   - Rust: Follow Rust style guide
   - JavaScript/TypeScript: Use Prettier and ESLint with project config
   - Document public functions and complex logic

## Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework Documentation](https://docs.rs/anchor-lang/latest/anchor_lang/)
- [Solana Cookbook](https://solanacookbook.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For development support, contact:
- Technical questions: [dev@example.com](mailto:dev@example.com)
- Project management: [pm@example.com](mailto:pm@example.com)
