'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Home, Building2, CreditCard, BarChart3, Menu, X } from 'lucide-react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Loans', href: '/loans', icon: CreditCard },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0B0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/ABARE-logo-new.png"
              alt="ABARE"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-xl font-bold text-gradient hidden sm:block">
              ABARE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <WalletMultiButton className="!bg-accent-primary hover:!bg-accent-primary-hover !text-white !rounded-xl !px-5 !py-2 !text-sm !font-medium !transition-all !border-0" />
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0A0B0F]/95 backdrop-blur-xl">
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-text-secondary hover:text-white hover:bg-white/5 px-3 py-2.5 text-base font-medium rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <WalletMultiButton className="!w-full !bg-accent-primary hover:!bg-accent-primary-hover !text-white !rounded-xl !py-2.5 !text-sm !font-medium !transition-all !border-0" />
          </div>
        </div>
      )}
    </header>
  );
};
