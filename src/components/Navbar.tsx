import React from 'react';
import {
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  Printer,
  Share2,
  RefreshCw,
  ShoppingBag,
  Wallet,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { TemplateType } from '../types/recap';
import { TEMPLATE_INFO } from '../data/initialData';

interface NavbarProps {
  currentTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenShareModal: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onResetData: () => void;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTemplate,
  onSelectTemplate,
  onOpenAddModal,
  onOpenImportModal,
  onOpenShareModal,
  onExportCSV,
  onPrintReport,
  onResetData,
  totalCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getTemplateIcon = (type: TemplateType) => {
    switch (type) {
      case 'retail_sales':
        return <ShoppingBag className="w-4 h-4 text-indigo-600" />;
      case 'cashflow':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'operational':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">RekapData</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 hidden sm:inline-block">
                  Live Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Dashboard Rekapan Data Interaktif & Laporan Finansial
              </p>
            </div>
          </div>

          {/* Template Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
              title="Pilih Template Rekapan"
            >
              {getTemplateIcon(currentTemplate)}
              <span className="hidden sm:inline font-semibold">
                {TEMPLATE_INFO[currentTemplate].name}
              </span>
              <span className="sm:hidden font-semibold">Template</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pilih Jenis Rekap Data
                  </div>
                  {(Object.keys(TEMPLATE_INFO) as TemplateType[]).map((key) => {
                    const info = TEMPLATE_INFO[key];
                    const active = currentTemplate === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onSelectTemplate(key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors ${
                          active
                            ? 'bg-indigo-50/80 text-indigo-950 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5">{getTemplateIcon(key)}</div>
                        <div>
                          <div className="text-sm font-medium">{info.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{info.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                    <button
                      onClick={() => {
                        onResetData();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left py-1.5 text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kembalikan Data Contoh Awal</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Share / WhatsApp */}
            <button
              onClick={onOpenShareModal}
              title="Kirim Ringkasan ke WhatsApp"
              className="p-2 sm:px-2.5 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Bagikan</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={onPrintReport}
              title="Cetak Laporan / Simpan PDF"
              className="p-2 sm:px-2.5 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">Cetak PDF</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              title="Unduh Rekap Spreadsheet (CSV/Excel)"
              className="p-2 sm:px-2.5 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Ekspor CSV</span>
            </button>

            {/* Import CSV */}
            <button
              onClick={onOpenImportModal}
              title="Unggah / Impor Data CSV"
              className="p-2 sm:px-2.5 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Impor CSV</span>
            </button>

            {/* Add Record Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-200 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Rekap</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
