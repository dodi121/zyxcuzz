import React, { useState } from 'react';
import { FreeItem, ProductCategory } from '../../types/sales';

interface FreeItemsSectionProps {
  gratisList: FreeItem[];
  onAddGratis: (item: FreeItem) => void;
  onDeleteGratis: (index: number) => void;
}

export const FreeItemsSection: React.FC<FreeItemsSectionProps> = ({
  gratisList,
  onAddGratis,
  onDeleteGratis,
}) => {
  const [kategori, setKategori] = useState<ProductCategory>('minuman');
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('1');

  const totalCupGratis = gratisList
    .filter((g) => g.kategori === 'minuman')
    .reduce((sum, g) => sum + (g.cup || 0), 0);

  const totalPcsGratis = gratisList
    .filter((g) => g.kategori === 'makanan')
    .reduce((sum, g) => sum + (g.cup || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ket = keterangan.trim();
    const qty = Math.max(1, parseInt(jumlah, 10) || 1);

    if (!ket) return;

    onAddGratis({
      id: Date.now(),
      kategori,
      keterangan: ket,
      cup: qty,
    });

    setKeterangan('');
    setJumlah('1');
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-gift text-amber-500"></i>
            <span>Pengambilan Tanpa Bayar (Gratis / Internal / Kasbon)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mencatat minuman atau makanan yang diambil tanpa pembayaran (Omset Rp0). Stok item otomatis ikut terhitung di total pengeluaran barang.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {totalCupGratis > 0 && (
            <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <i className="fa-solid fa-mug-hot"></i>
              <span>{totalCupGratis} Cup Minuman</span>
            </span>
          )}
          {totalPcsGratis > 0 && (
            <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              {totalPcsGratis} Pcs Makanan
            </span>
          )}
          <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
            {gratisList.length} Catatan
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40"
      >
        {/* Kategori Gratis */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kategori
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value as ProductCategory)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="minuman">Minuman</option>
            <option value="makanan">Makanan</option>
          </select>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Keterangan Pengambilan
          </label>
          <input
            type="text"
            required
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Ibu Iva Es Teh / Pak Budi Toast"
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Jumlah ({kategori === 'makanan' ? 'Pcs' : 'Cup'})
          </label>
          <input
            type="number"
            min="1"
            required
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="1"
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {/* Tabel Daftar Gratis */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3.5 text-center w-12">No</th>
              <th className="py-2.5 px-3.5">Keterangan</th>
              <th className="py-2.5 px-3.5 text-center">Kategori</th>
              <th className="py-2.5 px-3.5 text-center">Jumlah (Qty)</th>
              <th className="py-2.5 px-3.5 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {gratisList.map((g, idx) => {
              const isMakanan = g.kategori === 'makanan';
              return (
                <tr
                  key={g.id || idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="py-2.5 px-3.5 text-center font-semibold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-100">
                    {g.keterangan}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    {isMakanan ? (
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        Makanan
                      </span>
                    ) : (
                      <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        Minuman
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                    <span>{g.cup || 1}</span>{' '}
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {isMakanan ? 'pcs' : 'cup'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus catatan "${g.keterangan}"?`)) {
                          onDeleteGratis(idx);
                        }
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition cursor-pointer"
                      title="Hapus"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {gratisList.length === 0 && (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 space-y-1">
            <p className="text-xs italic">
              Belum ada catatan pengambilan tanpa bayar pada shift ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
