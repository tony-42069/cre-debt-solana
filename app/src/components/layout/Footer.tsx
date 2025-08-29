'use client'

import { FC } from 'react'
import { Building2, Github, Twitter, Mail } from 'lucide-react'

export const Footer: FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CRE-Debt</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Decentralized Commercial Real Estate Lending Platform on Solana.
              Access up to 90% of your property equity through blockchain-based secured debt instruments.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/tony-42069/cre-debt-solana"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@cre-debt.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Browse Properties
                </a>
              </li>
              <li>
                <a href="/loans" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Apply for Loan
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Borrower Dashboard
                </a>
              </li>
              <li>
                <a href="/lender" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Institutional Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-600 hover:text-blue-600 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 CRE-Debt. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/compliance" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
