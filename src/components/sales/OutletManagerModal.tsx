import React, { useState } from 'react';
import { OutletInfo } from '../../types/sales';

interface OutletManagerModalProps {
  isOpen: boolean;
  outlets: Record<string, OutletInfo>;
  activeOutlet: string;
  onClose: () => void;
  onAddOutlet: (name: string) => void;
  onDeleteOutlet: (key: string) => void;
  onSwitchOutlet: (key: string) => void;
}

export const OutletManagerModal: React.FC<OutletManagerModalProps> = ({
  isOpen,
  outlets,
  activeOutlet,
  onClose,
  onAddOutlet,
  onDeleteOutlet,
  onSwitchOutlet,
}) => {
  const [newOutletName, setNewOutletName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newOutletName.trim();
    if (!trimmed) return;

    // Cek duplikasi nama
    const isDuplicate = Object.values(outlets).some(
      (o) => o?.name?.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      alert(`Outlet "${trimmed}" sudah ada!`);
      return;
    }

    onAddOutlet(trimmed);
    setNewOutletName('');
  };

  // Filter unik agar tidak ada outlet dengan nama ganda di daftar
  const uniqueOutletKeys = Object.keys(outlets).filter(
    (key, index, self) =>
      index ===
      self.findIndex(
        (k) =>
          outlets[k]?.name?.trim()?.toLowerCase() ===
          outlets[key]?.name?.trim()?.toLowerCase()
      )
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-store text-indigo-600 dark:text-indigo-400"></i>
            <span>Kelola Outlet</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="space-y-3">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newOutletName}
              onChange={(e) => setNewOutletName(e.target.value)}
              placeholder="Nama Outlet Baru..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
            >
              Tambah
            </button>
          </form>

          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Daftar Outlet Aktif:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {uniqueOutletKeys.map((key) => {
                const isCurrent = key === activeOutlet;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => onSwitchOutlet(key)}
                    >
                      <i
                        className={`fa-solid fa-store ${
                          isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                        }`}
                      ></i>
                      <span>{outlets[key].name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    {uniqueOutletKeys.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Yakin ingin menghapus outlet "${outlets[key].name}"? Semua data shift outlet ini akan terhapus.`
                            )
                          ) {
                            onDeleteOutlet(key);
                          }
                        }}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded transition cursor-pointer"
                        title="Hapus Outlet"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
