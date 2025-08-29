import { test, expect } from '@jest/globals'
import request from 'supertest'
import app from '../api/src/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('CRE-Debt-Solana API Integration Tests', () => {
  const testWalletAddress = '11111111111111111111111111111112'
  let testUser: any
  let testProperty: any
  let testLoanApplication: any

  beforeAll(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({ where: { loan: { borrower: { walletAddress: testWalletAddress } } } })
    await prisma.loan.deleteMany({ where: { borrower: { walletAddress: testWalletAddress } } })
    await prisma.loanApplication.deleteMany({ where: { borrower: { walletAddress: testWalletAddress } } })
    await prisma.property.deleteMany({ where: { owner: { walletAddress: testWalletAddress } } })
    await prisma.user.deleteMany({ where: { walletAddress: testWalletAddress } })

    // Create test user
    testUser = await prisma.user.create({
      data: {
        walletAddress: testWalletAddress,
        entityType: 'INDIVIDUAL',
        kycStatus: 'APPROVED'
      }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({ where: { loan: { borrower: { walletAddress: testWalletAddress } } } })
    await prisma.loan.deleteMany({ where: { borrower: { walletAddress: testWalletAddress } } })
    await prisma.loanApplication.deleteMany({ where: { borrower: { walletAddress: testWalletAddress } } })
    await prisma.property.deleteMany({ where: { owner: { walletAddress: testWalletAddress } } })
    await prisma.user.deleteMany({ where: { walletAddress: testWalletAddress } })

    await prisma.$disconnect()
  })

  describe('Health Check', () => {
    test('GET /health - should return health status', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('timestamp')
    })
  })

  describe('Property Registration Flow', () => {
    test('POST /api/properties - should create property successfully', async () => {
      const propertyData = {
        propertyType: 'OFFICE',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
        appraisedValue: 1000000,
        valuationDate: new Date().toISOString(),
        valuationMethod: 'APPRAISAL',
        valuationProvider: 'Test Appraiser',
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('propertyId')
      expect(response.body.data.status).toBe('DRAFT')

      testProperty = response.body.data
    })

    test('GET /api/properties - should return user properties', async () => {
      const response = await request(app)
        .get(`/api/properties?walletAddress=${testWalletAddress}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toHaveProperty('address', '123 Test Street')
    })

    test('POST /api/properties - should validate required fields', async () => {
      const invalidPropertyData = {
        // Missing required fields
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/properties')
        .send(invalidPropertyData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })
  })

  describe('Loan Application Flow', () => {
    test('POST /api/loans - should create loan application successfully', async () => {
      const loanData = {
        propertyId: testProperty.id,
        requestedAmount: 600000, // 60% LTV
        interestRate: 0.08,
        termMonths: 360,
        ltvRatio: 0.6,
        purpose: 'Refinancing existing debt',
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('applicationId')
      expect(response.body.data.status).toBe('DRAFT')

      testLoanApplication = response.body.data
    })

    test('GET /api/loans - should return user loan applications', async () => {
      const response = await request(app)
        .get(`/api/loans?walletAddress=${testWalletAddress}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toHaveProperty('applicationId')
    })

    test('POST /api/loans - should validate loan amount limits', async () => {
      const invalidLoanData = {
        propertyId: testProperty.id,
        requestedAmount: 950000, // Over 90% LTV limit
        interestRate: 0.08,
        termMonths: 360,
        ltvRatio: 0.95,
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/loans')
        .send(invalidLoanData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('LTV ratio')
    })
  })

  describe('Payment Processing Flow', () => {
    test('POST /api/payments/process - should process USDC payment successfully', async () => {
      const paymentData = {
        loanId: testLoanApplication.id,
        amount: 5000,
        paymentMethod: 'usdc',
        walletAddress: testWalletAddress,
        dueDate: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('transactionId')
      expect(response.body.data).toHaveProperty('paymentId')
      expect(response.body.data.status).toBe('COMPLETED')
      expect(response.body.data).toHaveProperty('blockchainTx')
    })

    test('GET /api/payments/history - should return payment history', async () => {
      const response = await request(app)
        .get(`/api/payments/history?walletAddress=${testWalletAddress}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toHaveProperty('paymentId')
      expect(response.body.data[0]).toHaveProperty('amount', 5000)
    })

    test('GET /api/payments/upcoming - should return upcoming payments', async () => {
      const response = await request(app)
        .get(`/api/payments/upcoming?walletAddress=${testWalletAddress}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test('POST /api/payments/process - should validate payment amount', async () => {
      const invalidPaymentData = {
        loanId: testLoanApplication.id,
        amount: -100, // Invalid negative amount
        paymentMethod: 'usdc',
        walletAddress: testWalletAddress,
        dueDate: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/payments/process')
        .send(invalidPaymentData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid payment amount')
    })
  })

  describe('Dashboard Integration', () => {
    test('GET /api/dashboard/stats - should return dashboard statistics', async () => {
      const response = await request(app)
        .get(`/api/dashboard/stats?walletAddress=${testWalletAddress}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('totalProperties')
      expect(response.body.data).toHaveProperty('totalLoans')
      expect(response.body.data).toHaveProperty('activeLoans')
      expect(response.body.data).toHaveProperty('totalLoanValue')
    })
  })

  describe('Error Handling', () => {
    test('POST /api/properties - should handle invalid wallet address', async () => {
      const propertyData = {
        propertyType: 'OFFICE',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        appraisedValue: 1000000,
        walletAddress: 'invalid-wallet-address'
      }

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User not found')
    })

    test('POST /api/payments/process - should handle non-existent loan', async () => {
      const paymentData = {
        loanId: 'non-existent-loan-id',
        amount: 1000,
        paymentMethod: 'usdc',
        walletAddress: testWalletAddress,
        dueDate: new Date().toISOString()
      }

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentData)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Loan not found or access denied')
    })
  })

  describe('Data Validation', () => {
    test('Property data validation - should enforce appraisal minimum', async () => {
      const invalidPropertyData = {
        propertyType: 'OFFICE',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        appraisedValue: 50000, // Below minimum $100K
        valuationDate: new Date().toISOString(),
        valuationMethod: 'APPRAISAL',
        valuationProvider: 'Test Appraiser',
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/properties')
        .send(invalidPropertyData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('minimum')
    })

    test('Loan data validation - should enforce LTV limits', async () => {
      const invalidLoanData = {
        propertyId: testProperty.id,
        requestedAmount: 950000, // Over 90% LTV
        interestRate: 0.08,
        termMonths: 360,
        ltvRatio: 0.95,
        walletAddress: testWalletAddress
      }

      const response = await request(app)
        .post('/api/loans')
        .send(invalidLoanData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('LTV ratio')
    })
  })

  describe('Cross-Component Integration', () => {
    test('Property-Loan relationship - should maintain data consistency', async () => {
      // Get property details
      const propertyResponse = await request(app)
        .get(`/api/properties/${testProperty.id}?walletAddress=${testWalletAddress}`)

      expect(propertyResponse.status).toBe(200)
      expect(propertyResponse.body.data.appraisedValue).toBe(1000000)

      // Get loan application details
      const loanResponse = await request(app)
        .get(`/api/loans/${testLoanApplication.id}?walletAddress=${testWalletAddress}`)

      expect(loanResponse.status).toBe(200)
      expect(loanResponse.body.data.propertyId).toBe(testProperty.id)
    })

    test('Payment-Loan relationship - should update loan balance', async () => {
      // Make another payment
      const paymentData = {
        loanId: testLoanApplication.id,
        amount: 3000,
        paymentMethod: 'usdc',
        walletAddress: testWalletAddress,
        dueDate: new Date().toISOString()
      }

      await request(app)
        .post('/api/payments/process')
        .send(paymentData)

      // Check payment history includes both payments
      const historyResponse = await request(app)
        .get(`/api/payments/history?walletAddress=${testWalletAddress}`)

      expect(historyResponse.body.data.length).toBe(2)
      const totalPaid = historyResponse.body.data.reduce((sum: number, payment: any) => sum + payment.amount, 0)
      expect(totalPaid).toBe(8000)
    })
  })
})
