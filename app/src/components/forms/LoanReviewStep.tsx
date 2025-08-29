'use client'

import { FC } from 'react'
import { CheckCircle, Building2, Calculator, User, FileText, ArrowLeft, Send, AlertTriangle } from 'lucide-react'

interface LoanApplicationData {
  // Property Selection
  propertyId: string
  propertyAddress: string
  propertyValue: number

  // Loan Terms
  requestedAmount: number
  loanToValue: number
  termMonths: number
  interestRate: number
  paymentFrequency: string

  // Financial Info
  annualIncome: number
  monthlyDebt: number
  creditScore: number
  employmentStatus: string
  yearsOfExperience: number
  loanPurpose: string
}

interface LoanReviewStepProps {
  data: Partial<LoanApplicationData>
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  EMPLOYED: 'Employed Full-time',
  SELF_EMPLOYED: 'Self-Employed',
  BUSINESS_OWNER: 'Business Owner',
  RETIRED: 'Retired',
  OTHER: 'Other'
}

const LOAN_PURPOSE_LABELS: Record<string, string> = {
  REFINANCE: 'Refinance Existing Debt',
  EXPANSION: 'Business Expansion',
  ACQUISITION: 'Property Acquisition',
  RENOVATION: 'Property Renovation',
  WORKING_CAPITAL: 'Working Capital',
  OTHER: 'Other'
}

const CREDIT_SCORE_LABELS: Record<string, string> = {
  800: '800+ (Excellent)',
  740: '740-799 (Very Good)',
  670: '670-739 (Good)',
  580: '580-669 (Fair)',
  300: '300-579 (Poor)'
}

export const LoanReviewStep: FC<LoanReviewStepProps> = ({
  data,
  onPrevious,
  onSubmit,
  isSubmitting
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
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
  const monthlyPayment = calculateMonthlyPayment(
    data.requestedAmount || 0,
    data.interestRate || 0.08,
    data.termMonths || 360
  )
  const totalPayments = monthlyPayment * (data.termMonths || 360)
  const totalInterest = totalPayments - (data.requestedAmount || 0)
  const dtiRatio = data.annualIncome && data.monthlyDebt
    ? ((data.monthlyDebt * 12) / data.annualIncome) * 100
    : 0

  function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    if (principal <= 0 || months <= 0) return 0
    const monthlyRate = annualRate / 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const getRiskAssessment = () => {
    let score = 0

    // Credit score (0-30 points)
    if (data.creditScore && data.creditScore >= 740) score += 30
    else if (data.creditScore && data.creditScore >= 670) score += 20
    else if (data.creditScore && data.creditScore >= 580) score += 10

    // DTI ratio (0-25 points)
    if (dtiRatio <= 36) score += 25
    else if (dtiRatio <= 43) score += 15
    else if (dtiRatio <= 50) score += 5

    // LTV ratio (0-25 points)
    if ((data.loanToValue || 0) <= 75) score += 25
    else if ((data.loanToValue || 0) <= 85) score += 15
    else if ((data.loanToValue || 0) <= 90) score += 5

    // Employment (0-20 points)
    if (data.employmentStatus === 'EMPLOYED' || data.employmentStatus === 'BUSINESS_OWNER') score += 20
    else if (data.employmentStatus === 'SELF_EMPLOYED') score += 15

    return score
  }

  const riskScore = getRiskAssessment()
  const riskLevel = riskScore >= 80 ? 'Low' : riskScore >= 60 ? 'Medium' : 'High'
  const riskColor = riskScore >= 80 ? 'text-green-600' : riskScore >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Application
        </h2>
        <p className="text-gray-600">
          Please review all information before submitting your loan application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Property Address:</span>
              <div className="font-medium text-gray-900">{data.propertyAddress}</div>
            </div>
            <div>
              <span className="text-gray-600">Property Value:</span>
              <div className="font-medium text-gray-900">{formatCurrency(data.propertyValue || 0)}</div>
            </div>
          </div>
        </div>

        {/* Loan Terms */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Loan Terms</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Requested Amount:</span>
              <div className="font-medium text-gray-900">{formatCurrency(data.requestedAmount || 0)}</div>
            </div>
            <div>
              <span className="text-gray-600">Loan-to-Value:</span>
              <div className="font-medium text-gray-900">{(data.loanToValue || 0).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-gray-600">Term:</span>
              <div className="font-medium text-gray-900">{Math.floor((data.termMonths || 360) / 12)} years</div>
            </div>
            <div>
              <span className="text-gray-600">Interest Rate:</span>
              <div className="font-medium text-gray-900">{((data.interestRate || 0.08) * 100).toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-gray-600">Monthly Payment:</span>
              <div className="font-medium text-gray-900">{formatCurrency(monthlyPayment)}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Interest:</span>
              <div className="font-medium text-gray-900">{formatCurrency(totalInterest)}</div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Annual Income:</span>
              <div className="font-medium text-gray-900">{formatCurrency(data.annualIncome || 0)}</div>
            </div>
            <div>
              <span className="text-gray-600">Monthly Debt:</span>
              <div className="font-medium text-gray-900">{formatCurrency(data.monthlyDebt || 0)}</div>
            </div>
            <div>
              <span className="text-gray-600">Debt-to-Income:</span>
              <div className="font-medium text-gray-900">{dtiRatio.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-gray-600">Employment:</span>
              <div className="font-medium text-gray-900">
                {EMPLOYMENT_LABELS[data.employmentStatus || ''] || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Credit Score:</span>
              <div className="font-medium text-gray-900">
                {CREDIT_SCORE_LABELS[data.creditScore || 0] || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Loan Purpose:</span>
              <div className="font-medium text-gray-900">
                {LOAN_PURPOSE_LABELS[data.loanPurpose || ''] || 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
              riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {riskLevel} Risk
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{riskScore}</div>
              <div className="text-gray-600">Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {(data.loanToValue || 0).toFixed(1)}%
              </div>
              <div className="text-gray-600">LTV Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {dtiRatio.toFixed(1)}%
              </div>
              <div className="text-gray-600">DTI Ratio</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Estimated Approval:</strong> {
                riskScore >= 80 ? 'High likelihood of approval' :
                riskScore >= 60 ? 'Moderate likelihood - may require additional documentation' :
                'Lower likelihood - consider improving credit or reducing loan amount'
              }
            </p>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                Important Terms & Conditions
              </h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• All information provided is accurate and complete to the best of my knowledge</p>
                <p>• I authorize CRE-Debt to verify the information provided</p>
                <p>• I understand that final loan terms may vary based on credit assessment</p>
                <p>• I agree to the platform's terms of service and privacy policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Loan Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
