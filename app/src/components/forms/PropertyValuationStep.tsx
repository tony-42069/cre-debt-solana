'use client'

import { FC } from 'react'
import { Calculator, DollarSign, Calendar, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { PropertyValuation } from './PropertyValuation'

interface PropertyFormData {
  appraisedValue: number
  valuationDate: string
  valuationMethod: string
  valuationProvider: string
  valuationReport?: File
}

interface PropertyValuationStepProps {
  data: Partial<PropertyFormData>
  errors: Record<string, string>
  onUpdate: (updates: Partial<PropertyFormData>) => void
  onNext: () => void
  onPrevious: () => void
}

const VALUATION_METHODS = [
  { value: 'APPRAISAL', label: 'Professional Appraisal' },
  { value: 'AVM', label: 'Automated Valuation Model (AVM)' },
  { value: 'INCOME', label: 'Income Capitalization' },
  { value: 'SALES_COMPARISON', label: 'Sales Comparison Approach' },
  { value: 'COST_APPROACH', label: 'Cost Approach' }
]

export const PropertyValuationStep: FC<PropertyValuationStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpdate({ valuationReport: file })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Valuation
        </h2>
        <p className="text-gray-600">
          Provide your property's valuation details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Valuation Calculator */}
        <PropertyValuation
          appraisedValue={data.appraisedValue}
          onValueChange={(value) => onUpdate({ appraisedValue: value })}
        />

        {/* Appraised Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appraised Value ($) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={data.appraisedValue || ''}
              onChange={(e) => onUpdate({ appraisedValue: parseFloat(e.target.value) || 0 })}
              placeholder="500000"
              min="100000"
              step="1000"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.appraisedValue ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.appraisedValue && (
            <p className="mt-1 text-sm text-red-600">{errors.appraisedValue}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Minimum loan amount: $100,000
          </p>
        </div>

        {/* Valuation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valuation Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={data.valuationDate || ''}
              onChange={(e) => onUpdate({ valuationDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.valuationDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.valuationDate && (
            <p className="mt-1 text-sm text-red-600">{errors.valuationDate}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Valuation must be within the last 12 months
          </p>
        </div>

        {/* Valuation Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valuation Method *
          </label>
          <select
            value={data.valuationMethod || ''}
            onChange={(e) => onUpdate({ valuationMethod: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.valuationMethod ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select valuation method</option>
            {VALUATION_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.valuationMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.valuationMethod}</p>
          )}
        </div>

        {/* Valuation Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valuation Provider *
          </label>
          <input
            type="text"
            value={data.valuationProvider || ''}
            onChange={(e) => onUpdate({ valuationProvider: e.target.value })}
            placeholder="ABC Appraisal Services"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.valuationProvider ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.valuationProvider && (
            <p className="mt-1 text-sm text-red-600">{errors.valuationProvider}</p>
          )}
        </div>

        {/* Valuation Report Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valuation Report (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-2">
              Upload your valuation report (PDF, max 10MB)
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="valuation-report"
            />
            <label
              htmlFor="valuation-report"
              className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Choose file
            </label>
            {data.valuationReport && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {data.valuationReport.name}
              </p>
            )}
          </div>
        </div>

        {/* LTV Information */}
        {data.appraisedValue && data.appraisedValue >= 100000 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Maximum Loan Amount
                </h4>
                <p className="text-sm text-green-700">
                  Based on your appraised value of ${(data.appraisedValue || 0).toLocaleString()},
                  you may be eligible for up to ${(Math.floor((data.appraisedValue || 0) * 0.9)).toLocaleString()}
                  (90% LTV) through our platform.
                </p>
              </div>
            </div>
          </div>
        )}

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            Continue to Documentation
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
