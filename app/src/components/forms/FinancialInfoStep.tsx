'use client'

import { FC } from 'react'
import { User, DollarSign, CreditCard, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react'

interface LoanApplicationData {
  annualIncome: number
  monthlyDebt: number
  creditScore: number
  employmentStatus: string
  yearsOfExperience: number
  loanPurpose: string
}

interface FinancialInfoStepProps {
  data: Partial<LoanApplicationData>
  errors: Record<string, string>
  onUpdate: (updates: Partial<LoanApplicationData>) => void
  onNext: () => void
  onPrevious: () => void
}

const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED', label: 'Employed Full-time' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'OTHER', label: 'Other' }
]

const LOAN_PURPOSES = [
  { value: 'REFINANCE', label: 'Refinance Existing Debt' },
  { value: 'EXPANSION', label: 'Business Expansion' },
  { value: 'ACQUISITION', label: 'Property Acquisition' },
  { value: 'RENOVATION', label: 'Property Renovation' },
  { value: 'WORKING_CAPITAL', label: 'Working Capital' },
  { value: 'OTHER', label: 'Other' }
]

const CREDIT_SCORE_RANGES = [
  { value: '800+', label: '800+ (Excellent)' },
  { value: '740-799', label: '740-799 (Very Good)' },
  { value: '670-739', label: '670-739 (Good)' },
  { value: '580-669', label: '580-669 (Fair)' },
  { value: '300-579', label: '300-579 (Poor)' }
]

export const FinancialInfoStep: FC<FinancialInfoStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext
}) => {
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

  // Calculate debt-to-income ratio
  const dtiRatio = data.annualIncome && data.monthlyDebt
    ? ((data.monthlyDebt * 12) / data.annualIncome) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Financial Information
        </h2>
        <p className="text-gray-600">
          Tell us about your financial situation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Income Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Income & Employment</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Annual Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Income ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={data.annualIncome || ''}
                  onChange={(e) => onUpdate({ annualIncome: parseFloat(e.target.value) || 0 })}
                  placeholder="150000"
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.annualIncome ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.annualIncome && (
                <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>
              )}
            </div>

            {/* Monthly Debt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Debt Payments ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={data.monthlyDebt || ''}
                  onChange={(e) => onUpdate({ monthlyDebt: parseFloat(e.target.value) || 0 })}
                  placeholder="2500"
                  min="0"
                  step="50"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Include mortgage, car loans, credit cards, etc.
              </p>
            </div>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status *
            </label>
            <select
              value={data.employmentStatus || ''}
              onChange={(e) => onUpdate({ employmentStatus: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.employmentStatus ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select employment status</option>
              {EMPLOYMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.employmentStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.employmentStatus}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Professional Experience
            </label>
            <input
              type="number"
              value={data.yearsOfExperience || ''}
              onChange={(e) => onUpdate({ yearsOfExperience: parseInt(e.target.value) || 0 })}
              placeholder="10"
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Credit Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Credit Profile</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Score Range
            </label>
            <select
              value={data.creditScore?.toString() || ''}
              onChange={(e) => onUpdate({ creditScore: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select credit score range</option>
              {CREDIT_SCORE_RANGES.map((range) => (
                <option key={range.value} value={range.value.split('-')[0]}>
                  {range.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              If you don't know your exact score, select the range that best applies
            </p>
          </div>
        </div>

        {/* Loan Purpose */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Loan Purpose</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Purpose for the Loan *
            </label>
            <select
              value={data.loanPurpose || ''}
              onChange={(e) => onUpdate({ loanPurpose: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.loanPurpose ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select loan purpose</option>
              {LOAN_PURPOSES.map((purpose) => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
            {errors.loanPurpose && (
              <p className="mt-1 text-sm text-red-600">{errors.loanPurpose}</p>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        {data.annualIncome && data.monthlyDebt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900">Financial Summary</h4>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Annual Income:</span>
                <div className="font-semibold text-blue-900">
                  {formatCurrency(data.annualIncome)}
                </div>
              </div>
              <div>
                <span className="text-blue-700">Monthly Debt:</span>
                <div className="font-semibold text-blue-900">
                  {formatCurrency(data.monthlyDebt)}
                </div>
              </div>
              <div>
                <span className="text-blue-700">Debt-to-Income:</span>
                <div className={`font-semibold ${
                  dtiRatio <= 36 ? 'text-green-600' :
                  dtiRatio <= 43 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dtiRatio.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-blue-700">Available Income:</span>
                <div className="font-semibold text-blue-900">
                  {formatCurrency((data.annualIncome - (data.monthlyDebt * 12)) / 12)}
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
              {dtiRatio <= 36 ? 'Excellent debt-to-income ratio!' :
               dtiRatio <= 43 ? 'Good debt-to-income ratio.' :
               'High debt-to-income ratio may affect approval.'}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Privacy & Security
              </h4>
              <p className="text-sm text-gray-600">
                Your financial information is encrypted and securely stored.
                We use this information to assess your loan eligibility and determine appropriate terms.
                All data is handled in compliance with financial privacy regulations.
              </p>
            </div>
          </div>
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
            disabled={!data.annualIncome || !data.employmentStatus || !data.loanPurpose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center ${
              data.annualIncome && data.employmentStatus && data.loanPurpose
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Review Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
