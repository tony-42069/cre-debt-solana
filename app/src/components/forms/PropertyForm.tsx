'use client'

import { FC, useState } from 'react'
import { PropertyDetailsStep } from './PropertyDetailsStep'
import { PropertyValuationStep } from './PropertyValuationStep'
import { PropertyDocumentationStep } from './PropertyDocumentationStep'
import { PropertyReviewStep } from './PropertyReviewStep'

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

interface PropertyFormProps {
  currentStep: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: (data: PropertyFormData) => void
  isSubmitting: boolean
}

export const PropertyForm: FC<PropertyFormProps> = ({
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Partial<PropertyFormData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (updates: Partial<PropertyFormData>) => {
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
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required'
        if (!formData.address) newErrors.address = 'Address is required'
        if (!formData.city) newErrors.city = 'City is required'
        if (!formData.state) newErrors.state = 'State is required'
        if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
        break

      case 2:
        if (!formData.appraisedValue || formData.appraisedValue <= 0) {
          newErrors.appraisedValue = 'Valid appraised value is required'
        }
        if (!formData.valuationDate) newErrors.valuationDate = 'Valuation date is required'
        if (!formData.valuationMethod) newErrors.valuationMethod = 'Valuation method is required'
        if (!formData.valuationProvider) newErrors.valuationProvider = 'Valuation provider is required'
        break

      case 3:
        // Documentation validation - at least property deed required
        if (!formData.propertyDeed) newErrors.propertyDeed = 'Property deed is required'
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
      onSubmit(formData as PropertyFormData)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyDetailsStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <PropertyValuationStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={onPrevious}
          />
        )
      case 3:
        return (
          <PropertyDocumentationStep
            data={formData}
            errors={errors}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={onPrevious}
          />
        )
      case 4:
        return (
          <PropertyReviewStep
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
