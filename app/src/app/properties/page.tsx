'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  Building,
  Briefcase,
  TreePine
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
  appraisedValue: number
  status: string
  verified: boolean
  createdAt: string
}

const PropertiesPage: FC = () => {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

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
      const walletAddress = publicKey?.toBase58()
      if (!walletAddress) return

      const response = await apiService.getProperties(walletAddress)
      if (response.success && response.data) {
        setProperties(response.data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'OFFICE':
        return <Building className="w-5 h-5" />
      case 'RETAIL':
        return <Home className="w-5 h-5" />
      case 'INDUSTRIAL':
        return <Briefcase className="w-5 h-5" />
      case 'MULTIFAMILY':
        return <Building2 className="w-5 h-5" />
      case 'HOSPITALITY':
        return <TreePine className="w-5 h-5" />
      default:
        return <Building className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string, verified: boolean) => {
    if (!verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      )
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.state.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || property.propertyType === filterType
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to view your properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your registered properties</p>
          </div>
          <Link
            href="/properties/register"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Register Property
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by address, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="OFFICE">Office</option>
                  <option value="RETAIL">Retail</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="MULTIFAMILY">Multifamily</option>
                  <option value="HOSPITALITY">Hospitality</option>
                  <option value="LAND">Land</option>
                  <option value="SPECIALTY">Specialty</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {properties.length === 0
                  ? "You haven't registered any properties yet."
                  : 'No properties match your search criteria.'}
              </p>
              {properties.length === 0 && (
                <Link
                  href="/properties/register"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Register Your First Property
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {getPropertyTypeIcon(property.propertyType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {property.address}
                          </h3>
                          {getStatusBadge(property.status, property.verified)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {property.city}, {property.state} {property.zipCode}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(property.appraisedValue)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Property ID: {property.propertyId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${property.propertyId}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More Options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-600">Total Properties</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-600">Verified</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {properties.filter(p => p.verified).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-600">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(properties.reduce((sum, p) => sum + p.appraisedValue, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPage
