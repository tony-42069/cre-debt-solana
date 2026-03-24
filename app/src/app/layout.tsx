import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'ABARE | Commercial Real Estate Lending on Solana',
  description: 'Unlock commercial real estate equity through USDC loans in days, not months. The first Solana-native CRE lending platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} antialiased`}>
        <WalletProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
