'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Building2, MapPin, DollarSign, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

interface Property {
  id: string
  propertyId: string
  address: string
  city: string
  state: string
  appraisedValue: number
  status: string
  createdAt: string
}

interface LoanApplicationData {
  propertyId: string
  propertyAddress: string
  propertyValue: number
}

interface PropertySelectionStepProps {
  data: Partial<LoanApplicationData>
  errors: Record<string, string>
  onUpdate: (updates: Partial<LoanApplicationData>) => void
  onNext: () => void
}

export const PropertySelectionStep: FC<PropertySelectionStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext
}) => {
  const { publicKey, connected } = useWallet()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchProperties()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const walletAddress = publicKey?.toBase58()
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch(`/api/properties?walletAddress=${walletAddress}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Filter only verified properties that can be used for loans
        const eligibleProperties = result.data.filter(
          (property: Property) => property.status === 'VERIFIED' || property.status === 'ACTIVE'
        )
        setProperties(eligibleProperties)
      } else {
        throw new Error(result.error || 'Failed to fetch properties')
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError(error instanceof Error ? error.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    onUpdate({
      propertyId: property.id,
      propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
      propertyValue: property.appraisedValue
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProperty) {
      onNext()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getMaxLoanAmount = (propertyValue: number) => {
    return Math.floor(propertyValue * 0.9)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Property Selection
          </h2>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
        <div className="flex justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Property for Loan
        </h2>
        <p className="text-gray-600">
          Choose the property you want to use as collateral for your loan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6">
              You need to register a property before applying for a loan.
            </p>
            <a
              href="/properties/register"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Property
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Properties
            </h3>

            {properties.map((property) => (
              <div
                key={property.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedProperty?.id === property.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePropertySelect(property)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-lg font-medium text-gray-900">
                        {property.address}
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          Value: {formatCurrency(property.appraisedValue)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">
                          Max Loan: {formatCurrency(getMaxLoanAmount(property.appraisedValue))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'VERIFIED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status}
                    </div>
                  </div>
                </div>

                {selectedProperty?.id === property.id && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">Selected for loan application</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.propertyId && (
          <p className="text-sm text-red-600">{errors.propertyId}</p>
        )}

        {/* Navigation */}
        {properties.length > 0 && (
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={!selectedProperty}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center ${
                selectedProperty
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Loan Terms
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
