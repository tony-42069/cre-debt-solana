import { create } from 'zustand'
import { apiService } from '@/lib/api'

interface Property {
  id: string
  propertyId: string
  propertyType: string
  address: string
  city: string
  state: string
  zipCode: string
  appraisedValue: number
  status: string
  verified: boolean
  createdAt: string
}

interface PropertyFilters {
  search: string
  type: string
  status: string
}

interface PropertyState {
  properties: Property[]
  selectedProperty: Property | null
  filters: PropertyFilters
  loading: boolean
  error: string | null
  fetchProperties: (walletAddress: string) => Promise<void>
  fetchProperty: (propertyId: string) => Promise<void>
  setFilters: (filters: Partial<PropertyFilters>) => void
  clearProperties: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  selectedProperty: null,
  filters: {
    search: '',
    type: 'all',
    status: 'all'
  },
  loading: false,
  error: null,

  fetchProperties: async (walletAddress: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiService.getProperties(walletAddress)
      if (response.success && response.data) {
        set({ properties: response.data, loading: false })
      } else {
        set({ error: response.error || 'Failed to fetch properties', loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch properties', loading: false })
    }
  },

  fetchProperty: async (propertyId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiService.getProperty(propertyId)
      if (response.success && response.data) {
        set({ selectedProperty: response.data, loading: false })
      } else {
        set({ error: response.error || 'Failed to fetch property', loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch property', loading: false })
    }
  },

  setFilters: (filters: Partial<PropertyFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  clearProperties: () => {
    set({ properties: [], selectedProperty: null, error: null })
  }
}))

export const useFilteredProperties = () => {
  const { properties, filters } = usePropertyStore()

  return properties.filter((property) => {
    const matchesSearch =
      filters.search === '' ||
      property.address.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.state.toLowerCase().includes(filters.search.toLowerCase())

    const matchesType = filters.type === 'all' || property.propertyType === filters.type
    const matchesStatus = filters.status === 'all' || property.status === filters.status

    return matchesSearch && matchesType && matchesStatus
  })
}
