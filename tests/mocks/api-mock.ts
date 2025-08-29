import { Page } from '@playwright/test'

export class APIMock {
  private page: Page
  private mockResponses: Map<string, any> = new Map()

  constructor() {}

  async setup(page: Page) {
    this.page = page

    // Mock fetch API
    await page.addScriptTag({
      content: `
        const originalFetch = window.fetch
        window.fetch = async (url, options = {}) => {
          // Check if we have a mock response for this URL
          const mockResponse = window.apiMocks?.get(url)
          if (mockResponse) {
            return new Response(JSON.stringify(mockResponse.data), {
              status: mockResponse.status || 200,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          // For real API calls, use original fetch
          return originalFetch(url, options)
        }

        // Initialize mock storage
        window.apiMocks = new Map()
      `
    })

    // Setup default successful responses
    this.setupDefaultMocks()
  }

  private setupDefaultMocks() {
    // Mock successful property registration
    this.mockResponse('/api/properties', 'POST', {
      success: true,
      data: {
        id: 'prop_123',
        propertyId: 'PROP_2025_001',
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      }
    })

    // Mock successful loan application
    this.mockResponse('/api/loans', 'POST', {
      success: true,
      data: {
        id: 'loan_123',
        applicationId: 'APP_2025_001',
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      }
    })

    // Mock successful payment processing
    this.mockResponse('/api/payments/process', 'POST', {
      success: true,
      data: {
        transactionId: 'TXN_123456',
        paymentId: 'pay_123',
        amount: 1000,
        status: 'COMPLETED',
        processedAt: new Date().toISOString(),
        blockchainTx: 'SOL_TX_123456789'
      }
    })

    // Mock dashboard data
    this.mockResponse('/api/dashboard/stats', 'GET', {
      success: true,
      data: {
        totalProperties: 1,
        totalLoans: 1,
        activeLoans: 1,
        totalLoanValue: 450000,
        nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextPaymentAmount: 2500
      }
    })

    // Mock properties list
    this.mockResponse('/api/properties', 'GET', {
      success: true,
      data: [{
        id: 'prop_123',
        propertyId: 'PROP_2025_001',
        address: '123 Commercial Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        appraisedValue: 750000,
        status: 'VERIFIED',
        createdAt: new Date().toISOString()
      }]
    })

    // Mock loan applications
    this.mockResponse('/api/loans', 'GET', {
      success: true,
      data: [{
        id: 'loan_123',
        applicationId: 'APP_2025_001',
        status: 'APPROVED',
        requestedAmount: 450000,
        createdAt: new Date().toISOString(),
        property: {
          address: '123 Commercial Blvd',
          city: 'New York',
          state: 'NY'
        }
      }]
    })

    // Mock payment history
    this.mockResponse('/api/payments/history', 'GET', {
      success: true,
      data: [{
        id: 'pay_123',
        paymentId: 'TXN_123456',
        amount: 2500,
        paymentType: 'PRINCIPAL',
        paymentMethod: 'USDC_TRANSFER',
        status: 'COMPLETED',
        dueDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        blockchainTx: 'SOL_TX_123456789',
        loan: {
          loanId: 'LOAN_2025_001',
          application: {
            property: {
              address: '123 Commercial Blvd',
              city: 'New York',
              state: 'NY'
            }
          }
        }
      }]
    })

    // Mock upcoming payments
    this.mockResponse('/api/payments/upcoming', 'GET', {
      success: true,
      data: [{
        id: 'pay_124',
        paymentId: 'TXN_123457',
        amount: 2500,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        loan: {
          loanId: 'LOAN_2025_001',
          application: {
            property: {
              address: '123 Commercial Blvd',
              city: 'New York',
              state: 'NY'
            }
          }
        }
      }]
    })
  }

  mockResponse(url: string, method: string = 'GET', response: any, status: number = 200) {
    const key = `${method}:${url}`
    this.mockResponses.set(key, { data: response, status })

    // Update page mock
    this.page.evaluate(({ key, response, status }) => {
      window.apiMocks?.set(key, { data: response, status })
    }, { key, response, status })
  }

  async mockPaymentFailure() {
    this.mockResponse('/api/payments/process', 'POST', {
      success: false,
      error: 'Payment processing failed - please try again'
    }, 400)
  }

  async mockNetworkError(url: string, method: string = 'GET') {
    const key = `${method}:${url}`
    this.mockResponses.set(key, { error: 'Network error', status: 500 })

    this.page.evaluate(({ key }) => {
      window.apiMocks?.set(key, { data: { success: false, error: 'Network error' }, status: 500 })
    }, { key })
  }

  async mockAuthError(url: string, method: string = 'GET') {
    const key = `${method}:${url}`
    this.mockResponses.set(key, { error: 'Unauthorized', status: 401 })

    this.page.evaluate(({ key }) => {
      window.apiMocks?.set(key, { data: { success: false, error: 'Unauthorized' }, status: 401 })
    }, { key })
  }

  async resetMocks() {
    this.mockResponses.clear()
    await this.page.evaluate(() => {
      window.apiMocks?.clear()
    })
    this.setupDefaultMocks()
  }

  async cleanup() {
    this.mockResponses.clear()
    await this.page.evaluate(() => {
      if (window.apiMocks) {
        window.apiMocks.clear()
      }
    })
  }

  getMockResponses() {
    return Array.from(this.mockResponses.entries())
  }
}
