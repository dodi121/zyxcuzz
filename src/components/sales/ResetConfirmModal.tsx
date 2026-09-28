import React from 'react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl mx-auto flex items-center justify-center text-xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Reset Data Closing Shift?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Apakah Anda yakin ingin menghapus data transaksi shift aktif pada outlet ini?
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            ✓ Master Produk &amp; Katalog tetap aman dan tidak akan terhapus.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-200 dark:shadow-none cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
};
