import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '@/lib/api'

interface User {
  id: string
  walletAddress: string
  email?: string | null
  entityType: string
  kycStatus: string
  riskScore?: number | null
  totalBorrowed: number
  activeLoans: number
}

interface UserState {
  user: User | null
  loading: boolean
  error: string | null
  fetchUser: (walletAddress: string) => Promise<void>
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      fetchUser: async (walletAddress: string) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.getBorrower(walletAddress)
          if (response.success && response.data) {
            set({ user: response.data, loading: false })
          } else {
            set({ error: response.error || 'Failed to fetch user', loading: false })
          }
        } catch (error) {
          set({ error: 'Failed to fetch user', loading: false })
        }
      },

      clearUser: () => {
        set({ user: null, error: null })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)
