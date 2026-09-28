import React from 'react';
import { formatRupiah, formatNumber, parseRupiah } from '../../utils/salesHelpers';

interface ClosingSectionProps {
  cashSeharusnya: number;
  cashAktual: number;
  onUpdateCashAktual: (val: number) => void;
  onOpenClosingModal: () => void;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({
  cashSeharusnya,
  cashAktual,
  onUpdateCashAktual,
  onOpenClosingModal,
}) => {
  const selisih = cashAktual - cashSeharusnya;

  return (
    <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-cash-register text-indigo-600 dark:text-indigo-400"></i>
            <span>Pemeriksaan Uang Cash & Closing</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kalkulasi kesesuaian fisik uang tunai di laci berdasarkan omset cash dikurangi pengeluaran
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CASH SEHARUSNYA CARD */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Cash Seharusnya (Laci)
          </span>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {formatRupiah(cashSeharusnya)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Rumus: Modal Awal + Omset Cash - Pengeluaran
          </p>
        </div>

        {/* CASH AKTUAL INPUT CARD */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
          <label
            htmlFor="inputCashAktual"
            className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider cursor-pointer"
          >
            Input Uang Cash Aktual
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-indigo-500 dark:text-indigo-400 font-bold text-sm">
              Rp
            </span>
            <input
              type="text"
              id="inputCashAktual"
              placeholder="0"
              value={cashAktual > 0 ? formatNumber(cashAktual) : ''}
              onChange={(e) => onUpdateCashAktual(parseRupiah(e.target.value))}
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-extrabold text-lg transition outline-hidden"
            />
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            Hitung seluruh fisik uang kertas/koin di laci
          </p>
        </div>

        {/* STATUS SELISIH CARD */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 flex flex-col justify-center transition-all">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Selisih & Status
          </span>
          <p
            className={`text-2xl font-extrabold tracking-tight ${
              selisih === 0
                ? 'text-slate-800 dark:text-slate-100'
                : selisih < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-sky-600 dark:text-sky-400'
            }`}
          >
            {formatRupiah(Math.abs(selisih))}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg w-max">
            {selisih === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <i className="fa-solid fa-circle-check"></i>
                <span>CLOSING SESUAI</span>
              </span>
            ) : selisih < 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>SISA CASH KURANG</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                <i className="fa-solid fa-circle-plus"></i>
                <span>CASH LEBIH</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOMBOL LOCK CLOSING */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenClosingModal}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2.5 active:scale-[0.99] group cursor-pointer"
        >
          <i className="fa-solid fa-lock text-amber-400 group-hover:rotate-12 transition-transform"></i>
          <span>TUTUP CLOSING</span>
        </button>
      </div>
    </section>
  );
};
