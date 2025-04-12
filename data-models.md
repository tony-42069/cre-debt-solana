# CRE-Debt-Solana: Data Models

This document outlines the core data models for the CRE-Debt-Solana platform, including both on-chain smart contract data structures and off-chain database models.

## Smart Contract Data Models

### Loan Data Structure

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
```

### Payment Data Structure

```rust
#[account]
pub struct Payment {
    pub loan_id: String,            // Reference to parent loan
    pub payment_number: u16,        // Sequential payment number
    pub timestamp: i64,             // When payment was made
    pub amount: u64,                // Total payment amount
    pub principal_portion: u64,     // Portion applied to principal
    pub interest_portion: u64,      // Portion applied to interest
    pub fees_portion: u64,          // Portion applied to fees
    pub status: PaymentStatus,      // Payment status
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

### Borrower Data Structure

```rust
#[account]
pub struct Borrower {
    pub wallet_address: Pubkey,      // Borrower's wallet
    pub kyc_verified: bool,          // KYC verification status
    pub kyc_timestamp: i64,          // When KYC was completed
    pub entity_type: EntityType,     // Individual, LLC, etc.
    pub active_loans_count: u16,     // Number of active loans
    pub total_borrowed_amount: u64,  // Total principal across all loans
    pub borrower_score: u16,         // Internal risk score (future)
    pub metadata_uri: String,        // IPFS URI to additional data
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EntityType {
    Individual,
    SoleProprietorship,
    LimitedLiabilityCompany,
    Corporation,
    Partnership,
    Trust,
    Other,
}
```

## Off-Chain Database Models

### Property

```typescript
interface Property {
  id: string;                    // Unique identifier
  borrowerId: string;            // Reference to borrower
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  propertyType: PropertyType;    // Office, retail, industrial, etc.
  squareFootage: number;         // Total area in sq ft
  yearBuilt: number;             // Construction year
  lastRenovated?: number;        // Last major renovation
  occupancyRate: number;         // Current occupancy (0-100)
  
  // Valuation
  assessedValue: number;         // Current assessed value in USD
  assessmentDate: Date;          // When valuation was performed
  assessmentMethod: AssessmentMethod; // How value was determined
  
  // Income
  annualIncome: number;          // Gross annual income in USD
  netOperatingIncome: number;    // NOI in USD
  capRate: number;               // Capitalization rate (0-100)
  
  // Existing Financing
  existingMortgageAmount?: number; // Current mortgage balance
  existingMortgageLender?: string; // Current lender
  existingMortgageRate?: number;   // Current interest rate
  existingMortgageMaturity?: Date; // Maturity date
  
  // Documents
  titleDocumentUri: string;      // IPFS URI to title document
  appraisalDocumentUri?: string; // IPFS URI to appraisal
  photoUris: string[];           // IPFS URIs to property photos
  additionalDocuments: {
    name: string;
    uri: string;
    type: string;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: PropertyStatus;
}

enum PropertyType {
  Office = 'OFFICE',
  Retail = 'RETAIL',
  Industrial = 'INDUSTRIAL',
  MultiFamily = 'MULTI_FAMILY',
  Hospitality = 'HOSPITALITY',
  MixedUse = 'MIXED_USE',
  Land = 'LAND',
  SpecialPurpose = 'SPECIAL_PURPOSE',
}

enum AssessmentMethod {
  Automated = 'AUTOMATED',
  ThirdPartyAppraisal = 'THIRD_PARTY_APPRAISAL',
  BrokerPriceOpinion = 'BROKER_PRICE_OPINION',
  TaxAssessment = 'TAX_ASSESSMENT',
  Internal = 'INTERNAL',
}

enum PropertyStatus {
  Active = 'ACTIVE',
  Pending = 'PENDING',
  UnderReview = 'UNDER_REVIEW',
  Rejected = 'REJECTED',
  Archived = 'ARCHIVED',
}
```

### Borrower Profile

```typescript
interface BorrowerProfile {
  id: string;                  // Unique identifier
  walletAddress: string;       // Blockchain wallet address
  
  // Entity Information
  entityType: EntityType;      // Individual, LLC, etc.
  entityName: string;          // Legal name
  formationState?: string;     // State of formation for entities
  taxIdNumber: string;         // EIN or SSN (encrypted)
  
  // Contact Information
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
  };
  
  // Business Information
  businessAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  yearsInBusiness: number;     // Years of operation
  industryCode: string;        // NAICS code
  annualRevenue: number;       // Annual revenue in USD
  employeeCount: number;       // Number of employees
  
  // Financial Information
  creditScore?: number;        // Business credit score
  financialStatements: {
    year: number;
    uri: string;               // IPFS URI to statement
    type: FinancialStatementType;
  }[];
  
  // KYC/AML
  kycStatus: KycStatus;
  kycVerificationDate?: Date;
  kycReferenceId?: string;     // Reference to KYC provider
  amlStatus: AmlStatus;
  amlCheckDate?: Date;
  
  // Platform Data
  totalLoanCount: number;      // Total loans on platform
  activeLoanCount: number;     // Current active loans
  totalBorrowedAmount: number; // Historical total in USD
  currentDebtAmount: number;   // Current debt in USD
  accountStanding: AccountStanding;
  
  // Documents
  organizationalDocuments: {
    name: string;
    uri: string;
    type: string;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

enum EntityType {
  Individual = 'INDIVIDUAL',
  SoleProprietorship = 'SOLE_PROPRIETORSHIP',
  LimitedLiabilityCompany = 'LIMITED_LIABILITY_COMPANY',
  Corporation = 'CORPORATION',
  Partnership = 'PARTNERSHIP',
  Trust = 'TRUST',
  Other = 'OTHER',
}

enum FinancialStatementType {
  TaxReturn = 'TAX_RETURN',
  BalanceSheet = 'BALANCE_SHEET',
  IncomeStatement = 'INCOME_STATEMENT',
  CashFlowStatement = 'CASH_FLOW_STATEMENT',
  Other = 'OTHER',
}

enum KycStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Verified = 'VERIFIED',
  Failed = 'FAILED',
  Expired = 'EXPIRED',
}

enum AmlStatus {
  NotChecked = 'NOT_CHECKED',
  Cleared = 'CLEARED',
  FlagsPresent = 'FLAGS_PRESENT',
  Rejected = 'REJECTED',
}

enum AccountStanding {
  Good = 'GOOD',
  Warning = 'WARNING',
  Probation = 'PROBATION',
  Suspended = 'SUSPENDED',
  Terminated = 'TERMINATED',
}
```

### Loan Application

```typescript
interface LoanApplication {
  id: string;                      // Unique identifier
  borrowerId: string;              // Reference to borrower
  propertyId: string;              // Reference to property
  
  // Loan Request
  requestedAmount: number;         // Requested principal in USD
  requestedTermMonths: number;     // Requested duration
  purposeOfFunds: LoanPurpose;     // Intended use of funds
  purposeDescription: string;      // Detailed description
  
  // Calculated Fields
  propertyValue: number;           // Assessed value
  existingLiens: number;           // Value of existing liens
  availableEquity: number;         // Value minus liens
  maxLoanAmount: number;           // Based on LTV policy
  proposedLtv: number;             // Calculated LTV ratio
  
  // Terms
  proposedInterestRate: number;    // Proposed rate
  proposedOriginationFee: number;  // Proposed fee
  proposedPaymentSchedule: PaymentFrequency;
  estimatedMonthlyPayment: number; // Estimated payment
  
  // Application Status
  status: ApplicationStatus;
  statusUpdateDate: Date;
  underwriterNotes: string;
  
  // Risk Assessment
  riskScore: number;               // Internal risk score
  riskFactors: string[];           // Risk flags
  
  // Legal
  uccFilingState: string;          // State for UCC filing
  uccFilingNumber?: string;        // UCC reference number
  loanDocumentsGenerated: boolean; // Doc generation status
  
  // Workflow
  applicationDate: Date;
  lastUpdated: Date;
  approvalDate?: Date;
  fundingDate?: Date;
  declineReason?: string;
  
  // Blockchain Reference
  onChainLoanId?: string;          // Reference to on-chain loan
  onChainTransactionSignature?: string; // Blockchain transaction
}

enum LoanPurpose {
  Acquisition = 'ACQUISITION',
  Refinance = 'REFINANCE',
  Renovation = 'RENOVATION',
  BusinessExpansion = 'BUSINESS_EXPANSION',
  EquipmentPurchase = 'EQUIPMENT_PURCHASE',
  WorkingCapital = 'WORKING_CAPITAL',
  DebtConsolidation = 'DEBT_CONSOLIDATION',
  Other = 'OTHER',
}

enum ApplicationStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW',
  PendingAdditionalInfo = 'PENDING_ADDITIONAL_INFO',
  Approved = 'APPROVED',
  ApprovedWithConditions = 'APPROVED_WITH_CONDITIONS',
  Declined = 'DECLINED',
  Withdrawn = 'WITHDRAWN',
  Funded = 'FUNDED',
}

enum PaymentFrequency {
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Semiannual = 'SEMIANNUAL',
  Annual = 'ANNUAL',
  BulletPayment = 'BULLET_PAYMENT',
}
```

### UCC Filing

```typescript
interface UccFiling {
  id: string;                    // Unique identifier
  loanId: string;                // Reference to loan
  borrowerId: string;            // Reference to borrower
  
  // Filing Details
  filingState: string;           // State where filed
  filingCounty?: string;         // County if applicable
  filingNumber: string;          // Official filing number
  filingDate: Date;              // Date of filing
  expirationDate: Date;          // Expiration date
  
  // Collateral
  collateralDescription: string; // Legal description
  collateralType: CollateralType[];
  
  // Secured Party
  securedPartyName: string;      // Lender entity name
  securedPartyAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Debtor
  debtorName: string;            // Borrower entity name
  debtorAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Filing Status
  status: UccFilingStatus;
  amendmentHistory: {
    amendmentType: AmendmentType;
    amendmentDate: Date;
    description: string;
  }[];
  
  // Documents
  filingDocumentUri: string;     // IPFS URI to filing document
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

enum CollateralType {
  AllAssets = 'ALL_ASSETS',
  Equipment = 'EQUIPMENT',
  Inventory = 'INVENTORY',
  AccountsReceivable = 'ACCOUNTS_RECEIVABLE',
  Fixtures = 'FIXTURES',
  IntellectualProperty = 'INTELLECTUAL_PROPERTY',
  InvestmentProperty = 'INVESTMENT_PROPERTY',
  OtherCollateral = 'OTHER',
}

enum UccFilingStatus {
  Pending = 'PENDING',
  Filed = 'FILED',
  Amended = 'AMENDED',
  Terminated = 'TERMINATED',
  Expired = 'EXPIRED',
  Rejected = 'REJECTED',
}

enum AmendmentType {
  Continuation = 'CONTINUATION',
  Assignment = 'ASSIGNMENT',
  TerminationStatement = 'TERMINATION_STATEMENT',
  CollateralChange = 'COLLATERAL_CHANGE',
  DebtorInformationChange = 'DEBTOR_INFORMATION_CHANGE',
  SecuredPartyChange = 'SECURED_PARTY_CHANGE',
  Other = 'OTHER',
}
```

These data models provide a comprehensive foundation for the platform, covering both on-chain smart contract structures and off-chain database models. The models are designed to capture all relevant information for commercial real estate loans while maintaining the flexibility needed for future expansion.
