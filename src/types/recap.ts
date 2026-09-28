export type TransactionType = 'income' | 'expense';

export type EntryStatus = 'completed' | 'processing' | 'pending' | 'cancelled';

export interface RecapEntry {
  id: string;
  code: string; // e.g. TR-2026-081
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  cost?: number; // for profit calculation if retail
  status: EntryStatus;
  departmentOrChannel: string; // e.g. Toko Pusat, Shopee, Tokopedia, Kantor, WhatsApp
  customerOrVendor: string;
  paymentMethod: string; // Transfer BCA, QRIS, Tunai, Mandiri, dsb.
  notes?: string;
}

export type TemplateType = 'retail_sales' | 'cashflow' | 'operational';

export interface FilterState {
  search: string;
  period: 'all' | 'today' | '7days' | '30days' | 'month' | 'year' | 'custom';
  customStartDate: string;
  customEndDate: string;
  category: string;
  status: string;
  type: 'all' | 'income' | 'expense';
  channel: string;
}

export interface RecapMetrics {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  profitMargin: number;
  avgTransactionValue: number;
  completedRate: number;
  pendingCount: number;
}
