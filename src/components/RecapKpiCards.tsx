import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { RecapMetrics } from '../types/recap';
import { formatRupiah } from '../utils/formatters';

interface RecapKpiCardsProps {
  metrics: RecapMetrics;
  onFilterByType?: (type: 'all' | 'income' | 'expense') => void;
  activeTypeFilter?: 'all' | 'income' | 'expense';
}

export const RecapKpiCards: React.FC<RecapKpiCardsProps> = ({
  metrics,
  onFilterByType,
  activeTypeFilter = 'all',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan */}
      <div
        onClick={() => onFilterByType && onFilterByType(activeTypeFilter === 'income' ? 'all' : 'income')}
        className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
          activeTypeFilter === 'income'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
            : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatRupiah(metrics.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Arus Kas Masuk (Kredit)</span>
            {activeTypeFilter === 'income' && (
              <span className="ml-auto text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                Aktif
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
      </div>

      {/* 2. Total Pengeluaran */}
      <div
        onClick={() => onFilterByType && onFilterByType(activeTypeFilter === 'expense' ? 'all' : 'expense')}
        className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
          activeTypeFilter === 'expense'
            ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
            : 'border-slate-200/80 hover:border-rose-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatRupiah(metrics.totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-700 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Beban & Operasional (Debit)</span>
            {activeTypeFilter === 'expense' && (
              <span className="ml-auto text-[11px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                Aktif
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 opacity-80" />
      </div>

      {/* 3. Saldo Bersih / Laba Bersih */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo / Laba Bersih
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div
            className={`text-2xl font-bold tracking-tight ${
              metrics.netBalance >= 0 ? 'text-indigo-950' : 'text-rose-600'
            }`}
          >
            {formatRupiah(metrics.netBalance)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                metrics.profitMargin >= 0
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Margin {metrics.profitMargin >= 0 ? '+' : ''}
              {metrics.profitMargin}%
            </span>
            <span>Rasio Laba</span>
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
            metrics.netBalance >= 0
              ? 'from-indigo-600 to-cyan-500'
              : 'from-rose-600 to-red-400'
          }`}
        />
      </div>

      {/* 4. Rata-rata & Realisasi Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rata-rata & Sukses
          </span>
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatRupiah(metrics.avgTransactionValue, true)}
          </div>
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {metrics.completedRate}% Selesai
              </span>
              {metrics.pendingCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  {metrics.pendingCount} Pending
                </span>
              )}
            </div>
            {/* Visual mini progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, metrics.completedRate))}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      metrics.totalTransactions > 0
                        ? (metrics.pendingCount / metrics.totalTransactions) * 100
                        : 0
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-400 opacity-80" />
      </div>
    </div>
  );
};
