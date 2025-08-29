import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create platform configuration
  await prisma.platformConfig.upsert({
    where: { id: 'platform-config-001' },
    update: {},
    create: {
      id: 'platform-config-001',
      authorityWallet: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      treasuryWallet: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      tokenAccount: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      maxLtvRatio: 0.9,
      minLoanAmount: 100000,
      maxLoanAmount: 10000000,
      originationFee: 0.01,
      servicingFee: 0.002,
      minInterestRate: 0.05,
      maxInterestRate: 0.15,
      defaultInterestRate: 0.08,
      gracePeriodDays: 30,
      lateFeeRate: 0.05,
      defaultThreshold: 90,
      isActive: true,
      maintenanceMode: false,
    },
  });

  console.log('✅ Platform configuration created');

  // Create sample users (borrowers)
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '11111111111111111111111111111112' },
    update: {},
    create: {
      walletAddress: '11111111111111111111111111111112',
      email: 'john.doe@example.com',
      entityType: 'INDIVIDUAL',
      kycStatus: 'APPROVED',
      kycVerifiedAt: new Date('2024-01-15'),
      kycProvider: 'Sumsub',
      riskScore: 750,
      totalBorrowed: 1875000,
      activeLoans: 1,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { walletAddress: '22222222222222222222222222222222' },
    update: {},
    create: {
      walletAddress: '22222222222222222222222222222222',
      email: 'acme.properties@example.com',
      entityType: 'LLC',
      kycStatus: 'APPROVED',
      kycVerifiedAt: new Date('2024-01-20'),
      kycProvider: 'Sumsub',
      riskScore: 800,
      totalBorrowed: 4000000,
      activeLoans: 1,
    },
  });

  console.log('✅ Sample users created');

  // Create sample properties
  const property1 = await prisma.property.upsert({
    where: { propertyId: 'PROP-001' },
    update: {},
    create: {
      propertyId: 'PROP-001',
      ownerId: user1.id,
      propertyType: 'OFFICE',
      address: '123 Business District',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      appraisedValue: 2500000,
      ltvRatio: 0.75,
      valuationDate: new Date('2024-01-10'),
      valuationMethod: 'APPRAISAL',
      valuationProvider: 'CBRE',
      valuationReport: 'ipfs://QmReport123',
      status: 'VERIFIED',
      verified: true,
      verifiedAt: new Date('2024-01-12'),
      verifiedBy: 'platform-admin',
      blockchainTx: 'tx_abc123',
      smartContractId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    },
  });

  const property2 = await prisma.property.upsert({
    where: { propertyId: 'PROP-002' },
    update: {},
    create: {
      propertyId: 'PROP-002',
      ownerId: user2.id,
      propertyType: 'MULTIFAMILY',
      address: '456 Residential Plaza',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
      appraisedValue: 5000000,
      ltvRatio: 0.8,
      valuationDate: new Date('2024-01-18'),
      valuationMethod: 'INCOME',
      valuationProvider: 'JLL',
      valuationReport: 'ipfs://QmReport456',
      status: 'VERIFIED',
      verified: true,
      verifiedAt: new Date('2024-01-20'),
      verifiedBy: 'platform-admin',
      blockchainTx: 'tx_def456',
      smartContractId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    },
  });

  console.log('✅ Sample properties created');

  // Create sample loan applications
  const application1 = await prisma.loanApplication.upsert({
    where: { applicationId: 'APP-001' },
    update: {},
    create: {
      applicationId: 'APP-001',
      borrowerId: user1.id,
      propertyId: property1.id,
      requestedAmount: 1875000, // 75% LTV
      interestRate: 0.08,
      termMonths: 60,
      ltvRatio: 0.75,
      status: 'APPROVED',
      submittedAt: new Date('2024-01-15'),
      reviewedAt: new Date('2024-01-16'),
      reviewedBy: 'loan-officer-001',
      approvedAt: new Date('2024-01-16'),
      purpose: 'Refinancing existing mortgage',
      additionalDocs: 'ipfs://QmDocs123',
      notes: 'Strong credit profile, stable income',
      blockchainTx: 'tx_app001',
    },
  });

  const application2 = await prisma.loanApplication.upsert({
    where: { applicationId: 'APP-002' },
    update: {},
    create: {
      applicationId: 'APP-002',
      borrowerId: user2.id,
      propertyId: property2.id,
      requestedAmount: 4000000, // 80% LTV
      interestRate: 0.07,
      termMonths: 84,
      ltvRatio: 0.8,
      status: 'APPROVED',
      submittedAt: new Date('2024-01-22'),
      reviewedAt: new Date('2024-01-23'),
      reviewedBy: 'loan-officer-002',
      approvedAt: new Date('2024-01-23'),
      purpose: 'Property acquisition financing',
      additionalDocs: 'ipfs://QmDocs456',
      notes: 'Excellent rental income history',
      blockchainTx: 'tx_app002',
    },
  });

  console.log('✅ Sample loan applications created');

  // Create sample loans
  const loan1 = await prisma.loan.upsert({
    where: { loanId: 'LOAN-001' },
    update: {},
    create: {
      loanId: 'LOAN-001',
      applicationId: application1.id,
      borrowerId: user1.id,
      principalAmount: 1875000,
      interestRate: 0.08,
      termMonths: 60,
      ltvRatio: 0.75,
      status: 'ACTIVE',
      fundedAt: new Date('2024-01-20'),
      maturityDate: new Date('2029-01-20'),
      nextPaymentDue: new Date('2024-02-20'),
      totalPaid: 15000,
      remainingBalance: 1860000,
      originationFee: 18750,
      daysPastDue: 0,
      smartContractId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      blockchainTx: 'tx_loan001',
    },
  });

  const loan2 = await prisma.loan.upsert({
    where: { loanId: 'LOAN-002' },
    update: {},
    create: {
      loanId: 'LOAN-002',
      applicationId: application2.id,
      borrowerId: user2.id,
      principalAmount: 4000000,
      interestRate: 0.07,
      termMonths: 84,
      ltvRatio: 0.8,
      status: 'ACTIVE',
      fundedAt: new Date('2024-01-25'),
      maturityDate: new Date('2031-01-25'),
      nextPaymentDue: new Date('2024-02-25'),
      totalPaid: 0,
      remainingBalance: 4000000,
      originationFee: 40000,
      daysPastDue: 0,
      smartContractId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
      blockchainTx: 'tx_loan002',
    },
  });

  console.log('✅ Sample loans created');

  // Create sample payments
  await prisma.payment.upsert({
    where: { paymentId: 'PAY-001' },
    update: {},
    create: {
      paymentId: 'PAY-001',
      loanId: loan1.id,
      amount: 15000, // Monthly payment
      paymentType: 'PRINCIPAL',
      paymentMethod: 'USDC_TRANSFER',
      principalPortion: 12000,
      interestPortion: 3000,
      feePortion: 0,
      status: 'COMPLETED',
      processedAt: new Date('2024-02-20'),
      confirmedAt: new Date('2024-02-20'),
      dueDate: new Date('2024-02-20'),
      paidDate: new Date('2024-02-20'),
      isLate: false,
      lateFee: 0,
      blockchainTx: 'tx_pay001',
      blockNumber: 123456,
    },
  });

  console.log('✅ Sample payments created');

  // Create sample audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user1.id,
        walletAddress: user1.walletAddress,
        newValues: { email: user1.email, entityType: user1.entityType },
        metadata: { source: 'web_app' },
      },
      {
        action: 'PROPERTY_VERIFIED',
        entityType: 'Property',
        entityId: property1.id,
        userId: user1.id,
        walletAddress: user1.walletAddress,
        newValues: { status: 'VERIFIED', verified: true },
        metadata: { verifier: 'platform-admin' },
      },
      {
        action: 'LOAN_APPLICATION_SUBMITTED',
        entityType: 'LoanApplication',
        entityId: application1.id,
        userId: user1.id,
        walletAddress: user1.walletAddress,
        newValues: { status: 'SUBMITTED', requestedAmount: 1875000 },
        metadata: { applicationType: 'refinance' },
      },
      {
        action: 'LOAN_FUNDED',
        entityType: 'Loan',
        entityId: loan1.id,
        userId: user1.id,
        walletAddress: user1.walletAddress,
        newValues: { status: 'ACTIVE', principalAmount: 1875000 },
        blockchainTx: 'tx_loan001',
        blockNumber: 123456,
      },
    ],
  });

  console.log('✅ Sample audit logs created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • ${await prisma.user.count()} users created`);
  console.log(`   • ${await prisma.property.count()} properties created`);
  console.log(`   • ${await prisma.loanApplication.count()} loan applications created`);
  console.log(`   • ${await prisma.loan.count()} loans created`);
  console.log(`   • ${await prisma.payment.count()} payments created`);
  console.log(`   • ${await prisma.auditLog.count()} audit logs created`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    (globalThis as any).process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
