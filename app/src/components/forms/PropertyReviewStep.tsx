'use client'

import { FC } from 'react'
import { CheckCircle, FileText, MapPin, Calculator, ArrowLeft, Send } from 'lucide-react'

interface PropertyFormData {
  // Step 1: Property Details
  propertyType: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  // Step 2: Valuation
  appraisedValue: number
  valuationDate: string
  valuationMethod: string
  valuationProvider: string
  valuationReport?: File

  // Step 3: Documentation
  propertyDeed?: File
  titleInsurance?: File
  survey?: File
  environmentalReport?: File
  additionalDocs?: File[]
}

interface PropertyReviewStepProps {
  data: Partial<PropertyFormData>
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  OFFICE: 'Office Building',
  RETAIL: 'Retail/Commercial',
  INDUSTRIAL: 'Industrial/Warehouse',
  MULTIFAMILY: 'Multi-Family Residential',
  HOSPITALITY: 'Hotel/Hospitality',
  LAND: 'Land/Development',
  SPECIALTY: 'Specialty/Other'
}

const VALUATION_METHOD_LABELS: Record<string, string> = {
  APPRAISAL: 'Professional Appraisal',
  AVM: 'Automated Valuation Model (AVM)',
  INCOME: 'Income Capitalization',
  SALES_COMPARISON: 'Sales Comparison Approach',
  COST_APPROACH: 'Cost Approach'
}

export const PropertyReviewStep: FC<PropertyReviewStepProps> = ({
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const maxLoanAmount = data.appraisedValue ? Math.floor(data.appraisedValue * 0.9) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Information
        </h2>
        <p className="text-gray-600">
          Please review all information before submitting your property registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Details Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-medium text-gray-900">
                {PROPERTY_TYPE_LABELS[data.propertyType || ''] || data.propertyType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{data.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium text-gray-900">{data.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium text-gray-900">{data.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ZIP Code</p>
              <p className="font-medium text-gray-900">{data.zipCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium text-gray-900">{data.country}</p>
            </div>
          </div>
        </div>

        {/* Valuation Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Property Valuation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Appraised Value</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(data.appraisedValue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valuation Date</p>
              <p className="font-medium text-gray-900">
                {data.valuationDate ? formatDate(data.valuationDate) : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valuation Method</p>
              <p className="font-medium text-gray-900">
                {VALUATION_METHOD_LABELS[data.valuationMethod || ''] || data.valuationMethod}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valuation Provider</p>
              <p className="font-medium text-gray-900">{data.valuationProvider}</p>
            </div>
          </div>

          {/* Loan Estimate */}
          {maxLoanAmount > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Loan Eligibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Maximum LTV</p>
                  <p className="font-semibold text-green-900">90%</p>
                </div>
                <div>
                  <p className="text-green-700">Max Loan Amount</p>
                  <p className="font-semibold text-green-900">{formatCurrency(maxLoanAmount)}</p>
                </div>
                <div>
                  <p className="text-green-700">Est. Monthly Payment</p>
                  <p className="font-semibold text-green-900">
                    {formatCurrency(calculateMonthlyPayment(maxLoanAmount, 0.08, 360))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Documentation Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Property Deed</span>
              {data.propertyDeed ? (
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{data.propertyDeed.name}</span>
                </div>
              ) : (
                <span className="text-sm text-red-500">Required</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Title Insurance</span>
              {data.titleInsurance ? (
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{data.titleInsurance.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Optional</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Property Survey</span>
              {data.survey ? (
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{data.survey.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Optional</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Environmental Report</span>
              {data.environmentalReport ? (
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{data.environmentalReport.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Optional</span>
              )}
            </div>

            {data.additionalDocs && data.additionalDocs.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 mb-2">Additional Documents:</p>
                {data.additionalDocs.map((file, index) => (
                  <div key={index} className="flex items-center text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">
            Important Information
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• All information provided will be verified by our team</li>
            <li>• Property registration typically takes 24-48 hours to process</li>
            <li>• You will receive email updates on your application status</li>
            <li>• Documents are securely encrypted and stored</li>
            <li>• By submitting, you agree to our terms of service and privacy policy</li>
          </ul>
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}
