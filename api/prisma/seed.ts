import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await seedPlatformConfig();
    await seedUsers();
    await seedProperties();
    await seedBorrowers();
    await seedLoans();
    await seedPayments();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log('- 6 Demo Users (Admin, 3 Borrowers, 2 Lenders)');
    console.log('- 3 Demo Properties ($3.5M, $5M, $8M values)');
    console.log('- 3 Demo Borrowers with KYC approved');
    console.log('- 3 Demo Loans (2 Active, 1 Pending)');
    console.log('- 5 Demo Payment Records');
    console.log('- Platform Configuration');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPlatformConfig() {
  console.log('Creating platform configuration...');

  const config = await prisma.platformConfig.upsert({
    where: { id: 'platform-config' },
    update: {},
    create: {
      id: 'platform-config',
      authorityWallet: 'Authority1111111111111111111111111111111111',
      treasuryWallet: 'Treasury2222222222222222222222222222222222',
      tokenAccount: 'Token3333333333333333333333333333333333333',
      maxLtvRatio: 9000,
      minLoanAmount: 100000000,
      maxLoanAmount: 100000000000,
      originationFee: 50,
      servicingFee: 25,
      minInterestRate: 400,
      maxInterestRate: 1500,
      defaultInterestRate: 800,
      gracePeriodDays: 15,
      lateFeeRate: 50,
      defaultThreshold: 90,
      isActive: true,
      maintenanceMode: false,
    },
  });
  console.log(`  ✓ Created platform configuration`);
}

async function seedUsers() {
  console.log('\nCreating users...');

  const users = [
    {
      walletAddress: 'AdminWallet1111111111111111111111111111111',
      entityType: 'INDIVIDUAL' as const,
      email: 'admin@cre-debt.com',
      role: 'ADMIN' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 1000,
      totalBorrowed: 0,
      isActive: true,
    },
    {
      walletAddress: 'BorrowerWallet1111111111111111111111111111',
      entityType: 'LLC' as const,
      email: 'borrower1@example.com',
      role: 'BORROWER' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 750,
      totalBorrowed: 350000000,
      isActive: true,
    },
    {
      walletAddress: 'BorrowerWallet2222222222222222222222222222',
      entityType: 'CORPORATION' as const,
      email: 'borrower2@example.com',
      role: 'BORROWER' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 820,
      totalBorrowed: 560000000,
      isActive: true,
    },
    {
      walletAddress: 'BorrowerWallet3333333333333333333333333333',
      entityType: 'INDIVIDUAL' as const,
      email: 'borrower3@example.com',
      role: 'BORROWER' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 680,
      totalBorrowed: 245000000,
      isActive: true,
    },
    {
      walletAddress: 'LenderWallet111111111111111111111111111111',
      entityType: 'INSTITUTION' as const,
      email: 'lender1@example.com',
      role: 'LENDER' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 950,
      totalBorrowed: 0,
      isActive: true,
    },
    {
      walletAddress: 'LenderWallet22222222222222222222222222222',
      entityType: 'INSTITUTION' as const,
      email: 'lender2@example.com',
      role: 'LENDER' as const,
      kycStatus: 'APPROVED' as const,
      riskScore: 920,
      totalBorrowed: 0,
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { walletAddress: user.walletAddress },
      update: user,
      create: user,
    });
    console.log(`  ✓ Created user: ${user.email}`);
  }
}

async function seedProperties() {
  console.log('\nCreating properties...');

  const properties = [
    {
      propertyId: 'COM-001-NYC-2024',
      ownerWallet: 'BorrowerWallet1111111111111111111111111111',
      propertyType: 'COMMERCIAL' as const,
      address: '123 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      appraisedValue: 500000000,
      squareFootage: 15000,
      units: 1,
      yearBuilt: 2015,
      valuationDate: new Date(),
      valuationMethod: 'INCOME' as const,
      valuationProvider: 'CBRE',
      status: 'VERIFIED' as const,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'System',
    },
    {
      propertyId: 'OFF-002-SF-2024',
      ownerWallet: 'BorrowerWallet2222222222222222222222222222',
      propertyType: 'OFFICE' as const,
      address: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      appraisedValue: 800000000,
      squareFootage: 25000,
      units: 20,
      yearBuilt: 2010,
      valuationDate: new Date(),
      valuationMethod: 'COMPARABLE' as const,
      valuationProvider: 'JLL',
      status: 'VERIFIED' as const,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'System',
    },
    {
      propertyId: 'RET-003-CHI-2024',
      ownerWallet: 'BorrowerWallet3333333333333333333333333333',
      propertyType: 'RETAIL' as const,
      address: '789 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      appraisedValue: 350000000,
      squareFootage: 10000,
      units: 5,
      yearBuilt: 2018,
      valuationDate: new Date(),
      valuationMethod: 'APPRAISAL' as const,
      valuationProvider: 'Cushman & Wakefield',
      status: 'VERIFIED' as const,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'System',
    },
  ];

  for (const property of properties) {
    const owner = await prisma.user.findUnique({
      where: { walletAddress: property.ownerWallet }
    });

    if (owner) {
      const { ownerWallet, ...propertyFields } = property;
      await prisma.property.upsert({
        where: { propertyId: property.propertyId },
        update: propertyFields,
        create: {
          ...propertyFields,
          ownerId: owner.id,
        },
      });
      console.log(`  ✓ Created property: ${property.propertyId}`);
    }
  }
}

