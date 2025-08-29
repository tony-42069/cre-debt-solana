'use client'

import { FC, useState, useEffect } from 'react'
import { PropertySelectionStep } from './PropertySelectionStep'
import { LoanTermsStep } from './LoanTermsStep'
import { FinancialInfoStep } from './FinancialInfoStep'
import { LoanReviewStep } from './LoanReviewStep'

interface LoanApplicationData {
  // Step 1: Property Selection
  propertyId: string
  propertyAddress: string
  propertyValue: number

  // Step 2: Loan Terms
  requestedAmount: number
  loanToValue: number
  termMonths: number
  interestRate: number
  paymentFrequency: string

  // Step 3: Financial Info
  annualIncome: number
  monthlyDebt: number
  creditScore: number
  employmentStatus: string
  yearsOfExperience: number
  loanPurpose: string
}

interface LoanApplicationFormProps {
  currentStep: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: (data: LoanApplicationData) => void
  isSubmitting: boolean
}

export const LoanApplicationForm: FC<LoanApplicationFormProps> = ({
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Partial<LoanApplicationData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (updates: Partial<LoanApplicationData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.propertyId) newErrors.propertyId = 'Please select a property'
        break

      case 2:
        if (!formData.requestedAmount || formData.requestedAmount <= 0) {
          newErrors.requestedAmount = 'Valid loan amount is required'
        }
        if (!formData.termMonths || formData.termMonths < 12) {
          newErrors.termMonths = 'Minimum loan term is 12 months'
        }
        if (formData.loanToValue && formData.loanToValue > 90) {
          newErrors.loanToValue = 'Maximum LTV ratio is 90%'
        }
        break

      case 3:
        if (!formData.annualIncome || formData.annualIncome <= 0) {
          newErrors.annualIncome = 'Valid annual income is required'
        }
        if (!formData.employmentStatus) {
          newErrors.employmentStatus = 'Employment status is required'
        }
        if (!formData.loanPurpose) {
          newErrors.loanPurpose = 'Loan purpose is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      onNext()
    }
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData as LoanApplicationData)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertySelectionStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <LoanTermsStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={onPrevious}
          />
        )
      case 3:
        return (
          <FinancialInfoStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={onPrevious}
          />
        )
      case 4:
        return (
          <LoanReviewStep
            data={formData}
            onPrevious={onPrevious}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {renderStep()}
    </div>
  )
}
