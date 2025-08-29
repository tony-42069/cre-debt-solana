'use client'

import { FC, useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react'

interface LoanCalculatorProps {
  propertyValue: number
  requestedAmount: number
  termMonths: number
  interestRate: number
  onAmountChange: (amount: number) => void
  onTermChange: (termMonths: number) => void
}

export const LoanCalculator: FC<LoanCalculatorProps> = ({
  propertyValue,
  requestedAmount,
  termMonths,
  interestRate,
  onAmountChange,
  onTermChange
}) => {
  const [inputAmount, setInputAmount] = useState<string>(requestedAmount?.toString() || '')
  const [inputTerm, setInputTerm] = useState<string>(termMonths?.toString() || '360')

  useEffect(() => {
    setInputAmount(requestedAmount?.toString() || '')
  }, [requestedAmount])

  useEffect(() => {
    setInputTerm(termMonths?.toString() || '360')
  }, [termMonths])

  const handleAmountInputChange = (value: string) => {
    setInputAmount(value)
    const numValue = parseFloat(value) || 0
    onAmountChange(numValue)
  }

  const handleTermInputChange = (value: string) => {
    setInputTerm(value)
    const numValue = parseInt(value) || 360
    onTermChange(numValue)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate loan metrics
  const maxLoanAmount = Math.floor(propertyValue * 0.9)
  const ltvRatio = propertyValue > 0 ? (requestedAmount / propertyValue) * 100 : 0
  const monthlyPayment = calculateMonthlyPayment(requestedAmount, interestRate, termMonths)
  const totalPayments = monthlyPayment * termMonths
  const totalInterest = totalPayments - requestedAmount

  function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    if (principal <= 0 || months <= 0) return 0
    const monthlyRate = annualRate / 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const quickAmounts = [
    { label: '50%', amount: Math.floor(propertyValue * 0.5) },
    { label: '70%', amount: Math.floor(propertyValue * 0.7) },
    { label: '80%', amount: Math.floor(propertyValue * 0.8) },
    { label: '90%', amount: maxLoanAmount }
  ]

  const quickTerms = [
    { label: '5 Years', months: 60 },
    { label: '10 Years', months: 120 },
    { label: '15 Years', months: 180 },
    { label: '30 Years', months: 360 }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Loan Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Property Value Display */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Property Value</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(propertyValue)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Max Loan (90% LTV)</span>
              <span className="text-sm font-medium text-green-700">
                {formatCurrency(maxLoanAmount)}
              </span>
            </div>
          </div>

          {/* Loan Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => handleAmountInputChange(e.target.value)}
                placeholder="Enter loan amount"
                min="100000"
                max={maxLoanAmount}
                step="1000"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAmounts.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAmountInputChange(option.amount.toString())}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {option.label} ({formatCurrency(option.amount)})
                </button>
              ))}
            </div>
          </div>

          {/* Loan Term Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (Months)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={inputTerm}
                onChange={(e) => handleTermInputChange(e.target.value)}
                placeholder="360"
                min="12"
                max="360"
                step="12"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>

            {/* Quick Term Buttons */}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickTerms.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleTermInputChange(option.months.toString())}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {requestedAmount > 0 && termMonths > 0 ? (
            <>
              {/* LTV Ratio */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">LTV Ratio</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    ltvRatio <= 90 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ltvRatio.toFixed(1)}%
                  </span>
                </div>
                {ltvRatio > 90 && (
                  <p className="mt-2 text-xs text-red-600">
                    LTV exceeds 90% maximum
                  </p>
                )}
              </div>

              {/* Monthly Payment */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">Monthly Payment</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(monthlyPayment)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-green-700">
                  Principal & Interest only
                </p>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium">{formatCurrency(requestedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-medium">{formatCurrency(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Payments:</span>
                    <span className="font-medium">{formatCurrency(totalPayments)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium">{(interestRate * 100).toFixed(2)}% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">{Math.floor(termMonths / 12)} years {termMonths % 12} months</span>
                  </div>
                </div>
              </div>

              {/* Interest Rate Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Interest rate shown is an estimate. Final rate will be determined
                  after credit assessment and may vary based on your financial profile.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Enter loan amount and term to see payment calculations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
