'use client'

import { FC, useState, useEffect } from 'react'
import { Calculator, DollarSign, Calendar, Percent, ArrowRight, ArrowLeft } from 'lucide-react'
import { LoanCalculator } from './LoanCalculator'

interface LoanApplicationData {
  propertyId: string
  propertyAddress: string
  propertyValue: number
  requestedAmount: number
  loanToValue: number
  termMonths: number
  interestRate: number
  paymentFrequency: string
}

interface LoanTermsStepProps {
  data: Partial<LoanApplicationData>
  errors: Record<string, string>
  onUpdate: (updates: Partial<LoanApplicationData>) => void
  onNext: () => void
  onPrevious: () => void
}

const PAYMENT_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
]

const LOAN_TERMS = [
  { value: 12, label: '1 Year' },
  { value: 24, label: '2 Years' },
  { value: 36, label: '3 Years' },
  { value: 60, label: '5 Years' },
  { value: 120, label: '10 Years' },
  { value: 180, label: '15 Years' },
  { value: 240, label: '20 Years' },
  { value: 360, label: '30 Years' }
]

export const LoanTermsStep: FC<LoanTermsStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext
}) => {
  const [calculatedLTV, setCalculatedLTV] = useState<number>(0)

  useEffect(() => {
    if (data.propertyValue && data.requestedAmount) {
      const ltv = (data.requestedAmount / data.propertyValue) * 100
      setCalculatedLTV(ltv)
      onUpdate({ loanToValue: ltv })
    }
  }, [data.propertyValue, data.requestedAmount])

  const handleAmountChange = (amount: number) => {
    onUpdate({ requestedAmount: amount })
  }

  const handleTermChange = (termMonths: number) => {
    onUpdate({ termMonths })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const maxLoanAmount = data.propertyValue ? Math.floor(data.propertyValue * 0.9) : 0
  const minLoanAmount = 100000 // $100K minimum

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Loan Terms & Calculator
        </h2>
        <p className="text-gray-600">
          Set your desired loan amount and terms
        </p>
      </div>

      {/* Property Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Property</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.propertyAddress}</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(data.propertyValue || 0)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Maximum Loan Amount (90% LTV)</span>
          <span className="text-sm font-medium text-green-700">
            {formatCurrency(maxLoanAmount)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Calculator */}
        <LoanCalculator
          propertyValue={data.propertyValue || 0}
          requestedAmount={data.requestedAmount || 0}
          termMonths={data.termMonths || 360}
          interestRate={data.interestRate || 0.08}
          onAmountChange={handleAmountChange}
          onTermChange={handleTermChange}
        />

        {/* Requested Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requested Loan Amount ($) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={data.requestedAmount || ''}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
              placeholder="500000"
              min={minLoanAmount}
              max={maxLoanAmount}
              step="1000"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.requestedAmount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>Min: {formatCurrency(minLoanAmount)}</span>
            <span>Max: {formatCurrency(maxLoanAmount)}</span>
          </div>
          {errors.requestedAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.requestedAmount}</p>
          )}
        </div>

        {/* LTV Ratio Display */}
        {calculatedLTV > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Loan-to-Value Ratio</span>
              </div>
              <span className={`text-lg font-bold ${
                calculatedLTV <= 90 ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculatedLTV.toFixed(1)}%
              </span>
            </div>
            {calculatedLTV > 90 && (
              <p className="mt-2 text-sm text-red-600">
                LTV ratio cannot exceed 90%. Please reduce your loan amount.
              </p>
            )}
          </div>
        )}

        {/* Loan Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term *
          </label>
          <select
            value={data.termMonths || ''}
            onChange={(e) => onUpdate({ termMonths: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.termMonths ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select loan term</option>
            {LOAN_TERMS.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label} ({term.value} months)
              </option>
            ))}
          </select>
          {errors.termMonths && (
            <p className="mt-1 text-sm text-red-600">{errors.termMonths}</p>
          )}
        </div>

        {/* Interest Rate Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900">Estimated Interest Rate</span>
            <span className="text-lg font-bold text-green-700">
              {(data.interestRate || 0.08) * 100}%
            </span>
          </div>
          <p className="mt-1 text-xs text-green-700">
            * Final rate determined after credit assessment
          </p>
        </div>

        {/* Payment Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Frequency
          </label>
          <select
            value={data.paymentFrequency || 'monthly'}
            onChange={(e) => onUpdate({ paymentFrequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PAYMENT_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!data.requestedAmount || !data.termMonths || calculatedLTV > 90}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center ${
              data.requestedAmount && data.termMonths && calculatedLTV <= 90
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Financial Info
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
