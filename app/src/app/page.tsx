'use client'

import { FC } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Building2,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Clock,
  Users
} from 'lucide-react'

const HomePage: FC = () => {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock <span className="text-blue-600">90%</span> of Your
              <br />
              Property Equity
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Access higher LTV ratios than traditional lenders through our decentralized
              commercial real estate lending platform on Solana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {connected ? (
                <>
                  <Link
                    href="/properties"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                  >
                    Browse Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-yellow-800 text-sm">
                    Connect your Solana wallet to access the platform
                  </p>
                </div>
              )}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">90%</h3>
                <p className="text-gray-600">Maximum LTV Ratio</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">24hrs</h3>
                <p className="text-gray-600">Loan Processing</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">$100K+</h3>
                <p className="text-gray-600">Minimum Loan Amount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CRE-Debt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of commercial real estate financing with blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Higher LTV Ratios
              </h3>
              <p className="text-gray-600">
                Access up to 90% of your property value compared to traditional lenders'
                65-75% limits through our advanced risk assessment models.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-6">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lightning Fast Processing
              </h3>
              <p className="text-gray-600">
                Get approved and funded in under 24 hours with our automated
                blockchain-based loan origination process.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enhanced Security
              </h3>
              <p className="text-gray-600">
                Your property collateral is secured by smart contracts on Solana,
                providing immutable security and transparency.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-6">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                USDC Disbursements
              </h3>
              <p className="text-gray-600">
                Receive loan funds in stablecoin (USDC) for immediate utility
                and protection against market volatility.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-6">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Flexible Terms
              </h3>
              <p className="text-gray-600">
                Choose from various loan terms (1-30 years) and repayment
                schedules that fit your business needs.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-6">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Institutional Access
              </h3>
              <p className="text-gray-600">
                Connect with institutional lenders and access wholesale
                capital markets for larger financing needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to access your property equity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Register Property
              </h3>
              <p className="text-gray-600">
                Submit your commercial property details and valuation
                for verification by our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Apply for Loan
              </h3>
              <p className="text-gray-600">
                Choose your desired loan amount and terms.
                Our AI assesses your risk profile instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get Approved
              </h3>
              <p className="text-gray-600">
                Receive instant approval decision based on property
                value and your credit profile.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 mx-auto">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Receive Funds
              </h3>
              <p className="text-gray-600">
                Get USDC funds transferred directly to your wallet
                within 24 hours of approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Unlock Your Property's Potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of property owners who have already accessed their equity
            through our decentralized lending platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {connected ? (
              <Link
                href="/properties"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Please connect your Solana wallet to get started
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Bank-Level Security</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
