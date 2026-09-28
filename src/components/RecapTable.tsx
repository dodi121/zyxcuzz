import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { RecapEntry } from '../types/recap';
import { formatRupiah, formatDateIndo, getStatusBadge, exportToCSV } from '../utils/formatters';

interface RecapTableProps {
  entries: RecapEntry[];
  onViewDetail: (entry: RecapEntry) => void;
  onEdit: (entry: RecapEntry) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: RecapEntry['status']) => void;
}

type SortField = 'date' | 'code' | 'title' | 'category' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

export const RecapTable: React.FC<RecapTableProps> = ({
  entries,
  onViewDetail,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkUpdateStatus,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [entries, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedEntries.length / pageSize) || 1;
  const paginatedEntries = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEntries.slice(start, start + pageSize);
  }, [sortedEntries, currentPage, pageSize]);

  // Selection logic
  const allPageIds = paginatedEntries.map((e) => e.id);
  const isAllPageSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !allPageIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...allPageIds]));
      setSelectedIds(merged);
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Bulk Action Bar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold">
              {selectedIds.length}
            </span>
            <span>Data terpilih untuk tindakan massal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBulkUpdateStatus(selectedIds, 'completed');
                setSelectedIds([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Tandai Selesai</span>
            </button>
            <button
              onClick={() => {
                const selectedItems = entries.filter((e) => selectedIds.includes(e.id));
                exportToCSV(selectedItems, `Rekap-Terpilih-${Date.now()}.csv`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Terpilih</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} data rekapan ini?`)) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-indigo-200 hover:text-white underline ml-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs tracking-wider">
              <th className="py-3.5 pl-4 pr-2 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th
                onClick={() => handleSort('code')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>KODE</span>
                  {renderSortIcon('code')}
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>TANGGAL</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>DESKRIPSI / ITEM</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>KATEGORI</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">SALURAN / ENTITAS</th>
              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>STATUS</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3.5 px-3 cursor-pointer group hover:text-slate-900 select-none text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>NOMINAL (RP)</span>
                  {renderSortIcon('amount')}
                </div>
              </th>
              <th className="py-3.5 pl-3 pr-4 text-center whitespace-nowrap">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedEntries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
                    <p className="font-semibold text-slate-700">Tidak ada data rekapan yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Coba ganti kata kunci pencarian, sesuaikan filter tanggal, atau tambahkan entri baru.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEntries.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);
                const statusMeta = getStatusBadge(entry.status);
                const isIncome = entry.type === 'income';

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(entry.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                    </td>

                    {/* Code */}
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {entry.code}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600">
                      <div>{formatDateIndo(entry.date)}</div>
                      {entry.time && <div className="text-[11px] text-slate-400">{entry.time} WIB</div>}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 line-clamp-1">{entry.title}</div>
                      {entry.customerOrVendor && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          👤 {entry.customerOrVendor}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-600">
                        {entry.category}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{entry.departmentOrChannel}</div>
                      <div className="text-[11px] text-slate-400">{entry.paymentMethod}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold text-sm">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          isIncome ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{isIncome ? '+' : '-'} {formatRupiah(entry.amount)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewDetail(entry)}
                          title="Lihat Detail Transaksi"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(entry)}
                          title="Ubah Data"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus transaksi "${entry.title}"?`)) {
                              onDelete(entry.id);
                            }
                          }}
                          title="Hapus Data"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Baris per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">·</span>
          <span>
            Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 3 + i;
              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-medium text-xs transition-colors ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
