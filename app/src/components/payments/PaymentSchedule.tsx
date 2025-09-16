'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Calendar, DollarSign, Clock, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { apiService } from '@/lib/api'

interface UpcomingPayment {
  id: string
  paymentId: string
  amount: number
  dueDate: string
  status: string
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

export const PaymentSchedule: FC = () => {
  const { publicKey, connected } = useWallet()
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) {
      fetchUpcomingPayments()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchUpcomingPayments = async () => {
    try {
      setLoading(true)
      const walletAddress = publicKey?.toString()

      if (!walletAddress) return

      console.log('Fetching upcoming payments for:', walletAddress)

      const response = await apiService.getUpcomingPayments(walletAddress)

      if (response.success) {
        setUpcomingPayments(response.data)
        console.log('Upcoming payments loaded:', response.data)
      } else {
        console.error('Failed to fetch upcoming payments:', response.error)
      }
    } catch (error) {
      console.error('Error fetching upcoming payments:', error)
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate)

    if (daysUntilDue < 0) {
      return 'border-red-200 bg-red-50' // Overdue
    } else if (daysUntilDue <= 7) {
      return 'border-orange-200 bg-orange-50' // Due soon
    } else if (daysUntilDue <= 30) {
      return 'border-yellow-200 bg-yellow-50' // Upcoming
    } else {
      return 'border-green-200 bg-green-50' // Future
    }
  }

  const getUrgencyIcon = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate)

    if (daysUntilDue < 0) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    } else if (daysUntilDue <= 7) {
      return <Clock className="h-5 w-5 text-orange-600" />
    } else {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  const getUrgencyText = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate)

    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} days`
    } else if (daysUntilDue === 0) {
      return 'Due today'
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow'
    } else if (daysUntilDue <= 7) {
      return `Due in ${daysUntilDue} days`
    } else {
      return `Due in ${daysUntilDue} days`
    }
  }

  const totalUpcomingAmount = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const overduePayments = upcomingPayments.filter(p => getDaysUntilDue(p.dueDate) < 0)
  const dueSoonPayments = upcomingPayments.filter(p => {
    const days = getDaysUntilDue(p.dueDate)
    return days >= 0 && days <= 7
  })

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-900 mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-yellow-700">
          Please connect your Solana wallet to view payment schedule
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading payment schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Upcoming</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalUpcomingAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Soon (≤7 days)</p>
              <p className="text-xl font-bold text-orange-600">{dueSoonPayments.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-red-600">{overduePayments.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Schedule</h2>
          </div>
        </div>

        <div className="p-6">
          {upcomingPayments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Payments</h4>
              <p className="text-gray-600">
                You don't have any upcoming payments scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingPayments
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((payment) => (
                  <div
                    key={payment.id}
                    className={`border rounded-lg p-4 transition-colors ${getUrgencyColor(payment.dueDate)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        {getUrgencyIcon(payment.dueDate)}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </h4>
                            <span className="text-sm font-medium text-gray-600">
                              {new Date(payment.dueDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {payment.loan.application.property.address}, {payment.loan.application.property.city}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-500">Loan ID:</span>
                              <span className="font-mono text-gray-900">{payment.loan.loanId}</span>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              getDaysUntilDue(payment.dueDate) < 0
                                ? 'bg-red-100 text-red-700'
                                : getDaysUntilDue(payment.dueDate) <= 7
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {getUrgencyText(payment.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Tips */}
      {upcomingPayments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Payment Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Set up automatic payments to avoid late fees</li>
                <li>• USDC payments are processed instantly on Solana</li>
                <li>• Keep track of your payment history for tax purposes</li>
                <li>• Contact support if you need to modify payment terms</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
