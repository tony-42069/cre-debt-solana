'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, useParams } from 'next/navigation'
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  TrendingDown,
  TrendingUp,
  PieChart,
  FileText,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { apiService } from '@/lib/api'

interface Loan {
  id: string
  loanId: string
  principalAmount: number
  interestRate: number
  termMonths: number
  status: string
  remainingBalance: number
  totalPaid: number
  maturityDate: string
  fundedAt: string | null
  createdAt: string
  application: {
    property: {
      address: string
      city: string
      state: string
      appraisedValue: number
    }
    requestedAmount: number
    ltvRatio: number
  }
  payments?: Payment[]
}

interface Payment {
  id: string
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  principalPortion: number
  interestPortion: number
}

const LoanDetailPage: FC = () => {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string

  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (connected && publicKey && loanId) {
      fetchLoanData()
    } else if (!connected) {
      setLoading(false)
    }
  }, [connected, publicKey, loanId])

  const fetchLoanData = async () => {
    try {
      setLoading(true)
      const walletAddress = publicKey?.toBase58()
      if (!walletAddress) return

      const response = await apiService.getLoanApplications(walletAddress)
      if (response.success && response.data) {
        const loans = response.data.filter((app: any) => app.loan?.id === loanId || app.id === loanId)
        if (loans.length > 0) {
          const loanData = loans[0]
          setLoan(loanData)
          if (loanData.loan?.payments) {
            setPayments(loanData.loan.payments)
          }
        } else {
          setError('Loan not found')
        }
      } else {
        setError(response.error || 'Failed to load loan')
      }
    } catch (err) {
      console.error('Error fetching loan:', err)
      setError('Failed to load loan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'FUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4" />
            Approved
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        )
      case 'DEFAULTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Defaulted
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <Clock className="w-4 h-4" />
            {status}
          </span>
        )
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
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateProgress = () => {
    if (!loan) return 0
    return ((loan.totalPaid / loan.principalAmount) * 100).toFixed(1)
  }

  const calculateLTV = () => {
    if (!loan) return 0
    return ((loan.principalAmount / loan.application.property.appraisedValue) * 100).toFixed(1)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view loan details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loan Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The loan you are looking for does not exist.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isActive = loan.status === 'ACTIVE' || loan.status === 'FUNDED'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {loan.application.property.address}
                  </h1>
                  {getStatusBadge(loan.status)}
                </div>
                <p className="text-gray-600">
                  {loan.application.property.city}, {loan.application.property.state}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-mono">Loan ID: {loan.loanId}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Principal Amount</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.principalAmount)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {loan.interestRate * 100}% Interest Rate
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Remaining Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.remainingBalance)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {calculateProgress()}% paid
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Maturity Date</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatDate(loan.maturityDate)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {loan.termMonths} month term
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <PieChart className="w-5 h-5" />
                  <span className="text-sm font-medium">LTV Ratio</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{calculateLTV()}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  of {formatCurrency(loan.application.property.appraisedValue)} value
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Repayment Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0%</span>
                <span>{calculateProgress()}% Paid ({formatCurrency(loan.totalPaid)})</span>
                <span>100%</span>
              </div>
            </div>

            {isActive && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/payments?loanId=${loan.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <CreditCard className="w-5 h-5" />
                  Make Payment
                </Link>
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <FileText className="w-5 h-5" />
                  Download Statement
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-600">
                {isActive
                  ? 'Your payment history will appear here once you make payments.'
                  : 'This loan has no recorded payments.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {payment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(payment.dueDate)}
                        {payment.paidDate && ` | Paid: ${formatDate(payment.paidDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payment.status)}
                    {payment.status === 'COMPLETED' && (
                      <p className="text-sm text-gray-500 mt-1">
                        P: {formatCurrency(payment.principalPortion)} | I: {formatCurrency(payment.interestPortion)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanDetailPage
