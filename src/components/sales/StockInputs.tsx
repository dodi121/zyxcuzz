import React from 'react';
import { formatNumber, parseRupiah } from '../../utils/salesHelpers';

interface StockInputsProps {
  modalAwal: number;
  cupAwal: number;
  cupTerjualManual: number | null;
  totalCupAuto: number;
  cupTerjualMinuman?: number;
  cupGratis?: number;
  onUpdateModalAwal: (val: number) => void;
  onUpdateCupAwal: (val: number) => void;
  onUpdateCupTerjualManual: (val: number | null) => void;
  modalAwalInputRef: React.RefObject<HTMLInputElement | null>;
}

export const StockInputs: React.FC<StockInputsProps> = ({
  modalAwal,
  cupAwal,
  cupTerjualManual,
  totalCupAuto,
  cupTerjualMinuman = 0,
  cupGratis = 0,
  onUpdateModalAwal,
  onUpdateCupAwal,
  onUpdateCupTerjualManual,
  modalAwalInputRef,
}) => {
  const isManual = cupTerjualManual !== null;

  return (
    <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modal Awal */}
        <div className="flex flex-col justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs">
              <i className="fa-solid fa-vault text-indigo-600 dark:text-indigo-400"></i>
            </div>
            <div>
              <label
                htmlFor="inputModalAwal"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide cursor-pointer"
              >
                Modal Awal Laci
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Uang tunai awal shift
              </span>
            </div>
          </div>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 font-semibold text-xs">
              Rp
            </span>
            <input
              ref={modalAwalInputRef}
              type="text"
              id="inputModalAwal"
              placeholder="0"
              value={modalAwal > 0 ? formatNumber(modalAwal) : ''}
              onChange={(e) => onUpdateModalAwal(parseRupiah(e.target.value))}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold text-sm transition outline-hidden"
            />
          </div>
        </div>

        {/* Kemasan Awal */}
        <div className="flex flex-col justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs">
              <i className="fa-solid fa-boxes-stacked text-amber-600 dark:text-amber-400"></i>
            </div>
            <div>
              <label
                htmlFor="inputCupAwal"
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide cursor-pointer"
              >
                Stok Kemasan / Cup Awal
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Jumlah stok fisik awal
              </span>
            </div>
          </div>
          <div className="relative mt-1">
            <input
              type="number"
              id="inputCupAwal"
              min="0"
              placeholder="0"
              value={cupAwal}
              onChange={(e) => onUpdateCupAwal(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold text-sm transition outline-hidden"
            />
          </div>
        </div>

        {/* Item Minuman Keluar (Manual / Auto Input) */}
        <div className="flex flex-col justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs">
                <i className="fa-solid fa-mug-hot text-orange-600 dark:text-orange-400"></i>
              </div>
              <div>
                <label
                  htmlFor="inputCupTerjual"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide cursor-pointer"
                >
                  Minuman Keluar (Terjual + Non-Bayar)
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isManual
                    ? 'Manual Input'
                    : cupGratis > 0
                    ? `${cupTerjualMinuman} terjual + ${cupGratis} non-bayar`
                    : 'Auto dari transaksi'}
                </span>
              </div>
            </div>
            {isManual && (
              <button
                type="button"
                onClick={() => onUpdateCupTerjualManual(null)}
                className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2 py-1 rounded font-semibold transition cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left"></i> Auto ({totalCupAuto})
              </button>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type="number"
              id="inputCupTerjual"
              min="0"
              placeholder={isManual ? '0' : `Auto: ${totalCupAuto}`}
              value={isManual ? cupTerjualManual : ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  onUpdateCupTerjualManual(null);
                } else {
                  onUpdateCupTerjualManual(Math.max(0, parseInt(e.target.value, 10) || 0));
                }
              }}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold text-sm transition outline-hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
