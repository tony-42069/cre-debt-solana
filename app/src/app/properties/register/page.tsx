'use client'

import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { apiService } from '@/lib/api'

const PropertyRegistrationPage: FC = () => {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const steps = [
    { id: 1, title: 'Property Details', description: 'Basic property information' },
    { id: 2, title: 'Valuation', description: 'Property valuation details' },
    { id: 3, title: 'Documentation', description: 'Upload required documents' },
    { id: 4, title: 'Review & Submit', description: 'Review and submit application' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (formData: any) => {
    if (!publicKey) {
      setSubmitError('Wallet not connected')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create FormData for multipart upload
      const submitData = new FormData()

      // Add wallet address
      submitData.append('walletAddress', publicKey.toString())

      // Add form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value instanceof File) {
          // Handle file uploads
          submitData.append(key, value)
        } else if (value !== undefined && value !== null) {
          // Handle regular form fields
          submitData.append(key, String(value))
        }
      })

      console.log('Submitting property registration:', Object.fromEntries(submitData))

      // Call API
      const response = await apiService.createProperty(submitData)

      if (response.success) {
        console.log('Property registration successful:', response.data)
        // Redirect to success page or dashboard
        router.push('/dashboard?tab=properties')
      } else {
        console.error('Property registration failed:', response.error)
        setSubmitError(response.error || 'Failed to register property')
      }
    } catch (error) {
      console.error('Error submitting property registration:', error)
      setSubmitError('Network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Wallet Connection Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your Solana wallet to register a property for lending.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Register Your Property
            </h1>
            <p className="text-gray-600">
              Complete the registration process to unlock up to 90% of your property's value
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          <PropertyForm
            currentStep={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@cre-debt.com" className="text-blue-600 hover:text-blue-700">
              support@cre-debt.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PropertyRegistrationPage
