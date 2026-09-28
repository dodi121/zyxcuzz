import React from 'react';
import {
  Search,
  X,
  Filter,
  RotateCcw,
  Calendar,
  Building2,
} from 'lucide-react';
import { FilterState } from '../types/recap';

interface RecapFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  categories: string[];
  channels: string[];
  totalResults: number;
  totalAvailable: number;
}

export const RecapFilters: React.FC<RecapFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  channels,
  totalResults,
  totalAvailable,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.period !== 'all' ||
    filters.category !== '' ||
    filters.status !== '' ||
    filters.type !== 'all' ||
    filters.channel !== '' ||
    filters.customStartDate !== '' ||
    filters.customEndDate !== '';

  const handleReset = () => {
    onFilterChange({
      search: '',
      period: 'all',
      customStartDate: '',
      customEndDate: '',
      category: '',
      status: '',
      type: 'all',
      channel: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Top row: Search bar & Quick Period Segments */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Cari transaksi, invoice, pelanggan, produk..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Period Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs self-start lg:self-auto scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari' },
            { id: '30days', label: '30 Hari' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'custom', label: 'Kustom' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() =>
                onFilterChange({
                  ...filters,
                  period: period.id as FilterState['period'],
                })
              }
              className={`px-3 py-1.5 font-medium rounded-lg transition-all whitespace-nowrap ${
                filters.period === period.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers (if period === 'custom') */}
      {filters.period === 'custom' && (
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-950">Rentang Tanggal Kustom:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Dari:</span>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => onFilterChange({ ...filters, customStartDate: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Sampai:</span>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => onFilterChange({ ...filters, customEndDate: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Second row: Dropdown filters & Active Filter Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Tipe Transaksi */}
          <select
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ ...filters, type: e.target.value as FilterState['type'] })
            }
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Semua Tipe Arus</option>
            <option value="income">Pemasukan (Masuk)</option>
            <option value="expense">Pengeluaran (Beban)</option>
          </select>

          {/* Kategori */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer max-w-[160px] truncate"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="processing">Diproses</option>
            <option value="pending">Menunggu</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Saluran / Departemen */}
          {channels.length > 0 && (
            <select
              value={filters.channel}
              onChange={(e) => onFilterChange({ ...filters, channel: e.target.value })}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer max-w-[160px] truncate"
            >
              <option value="">Semua Saluran</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          )}

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Counter Results */}
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-900">{totalResults}</span> dari {totalAvailable} data rekapan
        </div>
      </div>
    </div>
  );
};
