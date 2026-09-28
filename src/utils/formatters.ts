import { RecapEntry, RecapMetrics, TransactionType, EntryStatus } from '../types/recap';

export const formatRupiah = (amount: number, compact = false): string => {
  if (isNaN(amount)) return 'Rp 0';
  if (compact && Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateIndo = (dateStr: string, withDay = false): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const options: Intl.DateTimeFormatOptions = withDay
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' };

  try {
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateStr;
  }
};

export const getStatusBadge = (status: EntryStatus) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Selesai',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'processing':
      return {
        label: 'Diproses',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500 animate-pulse',
      };
    case 'pending':
      return {
        label: 'Menunggu',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'cancelled':
      return {
        label: 'Dibatalkan',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};

export const calculateMetrics = (entries: RecapEntry[]): RecapMetrics => {
  const activeEntries = entries.filter((e) => e.status !== 'cancelled');

  let totalIncome = 0;
  let totalExpense = 0;

  activeEntries.forEach((e) => {
    if (e.type === 'income') {
      totalIncome += e.amount;
    } else {
      totalExpense += e.amount;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netBalance) / totalIncome) * 100 : 0;
  const completedEntries = entries.filter((e) => e.status === 'completed');
  const completedRate = entries.length > 0 ? (completedEntries.length / entries.length) * 100 : 0;
  const pendingCount = entries.filter((e) => e.status === 'pending' || e.status === 'processing').length;
  const avgTransactionValue = activeEntries.length > 0 ? (totalIncome + totalExpense) / activeEntries.length : 0;

  return {
    totalTransactions: entries.length,
    totalIncome,
    totalExpense,
    netBalance,
    profitMargin: Math.round(profitMargin * 10) / 10,
    avgTransactionValue: Math.round(avgTransactionValue),
    completedRate: Math.round(completedRate * 10) / 10,
    pendingCount,
  };
};

export const exportToCSV = (entries: RecapEntry[], filename = 'Rekapan-Data.csv') => {
  const headers = [
    'No',
    'Kode Transaksi',
    'Tanggal',
    'Waktu',
    'Judul / Deskripsi',
    'Kategori',
    'Tipe (Pemasukan/Pengeluaran)',
    'Nominal (Rp)',
    'Biaya Modal (Rp)',
    'Status',
    'Saluran / Departemen',
    'Pelanggan / Vendor',
    'Metode Pembayaran',
    'Catatan',
  ];

  const rows = entries.map((entry, idx) => [
    idx + 1,
    `"${entry.code || ''}"`,
    `"${entry.date}"`,
    `"${entry.time || ''}"`,
    `"${(entry.title || '').replace(/"/g, '""')}"`,
    `"${entry.category}"`,
    `"${entry.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
    entry.amount,
    entry.cost || 0,
    `"${entry.status}"`,
    `"${(entry.departmentOrChannel || '').replace(/"/g, '""')}"`,
    `"${(entry.customerOrVendor || '').replace(/"/g, '""')}"`,
    `"${(entry.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(entry.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateWhatsAppRecapText = (metrics: RecapMetrics, title: string, count: number): string => {
  const dateNow = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `📊 *RINGKASAN REKAPAN DATA: ${title.toUpperCase()}*
📅 Tanggal: ${dateNow}
📋 Total Baris Data: ${count} entri

💰 *RINGKASAN KEUANGAN:*
• Total Pemasukan: ${formatRupiah(metrics.totalIncome)}
• Total Pengeluaran: ${formatRupiah(metrics.totalExpense)}
• Saldo Bersih / Laba: ${formatRupiah(metrics.netBalance)} (${metrics.profitMargin >= 0 ? '+' : ''}${metrics.profitMargin}%)
• Rata-rata per Transaksi: ${formatRupiah(metrics.avgTransactionValue)}

📈 *STATUS REALISASI:*
• Tingkat Sukses: ${metrics.completedRate}%
• Menunggu / Diproses: ${metrics.pendingCount} transaksi

_Dibuat otomatis melalui Web Dashboard Rekapan Data Interaktif._`;
};
