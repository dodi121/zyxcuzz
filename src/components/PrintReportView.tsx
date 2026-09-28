import React from 'react';
import { X, Printer } from 'lucide-react';
import { RecapEntry, RecapMetrics } from '../types/recap';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface PrintReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RecapEntry[];
  metrics: RecapMetrics;
  templateName: string;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  isOpen,
  onClose,
  entries,
  metrics,
  templateName,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Screen Controls Header (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between no-print">
          <div>
            <h3 className="font-bold text-sm">Pratinjau Cetak Laporan Resmi</h3>
            <p className="text-xs text-slate-300">Siap dicetak ke kertas A4 atau disimpan sebagai PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white">
          {/* Document Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-indigo-700">
                LAPORAN REKAPITULASI RESMI
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                {templateName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen Audit & Rekapitulasi Data Keuangan / Operasional
              </p>
            </div>
            <div className="text-right text-xs space-y-1">
              <div>
                <span className="text-slate-400">Dicetak:</span>{' '}
                <span className="font-semibold text-slate-800">{currentDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Baris Data:</span>{' '}
                <span className="font-mono font-bold text-slate-900">{entries.length} Entri</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics Box */}
          <div className="grid grid-cols-4 gap-3 border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Pemasukan</div>
              <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                {formatRupiah(metrics.totalIncome)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Pengeluaran</div>
              <div className="text-base font-bold font-mono text-rose-700 mt-0.5">
                {formatRupiah(metrics.totalExpense)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Saldo / Laba Bersih</div>
              <div
                className={`text-base font-bold font-mono mt-0.5 ${
                  metrics.netBalance >= 0 ? 'text-indigo-900' : 'text-rose-700'
                }`}
              >
                {formatRupiah(metrics.netBalance)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Rasio Margin / Sukses</div>
              <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                {metrics.profitMargin}% / {metrics.completedRate}%
              </div>
            </div>
          </div>

          {/* Table of Entries */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Kode</th>
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Deskripsi / Item</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Pihak / Saluran</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2 font-mono font-semibold text-slate-700">{item.code}</td>
                    <td className="p-2 whitespace-nowrap text-slate-600">{item.date}</td>
                    <td className="p-2 font-medium text-slate-900">{item.title}</td>
                    <td className="p-2 text-slate-600">{item.category}</td>
                    <td className="p-2 text-slate-600">{item.customerOrVendor || item.departmentOrChannel}</td>
                    <td className="p-2 capitalize">{item.status === 'completed' ? 'Selesai' : item.status}</td>
                    <td
                      className={`p-2 text-right font-mono font-bold ${
                        item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature & Verification Block */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="text-slate-400 mb-16">Disiapkan Oleh:</div>
              <div className="font-bold border-t border-slate-400 pt-1 text-slate-800">
                Bagian Administrasi / Kasir
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-16">Diperiksa Oleh:</div>
              <div className="font-bold border-t border-slate-400 pt-1 text-slate-800">
                Supervisor Keuangan
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-16">Disetujui Oleh:</div>
              <div className="font-bold border-t border-slate-400 pt-1 text-slate-800">
                Pimpinan / Direktur
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
