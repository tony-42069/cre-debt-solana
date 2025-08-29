import { test, expect, Page } from '@playwright/test'
import { WalletMock } from '../mocks/wallet-mock'
import { APIMock } from '../mocks/api-mock'

test.describe('CRE-Debt-Solana - Complete User Journey', () => {
  let walletMock: WalletMock
  let apiMock: APIMock
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    walletMock = new WalletMock()
    apiMock = new APIMock()

    // Setup mocks
    await walletMock.setup(page)
    await apiMock.setup(page)

    // Navigate to application
    await page.goto('http://localhost:3000')
  })

  test.afterEach(async () => {
    await walletMock.cleanup()
    await apiMock.cleanup()
  })

  test('Complete Property Owner Journey - From Registration to Payment', async () => {
    // === STEP 1: Wallet Connection ===
    console.log('🧪 Testing Step 1: Wallet Connection')

    // Check if wallet connection prompt is shown
    await expect(page.locator('text=Connect your Solana wallet')).toBeVisible()

    // Mock wallet connection
    await walletMock.connectWallet('11111111111111111111111111111112') // Mock public key

    // Verify wallet is connected
    await expect(page.locator('text=Dashboard')).toBeVisible()

    // === STEP 2: Property Registration ===
    console.log('🧪 Testing Step 2: Property Registration')

    // Navigate to property registration
    await page.click('text=Register Property')
    await expect(page.locator('text=Register Your Property')).toBeVisible()

    // Step 1: Property Details
    await page.fill('input[placeholder="123 Main Street"]', '123 Commercial Blvd')
    await page.fill('input[placeholder="New York"]', 'New York')
    await page.selectOption('select', 'NY')
    await page.fill('input[placeholder="10001"]', '10001')
    await page.click('text=Continue to Valuation')

    // Step 2: Property Valuation
    await expect(page.locator('text=Property Valuation')).toBeVisible()
    await page.fill('input[placeholder="500000"]', '750000')
    await page.fill('input[placeholder="ABC Appraisal Services"]', 'NYC Appraisal Co')
    await page.click('text=Continue to Documentation')

    // Step 3: Documentation Upload
    await expect(page.locator('text=Property Documentation')).toBeVisible()

    // Mock file upload
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'property-deed.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PDF content')
    })

    await page.click('text=Review & Submit')

    // Step 4: Review & Submit
    await expect(page.locator('text=Review Your Property')).toBeVisible()
    await page.click('text=Submit Registration')

    // Verify success and redirect to dashboard
    await expect(page.locator('text=Property registered successfully')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()

    // === STEP 3: Loan Application ===
    console.log('🧪 Testing Step 3: Loan Application')

    // Navigate to loan application
    await page.click('text=Apply for Loan')
    await expect(page.locator('text=Apply for a Loan')).toBeVisible()

    // Step 1: Property Selection
    await page.click('text=123 Commercial Blvd') // Select registered property
    await page.click('text=Continue')

    // Step 2: Loan Terms
    await expect(page.locator('text=Loan Terms')).toBeVisible()
    await page.fill('input[placeholder="500000"]', '450000') // 60% LTV
    await page.selectOption('select[name="term"]', '30') // 30 years
    await page.click('text=Continue')

    // Step 3: Financial Information
    await expect(page.locator('text=Financial Information')).toBeVisible()
    await page.fill('input[placeholder="50000"]', '80000') // Annual income
    await page.fill('input[placeholder="200000"]', '150000') // Total assets
    await page.fill('input[placeholder="50000"]', '25000') // Total liabilities
    await page.click('text=Continue')

    // Step 4: Review & Submit
    await expect(page.locator('text=Review Your Application')).toBeVisible()
    await page.click('text=Submit Application')

    // Verify loan application success
    await expect(page.locator('text=Loan application submitted successfully')).toBeVisible()

    // === STEP 4: Dashboard Management ===
    console.log('🧪 Testing Step 4: Dashboard Management')

    // Navigate to dashboard
    await page.click('text=Dashboard')
    await expect(page.locator('text=Dashboard')).toBeVisible()

    // Check properties tab
    await page.click('text=Properties')
    await expect(page.locator('text=123 Commercial Blvd')).toBeVisible()

    // Check loans tab
    await page.click('text=Loans')
    await expect(page.locator('text=Application #')).toBeVisible()

    // === STEP 5: Payment Processing ===
    console.log('🧪 Testing Step 5: Payment Processing')

    // Navigate to payments tab
    await page.click('text=Payments')

    // Check payment schedule
    await expect(page.locator('text=Payment Schedule')).toBeVisible()
    await expect(page.locator('text=Upcoming Payments')).toBeVisible()

    // Simulate making a payment
    await page.click('text=Pay Now')

    // Payment form should appear
    await expect(page.locator('text=Make Payment')).toBeVisible()

    // Select USDC payment method
    await page.check('input[value="usdc"]')

    // Agree to terms
    await page.check('input[type="checkbox"]')

    // Submit payment
    await page.click('text=Pay')

    // Verify payment success
    await expect(page.locator('text=Payment processed successfully')).toBeVisible()

    // Check payment history
    await page.click('text=Payment History')
    await expect(page.locator('text=Payment completed')).toBeVisible()

    console.log('✅ Complete user journey test passed!')
  })

  test('Error Handling - Invalid Property Registration', async () => {
    console.log('🧪 Testing Error Handling: Invalid Property Registration')

    // Connect wallet
    await walletMock.connectWallet('11111111111111111111111111111112')

    // Navigate to property registration
    await page.click('text=Register Property')

    // Try to submit without required fields
    await page.click('text=Continue to Valuation')

    // Should show validation errors
    await expect(page.locator('text=Property type is required')).toBeVisible()
    await expect(page.locator('text=Address is required')).toBeVisible()

    console.log('✅ Error handling test passed!')
  })

  test('Error Handling - Payment Processing Failure', async () => {
    console.log('🧪 Testing Error Handling: Payment Processing Failure')

    // Setup API to return payment failure
    await apiMock.mockPaymentFailure()

    // Connect wallet and navigate to payments
    await walletMock.connectWallet('11111111111111111111111111111112')
    await page.click('text=Payments')

    // Attempt payment
    await page.click('text=Pay Now')
    await page.check('input[value="usdc"]')
    await page.check('input[type="checkbox"]')
    await page.click('text=Pay')

    // Should show payment error
    await expect(page.locator('text=Payment processing failed')).toBeVisible()

    console.log('✅ Payment error handling test passed!')
  })

  test('Mobile Responsiveness - Property Registration', async () => {
    console.log('🧪 Testing Mobile Responsiveness')

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Connect wallet
    await walletMock.connectWallet('11111111111111111111111111111112')

    // Navigate to property registration
    await page.click('text=Register Property')

    // Verify mobile layout
    await expect(page.locator('text=Register Your Property')).toBeVisible()

    // Test form on mobile
    await page.fill('input[placeholder="123 Main Street"]', '456 Mobile St')
    await page.fill('input[placeholder="New York"]', 'Mobile City')
    await page.selectOption('select', 'CA')
    await page.fill('input[placeholder="10001"]', '90210')

    // Should be able to continue on mobile
    await page.click('text=Continue to Valuation')
    await expect(page.locator('text=Property Valuation')).toBeVisible()

    console.log('✅ Mobile responsiveness test passed!')
  })
})
