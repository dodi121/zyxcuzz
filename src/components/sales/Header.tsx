import React, { useState, useEffect } from 'react';
import { AppState, ShiftType } from '../../types/sales';
import { CloudSyncStatus } from '../../services/supabase';
import { ShieldCheck, Moon, Sun, Store, Clock } from 'lucide-react';

interface HeaderProps {
  appState: AppState;
  onSwitchOutlet: (outletKey: string) => void;
  onSwitchShift: (shift: ShiftType) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  cloudStatus?: {
    status: CloudSyncStatus;
    message: string;
  };
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  onSwitchOutlet,
  onSwitchShift,
  darkMode,
  onToggleDarkMode,
  cloudStatus = { status: 'online', message: 'CLOUD SIAP' },
  onOpenAdmin,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('id-ID');
      setCurrentDateTime(`${dateStr} - ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOutletName =
    appState.outlets[appState.activeOutlet]?.name || 'Outlet Pusat';
  const currentShift =
    appState.data[appState.activeOutlet]?.activeShift || 'pagi';
  const bizLogo = appState.businessConfig?.logoUrl;
  const bizName = appState.businessConfig?.businessName || 'Rekapan Penjualan';

  const getCloudStatusStyle = (status: CloudSyncStatus) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'syncing':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'error':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'offline':
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getCloudIcon = (status: CloudSyncStatus) => {
    switch (status) {
      case 'online':
        return 'fa-cloud-check text-emerald-600 dark:text-emerald-400';
      case 'syncing':
        return 'fa-arrows-rotate fa-spin text-amber-600 dark:text-amber-400';
      case 'error':
        return 'fa-triangle-exclamation text-rose-600 dark:text-rose-400';
      case 'offline':
      default:
        return 'fa-cloud-slash text-slate-500';
    }
  };

  // Filter unik berdasarkan nama outlet agar opsi dropdown tidak pernah ganda
  const uniqueOutletKeys = Object.keys(appState.outlets).filter(
    (key, index, self) =>
      index ===
      self.findIndex(
        (k) =>
          appState.outlets[k]?.name?.trim()?.toLowerCase() ===
          appState.outlets[key]?.name?.trim()?.toLowerCase()
      )
  );

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & DateTime */}
        <div className="flex items-center gap-3">
          {bizLogo ? (
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              <img src={bizLogo} alt={bizName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
              <i className="fa-solid fa-calculator text-lg"></i>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {bizName}
              </h1>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-extrabold uppercase border border-indigo-200 dark:border-indigo-900/60">
                {activeOutletName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>{currentDateTime || 'Memuat waktu...'}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Sinkronisasi Cloud */}
          <div
            className={`flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl border tracking-wider uppercase ${getCloudStatusStyle(
              cloudStatus.status
            )}`}
            title="Status Realtime Database Server"
          >
            <i className={`fa-solid ${getCloudIcon(cloudStatus.status)}`}></i>
            <span className="hidden sm:inline">{cloudStatus.message}</span>
            <span className="sm:hidden">
              {cloudStatus.status === 'online' ? 'ONLINE' : cloudStatus.message.slice(0, 8)}
            </span>
          </div>

          {/* Pilih Outlet Aktif (Kasir hanya bisa memilih, tidak bisa tambah/hapus di sini) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Store size={14} className="text-slate-500 ml-1.5" />
            <select
              value={appState.activeOutlet}
              onChange={(e) => onSwitchOutlet(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 px-2 py-1 outline-hidden cursor-pointer"
            >
              {uniqueOutletKeys.map((key) => (
                <option key={key} value={key} className="dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {appState.outlets[key]?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Shift */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSwitchShift('pagi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                currentShift === 'pagi'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-sun text-amber-500"></i>
              <span>Pagi</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchShift('sore')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                currentShift === 'sore'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-moon text-indigo-500 dark:text-indigo-400"></i>
              <span>Sore</span>
            </button>
          </div>

          {/* Tombol Dark Mode */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-yellow-400 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
            title="Ubah Tema"
          >
            {darkMode ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} />}
          </button>

          {/* TOMBOL PRIVATE ADMIN PANEL */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Buka Admin Panel (Private Login)"
          >
            <ShieldCheck size={15} className="text-emerald-400 dark:text-white" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
