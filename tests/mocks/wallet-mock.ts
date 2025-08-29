import { Page } from '@playwright/test'

export class WalletMock {
  private page: Page
  private connectedWallet: string | null = null

  constructor() {}

  async setup(page: Page) {
    this.page = page

    // Mock Solana wallet adapter
    await page.addScriptTag({
      content: `
        window.solana = {
          isPhantom: true,
          isConnected: false,
          publicKey: null,
          connect: async () => {
            window.solana.isConnected = true
            window.solana.publicKey = {
              toBase58: () => window.mockWalletAddress || '11111111111111111111111111111112'
            }
            return { publicKey: window.solana.publicKey }
          },
          disconnect: async () => {
            window.solana.isConnected = false
            window.solana.publicKey = null
          },
          signMessage: async (message) => {
            return { signature: new Uint8Array(64) }
          }
        }
      `
    })

    // Mock wallet adapter React hooks
    await page.addScriptTag({
      content: `
        window.useWallet = () => ({
          connected: window.solana?.isConnected || false,
          publicKey: window.solana?.publicKey || null,
          connect: window.solana?.connect,
          disconnect: window.solana?.disconnect,
          signMessage: window.solana?.signMessage
        })
      `
    })
  }

  async connectWallet(walletAddress: string) {
    // Set mock wallet address
    await this.page.evaluate((address) => {
      window.mockWalletAddress = address
    }, walletAddress)

    // Trigger wallet connection
    await this.page.evaluate(() => {
      if (window.solana) {
        window.solana.connect()
      }
    })

    this.connectedWallet = walletAddress

    // Wait for connection to propagate
    await this.page.waitForTimeout(100)
  }

  async disconnectWallet() {
    await this.page.evaluate(() => {
      if (window.solana) {
        window.solana.disconnect()
      }
    })

    this.connectedWallet = null
    await this.page.waitForTimeout(100)
  }

  async signMessage(message: string) {
    return await this.page.evaluate((msg) => {
      if (window.solana && window.solana.signMessage) {
        return window.solana.signMessage(new TextEncoder().encode(msg))
      }
      return { signature: new Uint8Array(64) }
    }, message)
  }

  getConnectedWallet() {
    return this.connectedWallet
  }

  async cleanup() {
    await this.disconnectWallet()
    this.connectedWallet = null
  }
}
