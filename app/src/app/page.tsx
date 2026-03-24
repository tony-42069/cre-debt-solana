'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Building2,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Clock,
  FileCheck,
  Brain,
  FileSignature,
  Landmark,
  XCircle,
  CheckCircle2,
  Layers,
  Lock,
} from 'lucide-react'

/* ── Helpers ─────────────────────────────────────── */

const SectionHeading: FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-16">
    <h2 className="font-display text-3xl md:text-4xl text-white mb-4">{title}</h2>
    <p className="text-lg text-text-secondary max-w-2xl mx-auto">{subtitle}</p>
  </div>
)

/* ── Page ─────────────────────────────────────────── */

const HomePage: FC = () => {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen">

      {/* ─── HERO ────────────────────────────────── */}
      <section className="hero-gradient relative py-24 md:py-32 lg:py-40">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6">
            <span className="text-white">Unlock Your Commercial</span>
            <br />
            <span className="text-white">Real Estate Equity</span>
            <br />
            <span className="text-gradient italic">In Days, Not Months</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            ABARE is the first Solana-native platform enabling property owners to access
            up to 90% LTV through USDC stablecoin loans — automated by smart contracts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {connected ? (
              <>
                <Link
                  href="/loans"
                  className="inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white px-8 py-3.5 rounded-xl font-semibold transition-all btn-glow text-base"
                >
                  Apply for a Loan
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-3.5 rounded-xl font-semibold transition-all text-base"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white px-8 py-3.5 rounded-xl font-semibold transition-all btn-glow text-base"
                >
                  Apply for a Loan
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-3.5 rounded-xl font-semibold transition-all text-base"
                >
                  How It Works
                </a>
              </>
            )}
          </div>

          {/* Hero stat bar */}
          <div className="glass-card max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { value: '90%', label: 'Max LTV' },
              { value: '24hr', label: 'Processing' },
              { value: '$500B+', label: 'Market' },
              { value: 'USDC', label: 'Disbursements' },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-5 md:py-6 text-center">
                <p className="text-2xl md:text-3xl font-bold text-white stat-glow">{stat.value}</p>
                <p className="text-xs md:text-sm text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM / SOLUTION ──────────────────── */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="A Better Way to Access Equity"
            subtitle="Traditional CRE lending is slow, opaque, and limited. ABARE changes everything."
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="glass-card p-8 border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">The Old Way</h3>
              </div>
              <ul className="space-y-4">
                {[
                  '60–90 day approval timelines',
                  '65–75% LTV cap from traditional lenders',
                  '$10K+ in appraisal and legal fees',
                  'Hard money loans at 12–18% APR',
                  'Opaque underwriting, endless paperwork',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-secondary">
                    <XCircle className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The ABARE Way */}
            <div className="glass-card p-8 border-accent-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-accent-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">The ABARE Way</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Up to 90% LTV on commercial properties',
                    'Funded in days, not months',
                    'USDC stablecoin disbursement',
                    'Smart contract automation — no middlemen',
                    'Lower costs, transparent terms on-chain',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-secondary">
                      <CheckCircle2 className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How It Works"
            subtitle="Four simple steps from property registration to USDC funding"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Building2,
                title: 'Register Property On-Chain',
                description: 'Submit your commercial property details. Our system tokenizes the collateral on Solana.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI-Assisted Valuation',
                description: 'Advanced algorithms assess property value and risk profile using market data in real time.',
              },
              {
                step: '03',
                icon: FileSignature,
                title: 'Smart Contract Loan Terms',
                description: 'Review and accept transparent loan terms governed by immutable smart contracts.',
              },
              {
                step: '04',
                icon: DollarSign,
                title: 'USDC Funded in Days',
                description: 'Receive USDC stablecoin directly to your wallet. No bank intermediaries, no delays.',
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line (hidden on last item and mobile) */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30" />
                )}

                <div className="glass-card p-6 h-full flex flex-col items-center transition-all hover:border-accent-primary/30">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mb-5 group-hover:from-accent-primary/30 group-hover:to-accent-secondary/30 transition-all">
                    <item.icon className="h-7 w-7 text-accent-primary" />
                  </div>
                  <span className="text-xs font-semibold text-accent-secondary tracking-widest uppercase mb-2">
                    Step {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────── */}
      <section className="py-16 bg-surface border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$500B+', label: 'Total Addressable Market' },
              { value: '$4.2T', label: 'US CRE Market Value' },
              { value: '90%', label: 'Maximum LTV Ratio' },
              { value: '1st', label: 'CRE Lending on Solana' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ───────────────────────── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Built for Institutional Scale"
            subtitle="Enterprise-grade features designed for serious commercial real estate investors"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: 'Higher LTV Ratios',
                description: 'Access up to 90% of your property value — far beyond the 65–75% cap from traditional lenders.',
              },
              {
                icon: Zap,
                title: 'Lightning Speed',
                description: 'From application to funding in days. Solana settles in 400ms — your capital moves at blockchain speed.',
              },
              {
                icon: DollarSign,
                title: 'USDC Stablecoin',
                description: 'Receive and repay in USDC. No FX risk, no bank wire delays, immediate on-chain utility.',
              },
              {
                icon: Shield,
                title: 'Smart Contract Security',
                description: 'All loan terms enforced by audited smart contracts. Immutable, transparent, and verifiable on-chain.',
              },
              {
                icon: Layers,
                title: 'Pure Debt Structure',
                description: 'Structured as debt instruments — not securities. No SEC classification hurdles, no equity dilution.',
              },
              {
                icon: Lock,
                title: 'Institutional Grade',
                description: 'KYC/AML compliance, institutional custody support, and audit-ready reporting for lenders and borrowers.',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-7 group hover:border-accent-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent-primary/15 transition-all">
                  <feature.icon className="h-6 w-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BUILT ON SOLANA ─────────────────────── */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 to-accent-primary/5 pointer-events-none" />
            <div className="relative">
              {/* Solana badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <svg className="h-4 w-4" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <linearGradient id="solana-grad" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 -1 0 314)">
                    <stop offset="0" stopColor="#00FFA3" />
                    <stop offset="1" stopColor="#DC1FFF" />
                  </linearGradient>
                  <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#solana-grad)" />
                  <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#solana-grad)" />
                  <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#solana-grad)" />
                </svg>
                <span className="text-sm font-medium text-text-secondary">Built on Solana</span>
              </div>

              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                Powered by the Fastest Blockchain
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
                Solana processes 65,000+ TPS with sub-second finality and near-zero gas fees.
                Combined with Circle&apos;s USDC, ABARE delivers institutional-grade speed
                and stability that traditional rails simply cannot match.
              </p>

              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                {[
                  { value: '400ms', label: 'Finality' },
                  { value: '<$0.01', label: 'Per Transaction' },
                  { value: '65K+', label: 'TPS Capacity' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl md:text-2xl font-bold text-accent-secondary">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────── */}
      <section className="hero-gradient relative py-24 md:py-32">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6">
            Ready to Unlock
            <br />
            <span className="text-gradient italic">Your Equity?</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
            Join the next generation of commercial real estate financing.
            Access liquidity faster, cheaper, and at higher LTV than any traditional lender.
          </p>

          {connected ? (
            <Link
              href="/loans"
              className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all btn-glow"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-hover text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all btn-glow"
            >
              Connect Wallet to Begin
              <ArrowRight className="h-5 w-5" />
            </a>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-text-secondary text-sm">
            {['No Hidden Fees', 'Institutional Custody', 'Smart Contract Secured'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-secondary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
