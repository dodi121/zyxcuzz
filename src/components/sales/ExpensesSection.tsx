import React, { useState } from 'react';
import { ExpenseItem } from '../../types/sales';
import { formatRupiah, formatNumber, parseRupiah } from '../../utils/salesHelpers';

interface ExpensesSectionProps {
  pengeluaranList: ExpenseItem[];
  onAddPengeluaran: (item: ExpenseItem) => void;
  onDeletePengeluaran: (index: number) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  pengeluaranList,
  onAddPengeluaran,
  onDeletePengeluaran,
}) => {
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');

  const totalPengeluaran = pengeluaranList.reduce(
    (sum, p) => sum + (p.nominal || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ket = keterangan.trim();
    const nom = parseRupiah(nominal);

    if (!ket || nom <= 0) return;

    onAddPengeluaran({
      id: Date.now(),
      keterangan: ket,
      nominal: nom,
    });

    setKeterangan('');
    setNominal('');
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-money-bill-transfer text-rose-500"></i>
            <span>Pengeluaran Kas Shift (Belanja / Operasional)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catat pengeluaran tunai dari laci (mengurangi uang cash seharusnya)
          </p>
        </div>
        <span className="text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full">
          {formatRupiah(totalPengeluaran)}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-rose-50/40 dark:bg-rose-950/15 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40"
      >
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Keterangan Pengeluaran
          </label>
          <input
            type="text"
            required
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Belanja Es Batu, Galon, Parkir..."
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-hidden"
          />
        </div>
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nominal (Rp)
          </label>
          <input
            type="text"
            required
            value={nominal}
            onChange={(e) => {
              const val = parseRupiah(e.target.value);
              setNominal(val > 0 ? formatNumber(val) : '');
            }}
            placeholder="15.000"
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-hidden"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {/* Tabel Daftar Pengeluaran */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3.5 text-center w-12">No</th>
              <th className="py-2.5 px-3.5">Keterangan</th>
              <th className="py-2.5 px-3.5 text-right">Nominal</th>
              <th className="py-2.5 px-3.5 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {pengeluaranList.map((p, idx) => (
              <tr
                key={p.id || idx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <td className="py-2.5 px-3.5 text-center font-semibold text-slate-400">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-100">
                  {p.keterangan}
                </td>
                <td className="py-2.5 px-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                  {formatRupiah(p.nominal)}
                </td>
                <td className="py-2.5 px-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Hapus pengeluaran "${p.keterangan}"?`)) {
                        onDeletePengeluaran(idx);
                      }
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition cursor-pointer"
                    title="Hapus"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pengeluaranList.length === 0 && (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 space-y-1">
            <p className="text-xs italic">
              Belum ada catatan pengeluaran kas pada shift ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
