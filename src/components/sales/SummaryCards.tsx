import React from 'react';
import { ShiftType } from '../../types/sales';
import { formatRupiah } from '../../utils/salesHelpers';

interface SummaryCardsProps {
  modalAwal: number;
  totalCupKeluar: number;
  cupTerjualMinuman: number;
  cupGratis: number;
  totalMakananKeluar: number;
  totalCash: number;
  totalQR: number;
  totalOmset: number;
  totalPengeluaran: number;
  shift: ShiftType;
  onFocusModalAwal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  modalAwal,
  totalCupKeluar,
  cupTerjualMinuman,
  cupGratis,
  totalMakananKeluar,
  totalCash,
  totalQR,
  totalOmset,
  totalPengeluaran,
  shift,
  onFocusModalAwal,
}) => {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Ringkasan Omset & Penjualan
        </h2>
        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
          <i className="fa-solid fa-clock"></i>
          <span>{shift === 'sore' ? 'SHIFT SORE' : 'SHIFT PAGI'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* CARD 1: MODAL AWAL */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Modal Awal
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <i className="fa-solid fa-vault text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {formatRupiah(modalAwal)}
            </p>
            <button
              type="button"
              onClick={onFocusModalAwal}
              className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-pen-to-square"></i> Ubah Modal
            </button>
          </div>
        </div>

        {/* CARD 2: ITEM KELUAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Item Keluar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <i className="fa-solid fa-utensils text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {totalCupKeluar + totalMakananKeluar} Item
            </p>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 flex-wrap">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {totalCupKeluar} Cup Minuman
              </span>
              {cupGratis > 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  ({cupTerjualMinuman} jual + {cupGratis} non-bayar)
                </span>
              )}
              <span>|</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {totalMakananKeluar} Pcs Makanan
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: CASH */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Omset Cash
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i className="fa-solid fa-money-bill-wave text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatRupiah(totalCash)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Uang Tunai
            </p>
          </div>
        </div>

        {/* CARD 4: QR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Omset QR
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <i className="fa-solid fa-qrcode text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight">
              {formatRupiah(totalQR)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Nontunai / QRIS
            </p>
          </div>
        </div>

        {/* CARD 5: TOTAL OMSET */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {formatRupiah(totalOmset)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Cash + QR
            </p>
          </div>
        </div>

        {/* CARD 6: TOTAL PENGELUARAN */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-sm"></i>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-base sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatRupiah(totalPengeluaran)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Belanja / Operasional
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
