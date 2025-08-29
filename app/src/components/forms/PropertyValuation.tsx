'use client'

import { FC, useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react'

interface PropertyValuationProps {
  appraisedValue?: number
  onValueChange: (value: number) => void
}

export const PropertyValuation: FC<PropertyValuationProps> = ({
  appraisedValue = 0,
  onValueChange
}) => {
  const [inputValue, setInputValue] = useState<string>(appraisedValue?.toString() || '')

  useEffect(() => {
    setInputValue(appraisedValue?.toString() || '')
  }, [appraisedValue])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    const numValue = parseFloat(value) || 0
    onValueChange(numValue)
  }

  const maxLoanAmount = Math.floor(appraisedValue * 0.9) // 90% LTV
  const ltvRatio = appraisedValue > 0 ? 90 : 0
  const monthlyPayment = maxLoanAmount > 0 ? calculateMonthlyPayment(maxLoanAmount, 0.08, 360) : 0

  function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Calculator className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Property Valuation Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Value ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter property value"
                min="100000"
                step="1000"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          {appraisedValue >= 100000 && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center text-green-700 mb-2">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="font-medium">Loan Eligibility</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum LTV:</span>
                  <span className="font-semibold text-green-700">90%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Loan Amount:</span>
                  <span className="font-semibold text-green-700">
                    ${maxLoanAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {appraisedValue >= 100000 ? (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center text-blue-700 mb-3">
                <Percent className="h-5 w-5 mr-2" />
                <span className="font-medium">Loan Estimate (30-year term)</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-semibold text-lg">
                    ${maxLoanAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-semibold">8.0% APR</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Est. Monthly Payment:</span>
                  <span className="font-semibold text-lg text-blue-700">
                    ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  * This is an estimate. Actual rates and terms may vary based on your credit profile and property details.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Enter a property value of $100,000 or more to see loan estimates
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {appraisedValue >= 100000 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                Why 90% LTV?
              </h4>
              <p className="text-sm text-yellow-700">
                Traditional lenders offer 65-75% LTV. Our advanced risk assessment and blockchain security
                enable higher loan-to-value ratios, giving you access to more capital for your business needs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
