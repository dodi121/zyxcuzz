import React, { useState } from 'react';
import {
  supabaseSync,
  CloudSyncStatus,
  SQL_SCHEMA_INSTRUCTION,
} from '../../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudStatus: {
    status: CloudSyncStatus;
    message: string;
  };
  onSendPingAlert: (msg: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  cloudStatus,
  onSendPingAlert,
}) => {
  const currentConfig = supabaseSync.getConfig();

  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [showConfig, setShowConfig] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseSync.saveConfig({
      url,
      anonKey,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onSendPingAlert('Pengaturan server disimpan & terhubung ulang!');
  };

  const handleReset = () => {
    if (confirm('Kembalikan ke server Supabase default bawaan?')) {
      supabaseSync.resetConfigToDefault();
      const cfg = supabaseSync.getConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      onSendPingAlert('Menggunakan server Supabase default bawaan!');
    }
  };

  const handlePingTest = () => {
    const success = supabaseSync.sendPingTest();
    if (success) {
      onSendPingAlert('Sinyal lonceng uji terkirim! Cek HP B / perangkat lain.');
    } else {
      onSendPingAlert('Gagal mengirim sinyal. Periksa koneksi internet.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_INSTRUCTION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onSendPingAlert('Kode SQL berhasil disalin ke clipboard!');
  };

  const getStatusBadge = () => {
    switch (cloudStatus.status) {
      case 'online':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          icon: 'fa-circle-check text-emerald-500',
          title: 'TERHUBUNG & SINKRON OTOMATIS',
          desc: 'HP A, HP B, tablet & PC langsung terhubung otomatis dalam 1 sistem real-time.',
        };
      case 'syncing':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
          icon: 'fa-arrows-rotate fa-spin text-amber-500',
          title: 'SEDANG MENYINKRONKAN...',
          desc: 'Menyimpan atau mengambil pembaruan terbaru dari cloud.',
        };
      case 'error':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
          icon: 'fa-triangle-exclamation text-rose-500',
          title: 'MENCOBA REKONEKSI',
          desc: 'Sistem sedang menghubungkan kembali ke cloud.',
        };
      case 'offline':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
          icon: 'fa-cloud-slash text-slate-400',
          title: 'MODE LOKAL',
          desc: 'Data aman di memori perangkat ini.',
        };
    }
  };

  const badgeInfo = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none">
              <i className="fa-solid fa-cloud text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sinkronisasi Cloud Realtime
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                HP A &amp; HP B otomatis tersinkron tanpa perlu seting ruangan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${badgeInfo.bg}`}>
            <i className={`fa-solid ${badgeInfo.icon} text-xl mt-0.5`}></i>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black tracking-wider uppercase">
                  {badgeInfo.title}
                </span>
                <span className="text-[10px] font-bold bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md border border-current text-emerald-600 dark:text-emerald-400">
                  OTOMATIS AKTIF
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{badgeInfo.desc}</p>
            </div>
          </div>

          {/* Tombol Uji Ping */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tes Sinyal ke HP Lain
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Kirim lonceng notifikasi uji ke HP B untuk memastikan terhubung
              </div>
            </div>
            <button
              type="button"
              onClick={handlePingTest}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-bell text-[11px]"></i>
              <span>Kirim Test Ping</span>
            </button>
          </div>

          {/* Pengaturan Server Kustom (Opsional) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 py-1"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-sliders text-[11px]"></i>
                <span>Pengaturan Server Supabase Sendiri (Opsional)</span>
              </span>
              <i className={`fa-solid ${showConfig ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
            </button>

            {showConfig && (
              <form onSubmit={handleSave} className="space-y-4 mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gunakan kredensial Supabase Anda sendiri jika tidak ingin memakai server bawaan:
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Kembalikan ke Default
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <textarea
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    rows={2}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSql(!showSql)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-database text-[10px]"></i>
                    <span>{showSql ? 'Tutup Skrip SQL' : 'Salin Skrip Tabel SQL'}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-floppy-disk text-[11px]"></i>
                    <span>Simpan &amp; Hubungkan</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg font-semibold flex items-center gap-2">
                    <i className="fa-solid fa-check"></i>
                    <span>Kredensial disimpan dan sistem terhubung ulang!</span>
                  </div>
                )}

                {showSql && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-xl text-slate-200 text-xs space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-400">
                        Query SQL Supabase:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySql}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <i className={`fa-solid ${copiedSql ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                        <span>{copiedSql ? 'Disalin!' : 'Salin SQL'}</span>
                      </button>
                    </div>
                    <pre className="font-mono text-[10px] overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800 text-emerald-300">
                      {SQL_SCHEMA_INSTRUCTION}
                    </pre>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
