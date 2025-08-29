'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProperties: number
  totalLoans: number
  activeLoans: number
  totalLoanValue: number
  nextPaymentDue: string | null
  nextPaymentAmount: number
}

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

interface LoanApplication {
  id: string
  applicationId: string
  status: string
  requestedAmount: number
  createdAt: string
  property: {
    address: string
    city: string
    state: string
  }
}

const DashboardPage: FC = () => {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'loans' | 'payments'>('overview')

  useEffect(() => {
    if (connected && publicKey) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const walletAddress = publicKey?.toBase58()

      if (!walletAddress) return

      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/dashboard/stats?walletAddress=${walletAddress}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }

      // Fetch properties
      const propertiesResponse = await fetch(`/api/properties?walletAddress=${walletAddress}`)
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        if (propertiesData.success) {
          setProperties(propertiesData.data)
        }
      }

      // Fetch loan applications
      const loansResponse = await fetch(`/api/loans?walletAddress=${walletAddress}`)
      if (loansResponse.ok) {
        const loansData = await loansResponse.json()
        if (loansData.success) {
          setLoanApplications(loansData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100'
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'draft':
        return <FileText className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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
            Please connect your Solana wallet to access your dashboard.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your properties, loans, and payments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeLoans || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Loan Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalLoanValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Payment</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.nextPaymentDue ? formatCurrency(stats.nextPaymentAmount) : 'None'}
                </p>
                {stats?.nextPaymentDue && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(stats.nextPaymentDue).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'properties', label: 'Properties', icon: Building2 },
                { id: 'loans', label: 'Loans', icon: FileText },
                { id: 'payments', label: 'Payments', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/properties/register"
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Plus className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-blue-900 font-medium">Register New Property</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </Link>

                  <Link
                    href="/loans/apply"
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-green-900 font-medium">Apply for Loan</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-green-600" />
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {loanApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Loan Application #{application.applicationId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {application.property.address}, {application.property.city}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                  {loanApplications.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Your Properties</h3>
                  <Link
                    href="/properties/register"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Property
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h4>
                    <p className="text-gray-600 mb-6">
                      Register your first property to unlock loan opportunities
                    </p>
                    <Link
                      href="/properties/register"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Register Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                              <h4 className="text-lg font-medium text-gray-900">
                                {property.address}
                              </h4>
                            </div>
                            <p className="text-gray-600 mb-2">
                              {property.city}, {property.state}
                            </p>
                            <p className="text-sm text-gray-500">
                              Value: {formatCurrency(property.appraisedValue)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(property.status)}`}>
                              {getStatusIcon(property.status)}
                              <span className="ml-2 capitalize">{property.status.toLowerCase()}</span>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Applications</h3>
                  <Link
                    href="/loans/apply"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Apply for Loan
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loanApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Loan Applications</h4>
                    <p className="text-gray-600 mb-6">
                      Apply for your first loan using your registered properties
                    </p>
                    <Link
                      href="/loans/apply"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Apply for Loan
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loanApplications.map((application) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <FileText className="h-5 w-5 text-gray-400 mr-2" />
                              <h4 className="text-lg font-medium text-gray-900">
                                Application #{application.applicationId}
                              </h4>
                            </div>
                            <p className="text-gray-600 mb-2">
                              {application.property.address}, {application.property.city}
                            </p>
                            <p className="text-sm text-gray-500">
                              Amount: {formatCurrency(application.requestedAmount)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-2 capitalize">{application.status.replace('_', ' ')}</span>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Payment System Coming Soon</h4>
                  <p className="text-gray-600">
                    USDC payment integration will be available in Phase 4
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
