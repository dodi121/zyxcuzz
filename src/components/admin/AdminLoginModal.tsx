import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savedPin?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  savedPin = 'admin123',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = (savedPin || 'admin123').trim();
    if (pinInput.trim() === targetPin) {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('Password / PIN Admin salah! Coba kembali (default: admin123).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-3 text-indigo-400">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Login Admin Panel</h2>
          <p className="text-xs text-slate-300 mt-1">
            Area privat pemilik &amp; administrator. Akses laporan keuangan, master produk, restok sisa barang, dan pengaturan sistem.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/50 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password / PIN Akses Admin
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showPin ? 'text' : 'password'}
                required
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan PIN Admin (default: admin123)"
                className="w-full pl-10 pr-20 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-hidden transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
              >
                {showPin ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              PIN Bawaan: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">admin123</code> (bisa diganti di dalam menu Pengaturan).
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Masuk Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
