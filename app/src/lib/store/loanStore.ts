import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  propertyId: string;
  propertyName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  fundedAmount: number;
  fundingDeadline: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanFilters {
  status: string;
  minAmount: number;
  maxAmount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface LoanState {
  loans: Loan[];
  selectedLoan: Loan | null;
  filters: LoanFilters;
  isLoading: boolean;
  error: string | null;

  setLoans: (loans: Loan[]) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  setSelectedLoan: (loan: Loan | null) => void;
  setFilters: (filters: Partial<LoanFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultFilters: LoanFilters = {
  status: 'all',
  minAmount: 0,
  maxAmount: 10000000,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useLoanStore = create<LoanState>()(
  persist(
    (set) => ({
      loans: [],
      selectedLoan: null,
      filters: defaultFilters,
      isLoading: false,
      error: null,

      setLoans: (loans) => set({ loans }),

      addLoan: (loan) =>
        set((state) => ({ loans: [loan, ...state.loans] })),

      updateLoan: (id, updates) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id ? { ...loan, ...updates } : loan
          ),
          selectedLoan:
            state.selectedLoan?.id === id
              ? { ...state.selectedLoan, ...updates }
              : state.selectedLoan,
        })),

      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
          selectedLoan:
            state.selectedLoan?.id === id ? null : state.selectedLoan,
        })),

      setSelectedLoan: (loan) => set({ selectedLoan: loan }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () => set({ filters: defaultFilters }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'loan-storage',
      partialize: (state) => ({
        filters: state.filters,
        selectedLoan: state.selectedLoan,
      }),
    }
  )
);

export const useFilteredLoans = () => {
  const { loans, filters } = useLoanStore();

  return loans.filter((loan) => {
    const matchesStatus =
      filters.status === 'all' || loan.status === filters.status;
    const matchesAmount =
      loan.principalAmount >= filters.minAmount &&
      loan.principalAmount <= filters.maxAmount;

    return matchesStatus && matchesAmount;
  });
};
