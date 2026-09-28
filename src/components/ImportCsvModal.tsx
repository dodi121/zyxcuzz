import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { RecapEntry } from '../types/recap';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: RecapEntry[]) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<RecapEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  const parseCsv = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setErrorMessage('File CSV harus memiliki minimal 1 baris judul kolom dan 1 baris data!');
        return;
      }

      const entries: RecapEntry[] = [];
      // Simple parser handling quotes
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Regex split handling quotes
        const cols: string[] = [];
        let match;
        const re = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        while ((match = re.exec(line)) !== null && match.index < line.length) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
          cols.push(val.trim());
          if (re.lastIndex === match.index) re.lastIndex++;
        }

        if (cols.length >= 4) {
          // Expected order:
          // [0] No, [1] Kode, [2] Tanggal, [3] Waktu, [4] Judul, [5] Kategori, [6] Tipe, [7] Nominal, [8] Modal, [9] Status, [10] Saluran, [11] Pihak, [12] Metode, [13] Catatan
          const rawType = (cols[6] || '').toLowerCase();
          const isIncome = !rawType.includes('pengeluaran') && !rawType.includes('expense');
          const amount = parseFloat((cols[7] || cols[3] || '0').replace(/[^0-9.]/g, '')) || 50000;
          const cost = parseFloat((cols[8] || '0').replace(/[^0-9.]/g, '')) || 0;

          const rawStatus = (cols[9] || 'completed').toLowerCase();
          let status: RecapEntry['status'] = 'completed';
          if (rawStatus.includes('proses') || rawStatus.includes('process')) status = 'processing';
          else if (rawStatus.includes('tunggu') || rawStatus.includes('pend')) status = 'pending';
          else if (rawStatus.includes('batal') || rawStatus.includes('cancel')) status = 'cancelled';

          entries.push({
            id: `import-${Date.now()}-${i}`,
            code: cols[1] || `IMP-${Date.now().toString().slice(-4)}-${i}`,
            date: cols[2] && cols[2].includes('-') ? cols[2] : new Date().toISOString().split('T')[0],
            time: cols[3] || '10:00',
            title: cols[4] || cols[1] || `Data Rekap #${i}`,
            category: cols[5] || 'Umum',
            type: isIncome ? 'income' : 'expense',
            amount,
            cost: cost > 0 ? cost : undefined,
            status,
            departmentOrChannel: cols[10] || 'Import Eksternal',
            customerOrVendor: cols[11] || '-',
            paymentMethod: cols[12] || 'Transfer',
            notes: cols[13] || 'Diimpor dari file CSV',
          });
        }
      }

      if (entries.length === 0) {
        setErrorMessage('Format CSV tidak dikenali atau baris data kosong.');
        return;
      }

      setParsedEntries(entries);
      setErrorMessage('');
      setStep('preview');
    } catch {
      setErrorMessage('Gagal memproses teks CSV. Pastikan pemisah berupa koma (,).');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  };

  const downloadSampleTemplate = () => {
    const sample = `No,Kode Transaksi,Tanggal,Waktu,Judul / Deskripsi,Kategori,Tipe,Nominal,Biaya Modal,Status,Saluran,Pelanggan,Metode,Catatan
1,TRX-2026-901,2026-09-25,10:30,Penjualan Hampers Organik,Makanan & Minuman,Pemasukan,1250000,750000,completed,Shopee Store,Budi Santoso,QRIS,Pesanan ekspres
2,TRX-2026-902,2026-09-25,14:00,Beli Kemasan & Kotak Karton,Operasional Toko,Pengeluaran,350000,350000,completed,Gudang Pusat,Toko Plastik Jaya,Tunai,Stok mingguan`;

    const blob = new Blob(['\ufeff' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Contoh_Template_RekapData.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    onImport(parsedEntries);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Impor Data Rekapan (CSV / Excel)</h3>
            <p className="text-xs text-slate-500">
              Unggah file spreadsheet CSV atau tempel teks data langsung
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              {/* File Drop Area */}
              <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                <UploadCloud className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="font-semibold text-sm text-slate-800">
                  Pilih Berkas CSV dari Komputer
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Mendukung format UTF-8 .csv dengan delimiter koma (,)
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Or paste text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Atau Tempel Teks CSV di sini
                  </label>
                  <button
                    onClick={downloadSampleTemplate}
                    type="button"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Contoh Template CSV</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="No,Kode Transaksi,Tanggal,Waktu,Judul,Kategori,Tipe,Nominal,Biaya Modal,Status,Saluran,Pelanggan,Metode,Catatan..."
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => parseCsv(csvText)}
                  disabled={!csvText.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                >
                  Tinjau Data ({csvText.trim() ? 'Pratinjau' : 'Kosong'})
                </button>
              </div>
            </div>
          ) : (
            /* Preview Step */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Berhasil mengenali <strong>{parsedEntries.length}</strong> baris data rekapan siap diimpor.
                  </span>
                </div>
                <button
                  onClick={() => setStep('input')}
                  className="text-emerald-700 underline font-semibold text-xs"
                >
                  Ubah CSV
                </button>
              </div>

              {/* Preview table */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="p-2">Kode</th>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Deskripsi</th>
                      <th className="p-2">Kategori</th>
                      <th className="p-2 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedEntries.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-semibold">{item.code}</td>
                        <td className="p-2">{item.date}</td>
                        <td className="p-2 truncate max-w-[150px]">{item.title}</td>
                        <td className="p-2">{item.category}</td>
                        <td
                          className={`p-2 text-right font-mono font-semibold ${
                            item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
                >
                  Konfirmasi & Tambahkan ({parsedEntries.length} Data)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
