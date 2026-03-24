'use client'

import { FC } from 'react'
import Image from 'next/image'
import { Github, Twitter, Mail } from 'lucide-react'

export const Footer: FC = () => {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/ABARE-logo-new.png"
                alt="ABARE"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-gradient">ABARE</span>
            </div>
            <p className="text-text-secondary text-sm mb-5 max-w-sm leading-relaxed">
              Unlock commercial real estate equity through USDC loans in days, not months.
              The first Solana-native CRE lending platform.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://github.com/tony-42069/cre-debt-solana', icon: Github, label: 'GitHub' },
                { href: '#', icon: Twitter, label: 'Twitter' },
                { href: 'mailto:contact@abare.io', icon: Mail, label: 'Email' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:border-white/20 transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Properties', href: '/properties' },
                { label: 'Apply for Loan', href: '/loans' },
                { label: 'Borrower Dashboard', href: '/dashboard' },
                { label: 'Institutional Portal', href: '/lender' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Documentation', href: '/docs' },
                { label: 'API Reference', href: '/api' },
                { label: 'Security', href: '/security' },
                { label: 'Support', href: '/support' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-xs">
              &copy; {new Date().getFullYear()} ABARE. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Compliance', href: '/compliance' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted hover:text-text-secondary text-xs transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
