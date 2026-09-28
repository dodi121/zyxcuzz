import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  Building,
  CreditCard,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import { RecapEntry } from '../types/recap';
import { formatRupiah, formatDateIndo, getStatusBadge } from '../utils/formatters';

interface DetailModalProps {
  entry: RecapEntry | null;
  onClose: () => void;
  onEdit: (entry: RecapEntry) => void;
  onDelete: (id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  entry,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!entry) return null;

  const statusMeta = getStatusBadge(entry.status);
  const isIncome = entry.type === 'income';
  const margin =
    entry.cost && entry.amount > 0
      ? Math.round(((entry.amount - entry.cost) / entry.amount) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              {entry.code}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title & Amount Banner */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">{entry.title}</h3>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {isIncome ? 'Total Nilai Masuk' : 'Total Nilai Beban'}
                </span>
                <div
                  className={`text-2xl font-bold font-mono mt-0.5 flex items-center gap-1.5 ${
                    isIncome ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{formatRupiah(entry.amount)}</span>
                </div>
              </div>

              {entry.cost !== undefined && entry.cost > 0 && (
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Modal / HPP
                  </span>
                  <div className="text-sm font-mono text-slate-600 font-semibold">
                    {formatRupiah(entry.cost)}
                  </div>
                  {margin !== null && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      Margin {margin}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Tanggal Transaksi</div>
                <div className="text-slate-800 font-semibold mt-0.5">
                  {formatDateIndo(entry.date, true)}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Waktu Transaksi</div>
                <div className="text-slate-800 font-semibold mt-0.5">
                  {entry.time ? `${entry.time} WIB` : 'Tidak dicatat'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Kategori</div>
                <div className="text-slate-800 font-semibold mt-0.5">{entry.category}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Saluran / Divisi</div>
                <div className="text-slate-800 font-semibold mt-0.5">
                  {entry.departmentOrChannel || '-'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Metode Pembayaran</div>
                <div className="text-slate-800 font-semibold mt-0.5">
                  {entry.paymentMethod || 'Tunai'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
              <User className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400 font-medium">Pihak / Pelanggan</div>
                <div className="text-slate-800 font-semibold mt-0.5 truncate max-w-[130px]">
                  {entry.customerOrVendor || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Catatan & Keterangan:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{entry.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Yakin ingin menghapus data ini?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