async function seedBorrowers() {
  console.log('\nCreating borrowers...');

  const borrowers = [
    {
      wallet: 'BorrowerWallet1111111111111111111111111111',
      borrowerId: 'BOR-001-2024',
      entityType: 2,
      kycStatus: 'APPROVED' as const,
      kycTimestamp: new Date(),
      activeLoans: 1,
      totalBorrowed: 350000000,
      riskScore: 750,
      metadataUri: 'ipfs://QmBorrower001',
    },
    {
      wallet: 'BorrowerWallet2222222222222222222222222222',
      borrowerId: 'BOR-002-2024',
      entityType: 3,
      kycStatus: 'APPROVED' as const,
      kycTimestamp: new Date(),
      activeLoans: 1,
      totalBorrowed: 560000000,
      riskScore: 820,
      metadataUri: 'ipfs://QmBorrower002',
    },
    {
      wallet: 'BorrowerWallet3333333333333333333333333333',
      borrowerId: 'BOR-003-2024',
      entityType: 1,
      kycStatus: 'APPROVED' as const,
      kycTimestamp: new Date(),
      activeLoans: 1,
      totalBorrowed: 245000000,
      riskScore: 680,
      metadataUri: 'ipfs://QmBorrower003',
    },
  ];

  for (const borrower of borrowers) {
    await prisma.borrower.upsert({
      where: { borrowerId: borrower.borrowerId },
      update: borrower,
      create: borrower,
    });
    console.log(`  ✓ Created borrower: ${borrower.borrowerId}`);
  }
}

async function seedLoans() {
  console.log('\nCreating loans...');

  const loans = [
    {
      loanId: 'LN-001-2024',
      borrowerWallet: 'BorrowerWallet1111111111111111111111111111',
      propertyId: 'COM-001-NYC-2024',
      principalAmount: 350000000,
      interestRate: 850,
      termMonths: 240,
      status: 'FUNDED' as const,
      ltvRatio: 7000,
      remainingBalance: 345000000,
      totalPaid: 5000000,
      fundedAmount: 350000000,
      submittedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 175 * 24 * 60 * 60 * 1000),
      fundedAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 240 * 30 * 24 * 60 * 60 * 1000),
    },
    {
      loanId: 'LN-002-2024',
      borrowerWallet: 'BorrowerWallet2222222222222222222222222222',
      propertyId: 'OFF-002-SF-2024',
      principalAmount: 560000000,
      interestRate: 750,
      termMonths: 360,
      status: 'FUNDED' as const,
      ltvRatio: 7000,
      remainingBalance: 555000000,
      totalPaid: 5000000,
      fundedAmount: 560000000,
      submittedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      fundedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 360 * 30 * 24 * 60 * 60 * 1000),
    },
    {
      loanId: 'LN-003-2024',
      borrowerWallet: 'BorrowerWallet3333333333333333333333333333',
      propertyId: 'RET-003-CHI-2024',
      principalAmount: 245000000,
      interestRate: 900,
      termMonths: 180,
      status: 'SUBMITTED' as const,
      ltvRatio: 7000,
      remainingBalance: 245000000,
      totalPaid: 0,
      fundedAmount: 0,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvedAt: null,
      fundedAt: null,
      maturityDate: null,
    },
  ];

  for (const loan of loans) {
    await prisma.loan.upsert({
      where: { loanId: loan.loanId },
      update: loan,
      create: loan,
    });
    console.log(`  ✓ Created loan: ${loan.loanId}`);
  }
}

async function seedPayments() {
  console.log('\nCreating payments...');

  const payments = [
    {
      paymentId: 'PAY-001-2024',
      loanId: 'LN-001-2024',
      amount: 3145000,
      paymentType: 'FULL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      dueDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      principalPortion: 2100000,
      interestPortion: 1045000,
      transactionSignature: 'Sig001xxx',
    },
    {
      paymentId: 'PAY-002-2024',
      loanId: 'LN-001-2024',
      amount: 3145000,
      paymentType: 'FULL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      dueDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      principalPortion: 2120000,
      interestPortion: 1025000,
      transactionSignature: 'Sig002xxx',
    },
    {
      paymentId: 'PAY-003-2024',
      loanId: 'LN-001-2024',
      amount: 3145000,
      paymentType: 'FULL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      dueDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      principalPortion: 2140000,
      interestPortion: 1005000,
      transactionSignature: 'Sig003xxx',
    },
    {
      paymentId: 'PAY-004-2024',
      loanId: 'LN-002-2024',
      amount: 3912000,
      paymentType: 'FULL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      principalPortion: 410000,
      interestPortion: 3502000,
      transactionSignature: 'Sig004xxx',
    },
    {
      paymentId: 'PAY-005-2024',
      loanId: 'LN-002-2024',
      amount: 3912000,
      paymentType: 'FULL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      principalPortion: 415000,
      interestPortion: 3497000,
      transactionSignature: 'Sig005xxx',
    },
  ];

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { paymentId: payment.paymentId },
      update: payment,
      create: payment,
    });
    console.log(`  ✓ Created payment: ${payment.paymentId}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
