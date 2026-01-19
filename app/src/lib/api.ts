// API service for CRE-Debt-Solana frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Property API methods
  async createProperty(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/properties`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('Property creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async getProperties(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/properties?walletAddress=${walletAddress}`)
  }

  async getProperty(id: string): Promise<ApiResponse> {
    return this.request(`/api/properties/${id}`)
  }

  // Loan API methods
  async createLoanApplication(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/loans`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('Loan application creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async getLoanApplications(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/loans?walletAddress=${walletAddress}`)
  }

  // Dashboard API methods
  async getDashboardStats(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/dashboard/stats?walletAddress=${walletAddress}`)
  }

  // Payment API methods
  async processPayment(paymentData: any): Promise<ApiResponse> {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async getPaymentHistory(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/payments/history?walletAddress=${walletAddress}`)
  }

  async getUpcomingPayments(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/payments/upcoming?walletAddress=${walletAddress}`)
  }

  // Borrower API methods
  async getBorrower(walletAddress: string): Promise<ApiResponse> {
    return this.request(`/api/borrowers/wallet/${walletAddress}`)
  }

  async createBorrower(borrowerData: {
    walletAddress: string
    entityType: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    companyName?: string
  }): Promise<ApiResponse> {
    return this.request('/api/borrowers', {
      method: 'POST',
      body: JSON.stringify(borrowerData),
    })
  }

  async updateBorrowerKyc(borrowerId: string, kycStatus: string, kycProvider?: string): Promise<ApiResponse> {
    return this.request(`/api/borrowers/${borrowerId}/kyc`, {
      method: 'PUT',
      body: JSON.stringify({ kycStatus, kycProvider }),
    })
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL)
export default apiService
