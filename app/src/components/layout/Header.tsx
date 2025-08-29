'use client'

import { FC } from 'react'
import Link from 'next/link'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Building2, Home, CreditCard, BarChart3 } from 'lucide-react'

export const Header: FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CRE-Debt</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <Home className="h-4 w-4 inline mr-1" />
              Home
            </Link>
            <Link
              href="/properties"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <Building2 className="h-4 w-4 inline mr-1" />
              Properties
            </Link>
            <Link
              href="/loans"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <CreditCard className="h-4 w-4 inline mr-1" />
              Loans
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Dashboard
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
          >
            <Home className="h-4 w-4 inline mr-2" />
            Home
          </Link>
          <Link
            href="/properties"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Properties
          </Link>
          <Link
            href="/loans"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Loans
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
