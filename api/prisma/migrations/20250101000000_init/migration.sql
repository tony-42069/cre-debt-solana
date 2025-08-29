-- Create custom types (enums)
CREATE TYPE "EntityType" AS ENUM ('INDIVIDUAL', 'LLC', 'CORPORATION', 'TRUST', 'PARTNERSHIP');
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "PropertyType" AS ENUM ('OFFICE', 'RETAIL', 'INDUSTRIAL', 'MULTIFAMILY', 'HOSPITALITY', 'LAND', 'SPECIALTY');
CREATE TYPE "ValuationMethod" AS ENUM ('APPRAISAL', 'AVM', 'INCOME', 'SALES_COMPARISON', 'COST_APPROACH');
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ACTIVE', 'INACTIVE');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'FUNDED', 'ACTIVE', 'DELINQUENT', 'DEFAULTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentType" AS ENUM ('PRINCIPAL', 'INTEREST', 'FEE', 'LATE_FEE', 'PREPAYMENT', 'FULL_PAYMENT');
CREATE TYPE "PaymentMethod" AS ENUM ('USDC_TRANSFER', 'WIRE_TRANSFER', 'ACH', 'CHECK');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "entityType" "EntityType" NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kycVerifiedAt" TIMESTAMP(3),
    "kycProvider" TEXT,
    "riskScore" INTEGER DEFAULT 500,
    "totalBorrowed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "activeLoans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create properties table
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "appraisedValue" DECIMAL(65,30) NOT NULL,
    "ltvRatio" DECIMAL(65,30),
    "valuationDate" TIMESTAMP(3) NOT NULL,
    "valuationMethod" "ValuationMethod" NOT NULL,
    "valuationProvider" TEXT NOT NULL,
    "valuationReport" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "blockchainTx" TEXT,
    "smartContractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- Create loan_applications table
CREATE TABLE "loan_applications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "requestedAmount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "ltvRatio" DECIMAL(65,30) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "purpose" TEXT,
    "additionalDocs" TEXT,
    "notes" TEXT,
    "blockchainTx" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- Create loans table
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "principalAmount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "ltvRatio" DECIMAL(65,30) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "fundedAt" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "nextPaymentDue" TIMESTAMP(3),
    "totalPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingBalance" DECIMAL(65,30) NOT NULL,
    "originationFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "daysPastDue" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentDate" TIMESTAMP(3),
    "defaultedAt" TIMESTAMP(3),
    "foreclosureStarted" TIMESTAMP(3),
    "smartContractId" TEXT,
    "blockchainTx" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- Create payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "principalPortion" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "interestPortion" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "feePortion" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "blockchainTx" TEXT,
    "blockNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Create platform_config table
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL,
    "authorityWallet" TEXT NOT NULL,
    "treasuryWallet" TEXT NOT NULL,
    "tokenAccount" TEXT NOT NULL,
    "maxLtvRatio" DECIMAL(65,30) NOT NULL DEFAULT 0.9,
    "minLoanAmount" DECIMAL(65,30) NOT NULL DEFAULT 100000,
    "maxLoanAmount" DECIMAL(65,30) NOT NULL DEFAULT 10000000,
    "originationFee" DECIMAL(65,30) NOT NULL DEFAULT 0.01,
    "servicingFee" DECIMAL(65,30) NOT NULL DEFAULT 0.002,
    "minInterestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "maxInterestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.15,
    "defaultInterestRate" DECIMAL(65,30) NOT NULL DEFAULT 0.08,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 30,
    "lateFeeRate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "defaultThreshold" INTEGER NOT NULL DEFAULT 90,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- Create audit_logs table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "walletAddress" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "blockchainTx" TEXT,
    "blockNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "properties_propertyId_key" ON "properties"("propertyId");
CREATE UNIQUE INDEX "loan_applications_applicationId_key" ON "loan_applications"("applicationId");
CREATE UNIQUE INDEX "loans_loanId_key" ON "loans"("loanId");
CREATE UNIQUE INDEX "loans_applicationId_key" ON "loans"("applicationId");
CREATE UNIQUE INDEX "payments_paymentId_key" ON "payments"("paymentId");
CREATE UNIQUE INDEX "platform_config_authorityWallet_key" ON "platform_config"("authorityWallet");
CREATE UNIQUE INDEX "platform_config_treasuryWallet_key" ON "platform_config"("treasuryWallet");
CREATE UNIQUE INDEX "platform_config_tokenAccount_key" ON "platform_config"("tokenAccount");

-- Create foreign key constraints
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
