'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  Shield,
  Wallet,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { apiService } from '@/lib/api'

interface Loan {
  id: string
  loanId: string
  principalAmount: number
  remainingBalance: number
  interestRate: number
  maturityDate: string
  application: {
    property: {
      address: string
      city: string
      state: string
    }
  }
}

interface UpcomingPayment {
  id: string
  dueDate: string
  amount: number
  status: string
  loan: {
    loanId: string
    application: {
      property: {
        address: string
      }
    }
  }
}

const PaymentsPage: FC = () => {
  const { connected, publicKey, select, connected: walletConnected } = useWallet()
  const router = useRouter()
  const searchParams = useSearchParams()
  const loanIdParam = searchParams.get('loanId')

  const [loans, setLoans] = useState<Loan[]>([])
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([])
  const [selectedLoan, setSelectedLoan] = useState<string>(loanIdParam || '')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'wire'>('usdc')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchPaymentData()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (loanIdParam) {
      setSelectedLoan(loanIdParam)
    }
  }, [loanIdParam])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      const walletAddress = publicKey?.toBase58()
      if (!walletAddress) return

      const loansResponse = await apiService.getLoanApplications(walletAddress)
      if (loansResponse.success && loansResponse.data) {
        const activeLoans = loansResponse.data.filter(
          (app: any) => app.loan && (app.loan.status === 'ACTIVE' || app.loan.status === 'FUNDED')
        )
        const loanData = activeLoans.map((app: any) => app.loan)
        setLoans(loanData)

        if (loanData.length > 0 && !selectedLoan) {
          setSelectedLoan(loanData[0].id)
        }
      }

      const paymentsResponse = await apiService.getUpcomingPayments(walletAddress)
      if (paymentsResponse.success && paymentsResponse.data) {
        setUpcomingPayments(paymentsResponse.data)
      }
    } catch (err) {
      console.error('Error fetching payment data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedLoan || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const walletAddress = publicKey?.toBase58()
      if (!walletAddress) {
        setError('Wallet not connected')
        return
      }

      const response = await apiService.processPayment({
        loanId: selectedLoan,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        walletAddress
      })

      if (response.success) {
        setPaymentSuccess(true)
        setPaymentAmount('')
        setTimeout(() => {
          setPaymentSuccess(false)
          fetchPaymentData()
        }, 3000)
      } else {
        setError(response.error || 'Payment failed')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An error occurred while processing payment')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculatePaymentAmount = () => {
    const loan = loans.find(l => l.id === selectedLoan)
    if (!loan) return 0
    const monthlyInterest = loan.remainingBalance * loan.interestRate / 12
    const minimumPayment = Math.max(monthlyInterest * 1.5, 500)
    return Math.min(minimumPayment, loan.remainingBalance)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view and make payments</p>
          <button
            onClick={() => select(null)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>

        {paymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700">Your payment has been processed successfully.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Make a Payment
            </h2>

            {loans.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Loans</h3>
                <p className="text-gray-600">You don't have any active loans to make payments on.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Loan
                  </label>
                  <select
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {loan.application.property.address}, {loan.application.property.city}
                        {' - '}
                        {formatCurrency(loan.remainingBalance)} remaining
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(String(calculatePaymentAmount()))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Minimum Payment: {formatCurrency(calculatePaymentAmount())}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const loan = loans.find(l => l.id === selectedLoan)
                        if (loan) setPaymentAmount(String(loan.remainingBalance))
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Pay Off Balance
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('usdc')}
                      className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        paymentMethod === 'usdc'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">USDC</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wire')}
                      className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        paymentMethod === 'wire'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">Wire Transfer</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={processing || !selectedLoan || !paymentAmount}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Make Payment
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Payments are secured by Solana blockchain technology
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Payments
              </h2>

              {upcomingPayments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">No upcoming payments due.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.loan.application.property.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {formatDate(payment.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payments</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All payments are processed securely on the Solana blockchain.
                    USDC payments are instant and have low fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentsPage
