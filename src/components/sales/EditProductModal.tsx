import React, { useState, useEffect } from 'react';
import { ProductItem, ProductCategory, PaymentMethod } from '../../types/sales';
import { formatNumber, parseRupiah } from '../../utils/salesHelpers';

interface EditProductModalProps {
  isOpen: boolean;
  item: ProductItem | null;
  index: number | null;
  onClose: () => void;
  onSave: (index: number, updatedItem: ProductItem) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  item,
  index,
  onClose,
  onSave,
}) => {
  const [kategori, setKategori] = useState<ProductCategory>('minuman');
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [cup, setCup] = useState('1');
  const [metode, setMetode] = useState<PaymentMethod>('CASH');

  useEffect(() => {
    if (item) {
      setKategori(item.kategori || 'minuman');
      setNama(item.nama);
      setHarga(formatNumber(item.harga));
      setCup((item.cup || 1).toString());
      setMetode(item.metode || 'CASH');
    }
  }, [item]);

  if (!isOpen || item === null || index === null) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const namaClean = nama.trim();
    const hargaNum = parseRupiah(harga);
    const cupNum = Math.max(1, parseInt(cup, 10) || 1);

    if (!namaClean || hargaNum <= 0) return;

    onSave(index, {
      ...item,
      nama: namaClean,
      harga: hargaNum,
      cup: cupNum,
      kategori,
      metode,
      total: hargaNum * cupNum,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-indigo-600 dark:text-indigo-400"></i>
            <span>Edit Transaksi Produk</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Kategori Produk
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as ProductCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-hidden"
            >
              <option value="minuman">Minuman (Cup)</option>
              <option value="makanan">Makanan (Pcs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="text"
                required
                value={harga}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  setHarga(val > 0 ? formatNumber(val) : '');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {kategori === 'makanan' ? 'Jumlah Pcs' : 'Jumlah Cup'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={cup}
                onChange={(e) => setCup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-hidden"
            >
              <option value="CASH">CASH (Uang Tunai)</option>
              <option value="QR">QR (Nontunai / QRIS)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
