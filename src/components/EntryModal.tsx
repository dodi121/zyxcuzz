import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { RecapEntry, TransactionType, EntryStatus } from '../types/recap';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: RecapEntry) => void;
  editingEntry?: RecapEntry | null;
  existingCategories: string[];
  existingChannels: string[];
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  existingCategories,
  existingChannels,
}) => {
  const [type, setType] = useState<TransactionType>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<EntryStatus>('completed');
  const [departmentOrChannel, setDepartmentOrChannel] = useState('');
  const [customerOrVendor, setCustomerOrVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setType(editingEntry.type);
      setTitle(editingEntry.title);
      setAmount(editingEntry.amount.toString());
      setCost(editingEntry.cost ? editingEntry.cost.toString() : '');
      setCategory(editingEntry.category);
      setDate(editingEntry.date);
      setTime(editingEntry.time || '');
      setStatus(editingEntry.status);
      setDepartmentOrChannel(editingEntry.departmentOrChannel || '');
      setCustomerOrVendor(editingEntry.customerOrVendor || '');
      setPaymentMethod(editingEntry.paymentMethod || 'Transfer BCA');
      setNotes(editingEntry.notes || '');
    } else {
      // Default new entry
      setType('income');
      setTitle('');
      setAmount('');
      setCost('');
      setCategory(existingCategories[0] || 'Penjualan');
      setCustomCategory('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      setTime(nowTime);
      setStatus('completed');
      setDepartmentOrChannel(existingChannels[0] || 'Toko Utama');
      setCustomerOrVendor('');
      setPaymentMethod('Transfer BCA');
      setNotes('');
    }
  }, [editingEntry, isOpen, existingCategories, existingChannels]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert('Mohon isi judul deskripsi dan nominal transaksi!');
      return;
    }

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    const finalAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    const finalCost = cost ? parseFloat(cost.replace(/[^0-9]/g, '')) : undefined;

    const newCode = editingEntry
      ? editingEntry.code
      : `TRX-${date.replace(/-/g, '').slice(2)}-${Math.floor(100 + Math.random() * 900)}`;

    const entryToSave: RecapEntry = {
      id: editingEntry ? editingEntry.id : `rec-${Date.now()}`,
      code: newCode,
      date,
      time: time || '12:00',
      title: title.trim(),
      category: finalCategory || 'Umum',
      type,
      amount: finalAmount,
      cost: finalCost,
      status,
      departmentOrChannel: departmentOrChannel || 'Kantor',
      customerOrVendor: customerOrVendor.trim(),
      paymentMethod,
      notes: notes.trim(),
    };

    onSave(entryToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingEntry ? 'Ubah Data Rekapan' : 'Tambah Rekapan Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Isi parameter transaksi dan detail keuangan secara lengkap
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Arus Kas / Rekap
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Pemasukan (+ Uang Masuk)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Pengeluaran (- Beban Kas)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul / Deskripsi Rekapan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penjualan Paket Kopi Espresso 10 Box"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Nominal & Modal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nominal Transaksi (Rp) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 text-sm font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Harga Pokok / Modal (Opsional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Waktu (WIB)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="14:30"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              >
                {existingCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">+ Tulis Kategori Baru...</option>
              </select>
              {category === '__custom__' && (
                <input
                  type="text"
                  required
                  placeholder="Ketik kategori baru..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 border border-indigo-300 rounded-lg focus:outline-hidden"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Realisasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EntryStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="completed">Selesai / Sukses</option>
                <option value="processing">Diproses / Dalam Pengiriman</option>
                <option value="pending">Menunggu Konfirmasi / Tagihan</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Saluran & Pelanggan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Saluran / Departemen
              </label>
              <input
                type="text"
                value={departmentOrChannel}
                onChange={(e) => setDepartmentOrChannel(e.target.value)}
                placeholder="Shopee, Toko Offline, Divisi HR..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pelanggan / Pihak Kedua
              </label>
              <input
                type="text"
                value={customerOrVendor}
                onChange={(e) => setCustomerOrVendor(e.target.value)}
                placeholder="Nama Pembeli / Vendor / Karyawan"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Metode Pembayaran & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Transfer BCA, QRIS, Tunai..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Tambahan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nomor resi, keterangan tempo, dll"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{editingEntry ? 'Simpan Perubahan' : 'Tambahkan ke Rekapan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
