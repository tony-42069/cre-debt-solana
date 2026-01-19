'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, useParams } from 'next/navigation'
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Edit,
  FileText,
  Building,
  Home,
  Briefcase,
  TreePine,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { apiService } from '@/lib/api'

interface Property {
  id: string
  propertyId: string
  propertyType: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  appraisedValue: number
  valuationDate: string
  valuationMethod: string
  valuationProvider: string
  status: string
  verified: boolean
  createdAt: string
}

const PropertyDetailPage: FC = () => {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (connected && publicKey && propertyId) {
      fetchProperty()
    } else if (!connected) {
      setLoading(false)
    }
  }, [connected, publicKey, propertyId])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProperty(propertyId)
      if (response.success && response.data) {
        setProperty(response.data)
      } else {
        setError(response.error || 'Property not found')
      }
    } catch (err) {
      console.error('Error fetching property:', err)
      setError('Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'OFFICE':
        return <Building className="w-6 h-6" />
      case 'RETAIL':
        return <Home className="w-6 h-6" />
      case 'INDUSTRIAL':
        return <Briefcase className="w-6 h-6" />
      case 'MULTIFAMILY':
        return <Building2 className="w-6 h-6" />
      case 'HOSPITALITY':
        return <TreePine className="w-6 h-6" />
      default:
        return <Building className="w-6 h-6" />
    }
  }

  const getPropertyTypeName = (type: string) => {
    const types: Record<string, string> = {
      OFFICE: 'Office',
      RETAIL: 'Retail',
      INDUSTRIAL: 'Industrial',
      MULTIFAMILY: 'Multifamily',
      HOSPITALITY: 'Hospitality',
      LAND: 'Land',
      SPECIALTY: 'Specialty'
    }
    return types[type] || type
  }

  const getStatusBadge = (status: string, verified: boolean) => {
    if (!verified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4" />
          Pending Verification
        </span>
      )
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        )
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-4 h-4" />
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4" />
            {status}
          </span>
        )
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view property details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  {getPropertyTypeIcon(property.propertyType)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
                    {getStatusBadge(property.status, property.verified)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{property.city}, {property.state} {property.zipCode}</span>
                    <span className="text-gray-400">|</span>
                    <span>{getPropertyTypeName(property.propertyType)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Property Details
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Property ID</dt>
                    <dd className="font-mono text-sm text-gray-900">{property.propertyId}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Property Type</dt>
                    <dd className="text-gray-900">{getPropertyTypeName(property.propertyType)}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Country</dt>
                    <dd className="text-gray-900">{property.country}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Status</dt>
                    <dd className="text-gray-900">{property.status}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Valuation Information
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Appraised Value</dt>
                    <dd className="text-xl font-bold text-gray-900">{formatCurrency(property.appraisedValue)}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Valuation Date</dt>
                    <dd className="text-gray-900">{formatDate(property.valuationDate)}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Valuation Method</dt>
                    <dd className="text-gray-900">{property.valuationMethod}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">Valuation Provider</dt>
                    <dd className="text-gray-900">{property.valuationProvider}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/loans/apply?propertyId=${property.propertyId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply for Loan
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <FileText className="w-5 h-5" />
                View Documents
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Registered on {formatDate(property.createdAt)}</h4>
              <p className="text-sm text-blue-700 mt-1">
                This property has been registered on the CRE-Debt-Solana platform.
                {property.verified
                  ? ' It has been verified and is eligible for loan applications.'
                  : ' It is pending verification by our team.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailPage
