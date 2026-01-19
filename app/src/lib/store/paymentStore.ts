import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  paymentType: 'principal' | 'interest' | 'full';
  status: 'pending' | 'completed' | 'failed';
  dueDate: string;
  paidDate?: string;
  transactionSignature?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentFilters {
  status: string;
  paymentType: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  filters: PaymentFilters;
  isLoading: boolean;
  error: string | null;

  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultFilters: PaymentFilters = {
  status: 'all',
  paymentType: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      payments: [],
      selectedPayment: null,
      filters: defaultFilters,
      isLoading: false,
      error: null,

      setPayments: (payments) => set({ payments }),

      addPayment: (payment) =>
        set((state) => ({ payments: [payment, ...state.payments] })),

      updatePayment: (id, updates) =>
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...updates } : payment
          ),
          selectedPayment:
            state.selectedPayment?.id === id
              ? { ...state.selectedPayment, ...updates }
              : state.selectedPayment,
        })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
          selectedPayment:
            state.selectedPayment?.id === id
              ? null
              : state.selectedPayment,
        })),

      setSelectedPayment: (payment) => set({ selectedPayment: payment }),

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
      name: 'payment-storage',
      partialize: (state) => ({
        filters: state.filters,
        selectedPayment: state.selectedPayment,
      }),
    }
  )
);

export const useFilteredPayments = () => {
  const { payments, filters } = usePaymentStore();

  return payments.filter((payment) => {
    const matchesStatus =
      filters.status === 'all' || payment.status === filters.status;
    const matchesType =
      filters.paymentType === 'all' ||
      payment.paymentType === filters.paymentType;
    const matchesDateFrom =
      !filters.dateFrom || new Date(payment.createdAt) >= new Date(filters.dateFrom);
    const matchesDateTo =
      !filters.dateTo || new Date(payment.createdAt) <= new Date(filters.dateTo);

    return matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
  });
};
