'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Building2, Home, CreditCard, BarChart3, Menu, X } from 'lucide-react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Loans', href: '/loans', icon: CreditCard },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                CRE-Debt
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100"
              >
                <item.icon className="h-4 w-4 inline mr-1.5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors" />
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2.5 text-base font-medium rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 inline mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2">
            <WalletMultiButton className="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white !rounded-lg !py-2.5 !text-sm !font-medium !transition-colors" />
          </div>
        </div>
      )}
    </header>
  );
};
