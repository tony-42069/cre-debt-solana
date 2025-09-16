import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create demo users
  const demoUsers = [
    {
      walletAddress: 'DemoWallet11111111111111111111111111111112',
      entityType: 'INDIVIDUAL' as const,
      email: 'demo.borrower@credebt.com',
      kycStatus: 'APPROVED' as const,
      riskScore: 850,
      totalBorrowed: 0,
    },
    {
      walletAddress: 'DemoWallet22222222222222222222222222222223',
      entityType: 'LLC' as const,
      email: 'demo.lender@credebt.com',
      kycStatus: 'APPROVED' as const,
      riskScore: 900,
      totalBorrowed: 0,
    }
  ]

  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { walletAddress: userData.walletAddress },
      update: {},
      create: userData,
    })
    console.log(`✅ Created/Updated user: ${user.walletAddress}`)
  }

  // Create demo properties
  const demoProperties = [
    {
      propertyId: 'DEMO-PROP-001',
      ownerWallet: 'DemoWallet11111111111111111111111111111112',
      propertyType: 'OFFICE',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      appraisedValue: 2000000,
      valuationDate: new Date('2025-08-01'),
      valuationMethod: 'APPRAISAL',
      valuationProvider: 'ABC Appraisal Services',
      status: 'VERIFIED',
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'DemoVerifier',
    },
    {
      propertyId: 'DEMO-PROP-002',
      ownerWallet: 'DemoWallet11111111111111111111111111111112',
      propertyType: 'RETAIL',
      address: '456 Commerce Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
      appraisedValue: 1500000,
      valuationDate: new Date('2025-07-15'),
      valuationMethod: 'AVM',
      valuationProvider: 'XYZ Valuation Co',
      status: 'VERIFIED',
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'DemoVerifier',
    },
    {
      propertyId: 'DEMO-PROP-003',
      ownerWallet: 'DemoWallet22222222222222222222222222222223',
      propertyType: 'INDUSTRIAL',
      address: '789 Industrial Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      appraisedValue: 3000000,
      valuationDate: new Date('2025-08-15'),
      valuationMethod: 'INCOME',
      valuationProvider: 'Industrial Valuation Experts',
      status: 'VERIFIED',
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: 'DemoVerifier',
    }
  ]

  for (const propertyData of demoProperties) {
    // Find the owner user
    const owner = await prisma.user.findUnique({
      where: { walletAddress: propertyData.ownerWallet }
    })

    if (owner) {
      const { ownerWallet, ...propertyFields } = propertyData
      const property = await prisma.property.upsert({
        where: { propertyId: propertyData.propertyId },
        update: {},
        create: {
          ...propertyFields,
          ownerId: owner.id,
        },
      })
      console.log(`✅ Created/Updated property: ${property.propertyId}`)
    }
  }

  // Create demo loan applications
  const demoApplications = [
    {
      applicationId: 'DEMO-APP-001',
      borrowerWallet: 'DemoWallet11111111111111111111111111111112',
      propertyId: 'DEMO-PROP-001',
      requestedAmount: 1800000, // 90% of $2M
      interestRate: 0.08,
      termMonths: 360, // 30 years
      ltvRatio: 0.9,
      status: 'APPROVED',
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: 'DemoReviewer',
      approvedAt: new Date(),
      purpose: 'Refinancing existing commercial mortgage',
    },
    {
      applicationId: 'DEMO-APP-002',
      borrowerWallet: 'DemoWallet11111111111111111111111111111112',
      propertyId: 'DEMO-PROP-002',
      requestedAmount: 1200000, // 80% of $1.5M
      interestRate: 0.085,
      termMonths: 240, // 20 years
      ltvRatio: 0.8,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      purpose: 'Expansion and renovation funding',
    }
  ]

  for (const appData of demoApplications) {
    // Find borrower and property
    const borrower = await prisma.user.findUnique({
      where: { walletAddress: appData.borrowerWallet }
    })
    const property = await prisma.property.findUnique({
      where: { propertyId: appData.propertyId }
    })

    if (borrower && property) {
      const { borrowerWallet, ...applicationFields } = appData
      const application = await prisma.loanApplication.upsert({
        where: { applicationId: appData.applicationId },
        update: {},
        create: {
          ...applicationFields,
          borrowerId: borrower.id,
          propertyId: property.id,
        },
      })
      console.log(`✅ Created/Updated loan application: ${application.applicationId}`)
    }
  }

  // Create demo loans
  const demoLoans = [
    {
      loanId: 'DEMO-LOAN-001',
      applicationId: 'DEMO-APP-001',
      borrowerWallet: 'DemoWallet11111111111111111111111111111112',
      principalAmount: 1800000,
      interestRate: 0.08,
      termMonths: 360,
      ltvRatio: 0.9,
      status: 'FUNDED',
      fundedAt: new Date(),
      maturityDate: new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000), // 30 years from now
      remainingBalance: 1800000,
    }
  ]

  for (const loanData of demoLoans) {
    // Find borrower and application
    const borrower = await prisma.user.findUnique({
      where: { walletAddress: loanData.borrowerWallet }
    })
    const application = await prisma.loanApplication.findUnique({
      where: { applicationId: loanData.applicationId }
    })

    if (borrower && application) {
      const { borrowerWallet, ...loanFields } = loanData
      const loan = await prisma.loan.upsert({
        where: { loanId: loanData.loanId },
        update: {},
        create: {
          ...loanFields,
          borrowerId: borrower.id,
          applicationId: application.id,
        },
      })
      console.log(`✅ Created/Updated loan: ${loan.loanId}`)
    }
  }

  // Create demo payments
  const demoPayments = [
    {
      paymentId: 'DEMO-PAY-001',
      loanId: 'DEMO-LOAN-001',
      amount: 1200, // Monthly payment
      paymentType: 'PRINCIPAL' as const,
      paymentMethod: 'USDC_TRANSFER' as const,
      status: 'COMPLETED' as const,
      processedAt: new Date(),
      confirmedAt: new Date(),
      dueDate: new Date(),
      paidDate: new Date(),
      principalPortion: 200,
      interestPortion: 1000,
    }
  ]

  for (const paymentData of demoPayments) {
    const loan = await prisma.loan.findUnique({
      where: { loanId: paymentData.loanId }
    })

    if (loan) {
      const payment = await prisma.payment.upsert({
        where: { paymentId: paymentData.paymentId },
        update: {},
        create: {
          ...paymentData,
          loanId: loan.id,
        },
      })
      console.log(`✅ Created/Updated payment: ${payment.paymentId}`)
    }
  }

  // Create platform configuration
  const platformConfig = await prisma.platformConfig.upsert({
    where: { id: 'platform-config' },
    update: {},
    create: {
      id: 'platform-config',
      authorityWallet: 'PlatformAuthority111111111111111111111111111',
      treasuryWallet: 'PlatformTreasury222222222222222222222222222',
      tokenAccount: 'PlatformToken3333333333333333333333333333333',
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
  })
  console.log(`✅ Created/Updated platform configuration`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Demo Data Summary:')
  console.log('- 2 Demo Users (Borrower & Lender)')
  console.log('- 3 Demo Properties ($2M, $1.5M, $3M values)')
  console.log('- 2 Demo Loan Applications (Approved & Submitted)')
  console.log('- 1 Demo Active Loan ($1.8M funded)')
  console.log('- 1 Demo Payment Record')
  console.log('- Platform Configuration')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
