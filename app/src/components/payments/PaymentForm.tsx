'use client'

import { FC, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { apiService } from '@/lib/api'

interface PaymentFormProps {
  loanId: string
  amount: number
  dueDate: string
  onPaymentSuccess: (transactionId: string) => void
  onPaymentError: (error: string) => void
}

export const PaymentForm: FC<PaymentFormProps> = ({
  loanId,
  amount,
  dueDate,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { publicKey, connected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'wire'>('usdc')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      onPaymentError('Please connect your wallet first')
      return
    }

    if (!agreedToTerms) {
      onPaymentError('Please agree to the terms and conditions')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare payment data
      const paymentData = {
        loanId,
        amount,
        paymentMethod,
        walletAddress: publicKey.toString(),
        dueDate
      }

      console.log('Processing payment:', paymentData)

      // Call API service
      const response = await apiService.processPayment(paymentData)

      if (response.success) {
        console.log('Payment processed successfully:', response.data)
        onPaymentSuccess(response.data.transactionId || 'TXN_SUCCESS')
      } else {
        console.error('Payment failed:', response.error)
        onPaymentError(response.error || 'Payment processing failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError('Network error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
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

  const isOverdue = new Date(dueDate) < new Date()

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-900 mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-yellow-700">
          Please connect your Solana wallet to make payments
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Make Payment
        </h2>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Due:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {new Date(dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loan ID:</span>
            <span className="font-mono text-sm text-gray-900">{loanId}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="usdc"
              checked={paymentMethod === 'usdc'}
              onChange={(e) => setPaymentMethod(e.target.value as 'usdc')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">USDC Transfer</div>
                <div className="text-xs text-gray-500">Instant blockchain payment</div>
              </div>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="wire"
              checked={paymentMethod === 'wire'}
              onChange={(e) => setPaymentMethod(e.target.value as 'wire')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">Wire Transfer</div>
                <div className="text-xs text-gray-500">Traditional bank transfer (2-3 business days)</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="mb-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <div className="ml-3">
            <div className="text-sm text-gray-900">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </label>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing || !agreedToTerms}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isProcessing || !agreedToTerms
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {formatCurrency(amount)}
          </div>
        )}
      </button>

      {/* Payment Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-1">Secure Payment Processing</div>
            <div>
              {paymentMethod === 'usdc'
                ? 'USDC payments are processed instantly on the Solana blockchain with bank-level security.'
                : 'Wire transfers are processed through our secure banking partners within 2-3 business days.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
