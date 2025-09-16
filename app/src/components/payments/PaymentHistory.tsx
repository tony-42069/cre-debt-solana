'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { History, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react'
import { apiService } from '@/lib/api'

interface Payment {
  id: string
  paymentId: string
  amount: number
  paymentType: string
  paymentMethod: string
  status: string
  dueDate: string
  paidDate: string | null
  processedAt: string | null
  blockchainTx: string | null
  loan: {
    loanId: string
    application: {
      property: {
        address: string
        city: string
        state: string
      }
    }
  }
}

export const PaymentHistory: FC = () => {
  const { publicKey, connected } = useWallet()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  useEffect(() => {
    if (connected && publicKey) {
      fetchPaymentHistory()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      const walletAddress = publicKey?.toString()

      if (!walletAddress) return

      console.log('Fetching payment history for:', walletAddress)

      const response = await apiService.getPaymentHistory(walletAddress)

      if (response.success) {
        setPayments(response.data)
        console.log('Payment history loaded:', response.data)
      } else {
        console.error('Failed to fetch payment history:', response.error)
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'processing':
        return <Clock className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.status.toLowerCase() === filter
  })

  const totalPaid = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-900 mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-yellow-700">
          Please connect your Solana wallet to view payment history
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading payment history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All Payments', count: payments.length },
            { key: 'completed', label: 'Completed', count: payments.filter(p => p.status === 'COMPLETED').length },
            { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'PENDING').length },
            { key: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'FAILED').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No Payments Yet' : `No ${filter} payments`}
            </h4>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Your payment history will appear here once you make payments'
                : `No payments with ${filter} status found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {payment.loan.application.property.address}, {payment.loan.application.property.city}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Payment ID</p>
                        <p className="font-mono text-xs text-gray-900">{payment.paymentId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Method</p>
                        <p className="text-gray-900 capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className="text-gray-900">{new Date(payment.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Loan ID</p>
                        <p className="font-mono text-xs text-gray-900">{payment.loan.loanId}</p>
                      </div>
                    </div>

                    {payment.blockchainTx && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Blockchain TX:</span>
                            <span className="font-mono text-xs text-gray-900">{payment.blockchainTx}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-xs">
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-2 capitalize">{payment.status.toLowerCase()}</span>
                    </div>

                    {payment.processedAt && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(payment.processedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
