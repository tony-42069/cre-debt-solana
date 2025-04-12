# CRE-Debt-Solana: Smart Contract Specification

This document outlines the specifications for the Solana smart contracts that will power the CRE-Debt-Solana platform. The contracts will be developed using the Anchor framework and Rust programming language.

## Program Architecture

The smart contract system will be organized into several programs that work together:

1. **LoanCore** - Primary program for loan origination and management
2. **USDCAdapter** - Interface with USDC token for disbursements and repayments
3. **PropertyRegistry** - Store property data and verification status (off-chain storage with on-chain references)
4. **BorrowerRegistry** - Manage borrower information and KYC status

## State Accounts

### LoanCore Program

#### Loan Account

Primary account storing loan data:

```rust
#[account]
pub struct Loan {
    // Metadata
    pub loan_id: String,          // Unique identifier
    pub creation_timestamp: i64,  // Unix timestamp
    pub status: LoanStatus,       // Enum for loan status
    
    // Parties
    pub borrower: Pubkey,         // Borrower's wallet address
    pub lender: Pubkey,           // Lender's wallet address (platform initially)
    
    // Property & Collateral
    pub property_id: String,      // Reference to property in off-chain DB
    pub property_value: u64,      // Assessed value in USD cents
    pub ltv_ratio: u16,           // LTV in basis points (e.g., 9000 = 90%)
    pub collateral_type: CollateralType, // Enum for collateral type
    
    // Loan Terms
    pub principal_amount: u64,    // Loan amount in USDC (in smallest units)
    pub interest_rate: u16,       // Annual interest rate in basis points
    pub term_months: u8,          // Loan duration in months
    pub payment_frequency: PaymentFrequency, // Enum for payment schedule
    pub origination_fee: u16,     // Fee in basis points
    
    // Payment Tracking
    pub next_payment_due: i64,    // Unix timestamp
    pub total_payments_made: u64, // Total amount paid to date
    pub remaining_principal: u64, // Outstanding principal
    
    // Legal & Compliance
    pub legal_doc_hash: [u8; 32], // Hash of legal documentation
    pub ucc_filing_reference: String, // Reference to UCC filing
    pub kyc_verified: bool,       // KYC verification status
    
    // Additional
    pub bumps: LoanBumps,         // PDAs bump seeds
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Pending,    // Application submitted, not yet approved
    Approved,   // Approved but not funded
    Active,     // Funded and in good standing
    Delinquent, // Payment(s) overdue
    Default,    // In default status
    Completed,  // Fully repaid
    Cancelled,  // Cancelled before funding
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CollateralType {
    BusinessAssets, // General business assets
    Equipment,      // Specific equipment
    Inventory,      // Inventory
    AccountsReceivable, // A/R
    Mixed,          // Multiple types
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentFrequency {
    Monthly,
    Quarterly,
    Semiannual,
    Annual,
    BulletPayment, // Single payment at end of term
}

#[account]
pub struct LoanBumps {
    pub loan_bump: u8,
    pub vault_bump: u8,
}

#### Payment Account

Tracks individual payments on a loan:

```rust
#[account]
pub struct Payment {
    pub loan: Pubkey,              // Reference to loan account
    pub payment_number: u16,       // Sequential payment number
    pub timestamp: i64,            // When payment was made
    pub amount: u64,               // Total payment amount
    pub principal_portion: u64,    // Portion applied to principal
    pub interest_portion: u64,     // Portion applied to interest
    pub fees_portion: u64,         // Portion applied to fees
    pub status: PaymentStatus,     // Payment status
    pub transaction_signature: [u8; 64], // Solana transaction signature
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Scheduled,  // Future payment
    Completed,  // Successfully processed
    Partial,    // Partial payment received
    Late,       // Received after due date
    Missed,     // Not received
}
```

#### Platform Config Account

Platform-wide configuration parameters:

```rust
#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,        // Admin authority
    pub treasury: Pubkey,         // Treasury wallet for fees
    pub max_ltv: u16,             // Maximum LTV in basis points (9000 = 90%)
    pub min_loan_amount: u64,     // Minimum loan size
    pub max_loan_amount: u64,     // Maximum loan size
    pub origination_fee: u16,     // Default origination fee in basis points
    pub servicing_fee: u16,       // Servicing fee in basis points
    pub min_interest_rate: u16,   // Minimum interest rate in basis points
    pub default_interest_rate: u16, // Default interest rate in basis points
    pub late_fee_rate: u16,       // Late fee in basis points
    pub grace_period_days: u8,    // Payment grace period in days
    pub treasury_token_account: Pubkey, // USDC account for fees
    pub paused: bool,             // Emergency pause switch
}
```

#### Lender Account (Future Phase)

Account for institutional lenders:

```rust
#[account]
pub struct Lender {
    pub wallet: Pubkey,           // Lender's wallet address
    pub name: String,             // Lender's name
    pub verified: bool,           // Verification status
    pub total_commitment: u64,    // Total commitment amount
    pub available_funds: u64,     // Available funds for lending
    pub min_loan_amount: u64,     // Minimum loan size
    pub max_loan_amount: u64,     // Maximum loan size
    pub min_interest_rate: u16,   // Minimum interest rate in basis points
    pub max_ltv: u16,             // Maximum LTV in basis points
    pub active_loans_count: u32,  // Number of active loans
    pub total_funded_amount: u64, // Total funded amount
    pub kyc_verified: bool,       // KYC verification status
    pub token_account: Pubkey,    // USDC token account
}
```

### PropertyRegistry Program

#### Property Account

On-chain reference to property data:

```rust
#[account]
pub struct Property {
    pub owner: Pubkey,            // Property owner's wallet
    pub property_id: String,      // Unique identifier
    pub value: u64,               // Assessed value in USD cents
    pub valuation_date: i64,      // Valuation timestamp
    pub valuation_method: u8,     // Method used for valuation
    pub valuation_provider: String, // Entity that provided valuation
    pub property_type: u8,        // Type of property
    pub location_hash: [u8; 32],  // Hash of location data
    pub metadata_uri: String,     // IPFS URI for extended data
    pub active_loan: Option<Pubkey>, // Reference to active loan if any
    pub verified: bool,           // Verification status
}
```

### BorrowerRegistry Program

#### Borrower Account

On-chain borrower data:

```rust
#[account]
pub struct Borrower {
    pub wallet: Pubkey,           // Borrower's wallet address
    pub borrower_id: String,      // Unique identifier
    pub entity_type: u8,          // Type of entity
    pub kyc_status: u8,           // KYC verification status
    pub kyc_timestamp: i64,       // When KYC was completed
    pub active_loans: u16,        // Number of active loans
    pub total_borrowed: u64,      // Total amount borrowed
    pub metadata_uri: String,     // IPFS URI for extended data
    pub risk_score: u16,          // Internal risk score
}
```

## Key Instructions

### LoanCore Program

```rust
pub fn initialize(
    ctx: Context<Initialize>,
    config: PlatformConfigParams,
) -> Result<()>
```
Initializes the platform with configuration parameters.

```rust
pub fn create_loan(
    ctx: Context<CreateLoan>,
    params: LoanParams,
) -> Result<()>
```
Creates a new loan with the specified parameters.

```rust
pub fn approve_loan(
    ctx: Context<ApproveLoan>,
    loan_id: String,
) -> Result<()>
```
Approves a pending loan application.

```rust
pub fn fund_loan(
    ctx: Context<FundLoan>,
    loan_id: String,
) -> Result<()>
```
Funds an approved loan, transferring USDC to the borrower.

```rust
pub fn make_payment(
    ctx: Context<MakePayment>,
    loan_id: String,
    amount: u64,
) -> Result<()>
```
Processes a loan payment from the borrower.

```rust
pub fn mark_loan_delinquent(
    ctx: Context<MarkLoanDelinquent>,
    loan_id: String,
) -> Result<()>
```
Marks a loan as delinquent after the grace period has passed.

```rust
pub fn mark_loan_default(
    ctx: Context<MarkLoanDefault>,
    loan_id: String,
) -> Result<()>
```
Marks a loan as defaulted after extended non-payment.

```rust
pub fn close_loan(
    ctx: Context<CloseLoan>,
    loan_id: String,
) -> Result<()>
```
Closes a fully repaid loan.

```rust
pub fn cancel_loan(
    ctx: Context<CancelLoan>,
    loan_id: String,
) -> Result<()>
```
Cancels a loan before funding.

```rust
pub fn update_platform_config(
    ctx: Context<UpdatePlatformConfig>,
    config: PlatformConfigParams,
) -> Result<()>
```
Updates platform-wide configuration parameters.

```rust
pub fn emergency_pause(
    ctx: Context<EmergencyPause>,
) -> Result<()>
```
Pauses all platform operations in case of emergency.

### PropertyRegistry Program

```rust
pub fn register_property(
    ctx: Context<RegisterProperty>,
    params: PropertyParams,
) -> Result<()>
```
Registers a new property on the platform.

```rust
pub fn update_property_value(
    ctx: Context<UpdatePropertyValue>,
    property_id: String,
    new_value: u64,
    valuation_date: i64,
    valuation_method: u8,
    valuation_provider: String,
) -> Result<()>
```
Updates a property's valuation.

```rust
pub fn verify_property(
    ctx: Context<VerifyProperty>,
    property_id: String,
) -> Result<()>
```
Marks a property as verified after due diligence.

### BorrowerRegistry Program

```rust
pub fn register_borrower(
    ctx: Context<RegisterBorrower>,
    params: BorrowerParams,
) -> Result<()>
```
Registers a new borrower on the platform.

```rust
pub fn update_kyc_status(
    ctx: Context<UpdateKycStatus>,
    borrower_id: String,
    kyc_status: u8,
) -> Result<()>
```
Updates a borrower's KYC verification status.

```rust
pub fn update_risk_score(
    ctx: Context<UpdateRiskScore>,
    borrower_id: String,
    risk_score: u16,
) -> Result<()>
```
Updates a borrower's internal risk score.

## Security Considerations

### Access Control

All administrative functions will be protected by a multi-signature authority structure:

```rust
#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        constraint = platform_config.authority == *admin.key,
    )]
    pub admin: Signer<'info>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
}
```

### Fund Safety

USDC tokens will be held in Program Derived Address (PDA) vaults for each loan:

```rust
#[derive(Accounts)]
pub struct FundLoan<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Approved,
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        seeds = [b"vault", loan.key().as_ref()],
        bump = loan.bumps.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub lender_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
```

### Circuit Breakers

Emergency pause functionality to freeze critical operations:

```rust
#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        constraint = platform_config.authority == *admin.key,
    )]
    pub admin: Signer<'info>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
}

pub fn emergency_pause(ctx: Context<EmergencyPause>) -> Result<()> {
    let config = &mut ctx.accounts.platform_config;
    config.paused = true;
    Ok(())
}

pub fn emergency_unpause(ctx: Context<EmergencyPause>) -> Result<()> {
    let config = &mut ctx.accounts.platform_config;
    config.paused = false;
    Ok(())
}
```

## Program Constraints

All critical instructions will include a check against the platform's paused state:

```rust
#[derive(Accounts)]
pub struct CreateLoan<'info> {
    // ... other constraints
    
    #[account(
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    // ... other accounts
}
```

## Error Handling

Comprehensive error codes for all operation failures:

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Platform is paused for maintenance or emergency")]
    PlatformPaused,
    
    #[msg("Loan amount exceeds maximum LTV ratio")]
    LtvExceeded,
    
    #[msg("Loan amount below minimum threshold")]
    LoanTooSmall,
    
    #[msg("Loan amount above maximum threshold")]
    LoanTooLarge,
    
    #[msg("KYC verification required")]
    KycRequired,
    
    #[msg("Property must be verified before loan approval")]
    PropertyVerificationRequired,
    
    #[msg("Insufficient funds in lender account")]
    InsufficientFunds,
    
    #[msg("Loan is not in the required status for this operation")]
    InvalidLoanStatus,
    
    #[msg("Payment amount is insufficient")]
    PaymentTooSmall,
    
    #[msg("Only the platform authority can perform this action")]
    UnauthorizedAccess,
    
    // ... other error codes
}
```

## Testing Strategy

The smart contracts will be thoroughly tested using:

1. **Unit Tests** - For individual instruction logic
2. **Integration Tests** - For complete loan lifecycle
3. **Property-Based Tests** - For edge cases and invariants
4. **Simulation Tests** - For realistic scenarios

Example test structure:

```rust
#[tokio::test]
async fn test_loan_lifecycle() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;
    
    // Create borrower and property
    let borrower = create_test_borrower(&mut banks_client, &payer, &recent_blockhash).await;
    let property = create_test_property(&mut banks_client, &payer, &recent_blockhash, &borrower).await;
    
    // Create loan
    let loan = create_test_loan(&mut banks_client, &payer, &recent_blockhash, &borrower, &property).await;
    
    // Approve and fund loan
    approve_test_loan(&mut banks_client, &payer, &recent_blockhash, &loan).await;
    fund_test_loan(&mut banks_client, &payer, &recent_blockhash, &loan).await;
    
    // Make payments
    make_test_payment(&mut banks_client, &payer, &recent_blockhash, &loan).await;
    
    // Close loan
    close_test_loan(&mut banks_client, &payer, &recent_blockhash, &loan).await;
}
```

## Deployment Strategy

The deployment will follow a phased approach:

1. **Devnet Deployment** - Initial testing in sandbox environment
2. **Testnet Deployment** - Public beta testing with test USDC
3. **Mainnet Beta** - Limited mainnet deployment with caps
4. **Full Mainnet** - Complete platform launch

Each deployment will include:

- Comprehensive audit results
- Documentation for all instructions
- SDK for front-end integration
- Monitoring tools for program health

## Upgrade Strategy

The programs will use the upgradeable loader to allow for future improvements:

```rust
solana program deploy --program-id <UPGRADEABLE_ID> --buffer <BUFFER_KEYPAIR>
```

Upgrades will be controlled by a multi-signature authority to ensure security.
