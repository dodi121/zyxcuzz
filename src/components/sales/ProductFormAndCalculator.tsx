import React, { useState, useRef } from 'react';
import { ProductCategory, PaymentMethod, ProductItem, MasterProduct } from '../../types/sales';
import { formatRupiah, formatNumber, parseRupiah } from '../../utils/salesHelpers';
import { ShoppingCart, Plus, Trash2, Camera, Upload, Check, Coins, ArrowDown, Search } from 'lucide-react';

interface ProductFormAndCalculatorProps {
  masterProducts?: MasterProduct[];
  onSaveOrder: (
    items: ProductItem[],
    meta?: {
      cashDiterima?: number;
      kembalian?: number;
      qrisProofUrl?: string;
      paymentMethod?: PaymentMethod;
    }
  ) => void;
  onQuickAlert: (msg: string) => void;
}

export const ProductFormAndCalculator: React.FC<ProductFormAndCalculatorProps> = ({
  masterProducts = [],
  onSaveOrder,
  onQuickAlert,
}) => {
  // Product Form State
  const [kategori, setKategori] = useState<ProductCategory>('minuman');
  const [namaProduk, setNamaProduk] = useState('');
  const [hargaProduk, setHargaProduk] = useState('');
  const [jumlahQty, setJumlahQty] = useState('1');
  const [metodeBayar, setMetodeBayar] = useState<PaymentMethod>('CASH');

  // Quick Catalog Search in POS
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);

  // Pending order list (Keranjang Belanja: Produk 1 -> Produk 2 -> Produk 3 -> Simpan Semua)
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);

  // QRIS Photo Proof State
  const [qrisProofUrl, setQrisProofUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculator State
  const [calcTagihan, setCalcTagihan] = useState('');
  const [calcUangDiterima, setCalcUangDiterima] = useState('');

  // Subtotal preview calculation
  const parsedHarga = parseRupiah(hargaProduk);
  const parsedQty = Math.max(1, parseInt(jumlahQty, 10) || 1);
  const draftTotal = parsedHarga * parsedQty;
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.total || item.harga * item.cup), 0);
  const currentPreviewSubtotal = cartTotal > 0 ? cartTotal : draftTotal;

  // Add single product from form to cart
  const handleAddProductToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nama = namaProduk.trim();
    if (!nama || parsedHarga <= 0 || parsedQty <= 0) {
      alert('Nama produk, harga, dan jumlah harus diisi dengan benar.');
      return;
    }

    const newItem: ProductItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      nama,
      harga: parsedHarga,
      cup: parsedQty, // Qty
      kategori,
      metode: metodeBayar,
      total: parsedHarga * parsedQty,
      qrisProofUrl: metodeBayar === 'QR' && qrisProofUrl ? qrisProofUrl : undefined,
    };

    setCartItems((prev) => {
      const next = [...prev, newItem];
      // Auto sync kalkulator tagihan jika masih kosong
      const nextTotal = next.reduce((sum, item) => sum + item.total, 0);
      setCalcTagihan(formatNumber(nextTotal));
      return next;
    });

    // Reset draft form for next item
    setNamaProduk('');
    setHargaProduk('');
    setJumlahQty('1');
    onQuickAlert(`"${nama}" dimasukkan ke keranjang belanja!`);
  };

  // Add product directly from Master Catalog click
  const handleAddFromCatalog = (prod: MasterProduct) => {
    const newItem: ProductItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      nama: prod.nama,
      harga: prod.harga,
      cup: 1,
      kategori: prod.kategori,
      metode: metodeBayar,
      total: prod.harga,
      masterProductId: prod.id,
    };

    setCartItems((prev) => {
      const next = [...prev, newItem];
      const nextTotal = next.reduce((sum, item) => sum + item.total, 0);
      setCalcTagihan(formatNumber(nextTotal));
      return next;
    });

    onQuickAlert(`"${prod.nama}" dimasukkan ke keranjang belanja!`);
  };

  const updateCartItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeCartItem(index);
      return;
    }

    setCartItems((prev) => {
      const copy = [...prev];
      const target = copy[index];
      copy[index] = {
        ...target,
        cup: newQty,
        total: target.harga * newQty,
      };
      const nextTotal = copy.reduce((sum, item) => sum + item.total, 0);
      setCalcTagihan(formatNumber(nextTotal));
      return copy;
    });
  };

  const removeCartItem = (index: number) => {
    setCartItems((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      const nextTotal = copy.reduce((sum, item) => sum + item.total, 0);
      setCalcTagihan(nextTotal > 0 ? formatNumber(nextTotal) : '');
      return copy;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCalcTagihan('');
    setCalcUangDiterima('');
    setQrisProofUrl(null);
  };

  // Handle QRIS Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file foto/gambar bukti transfer QRIS yang didukung.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setQrisProofUrl(base64);
      onQuickAlert('Foto bukti pembayaran QRIS berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  // Save all items as one order
  const handleSaveAllOrder = () => {
    let finalItems = [...cartItems];

    // If cart is empty, check if form has valid draft to save
    if (finalItems.length === 0) {
      const nama = namaProduk.trim();
      if (nama && parsedHarga > 0 && parsedQty > 0) {
        finalItems = [
          {
            id: Date.now(),
            nama,
            harga: parsedHarga,
            cup: parsedQty,
            kategori,
            metode: metodeBayar,
            total: parsedHarga * parsedQty,
            qrisProofUrl: metodeBayar === 'QR' && qrisProofUrl ? qrisProofUrl : undefined,
          },
        ];
        // Reset form
        setNamaProduk('');
        setHargaProduk('');
        setJumlahQty('1');
      } else {
        alert('Keranjang belanja masih kosong! Tambahkan Produk 1, Produk 2, Produk 3, lalu klik Simpan Semua.');
        return;
      }
    }

    const tagihan = parseRupiah(calcTagihan) || finalItems.reduce((sum, it) => sum + it.total, 0);
    const uangCash = parseRupiah(calcUangDiterima);
    const kembalian = Math.max(0, uangCash - tagihan);

    // Attach QRIS proof to items if payment is QR
    const enrichedItems = finalItems.map((it) => ({
      ...it,
      qrisProofUrl: it.metode === 'QR' && qrisProofUrl ? qrisProofUrl : it.qrisProofUrl,
    }));

    onSaveOrder(enrichedItems, {
      cashDiterima: uangCash,
      kembalian,
      qrisProofUrl: qrisProofUrl || undefined,
      paymentMethod: metodeBayar,
    });

    clearCart();
    onQuickAlert('Transaksi berhasil disimpan! Struk pembelian siap dicetak.');
  };

  // Calculator logic
  const tagihanNum = parseRupiah(calcTagihan);
  const diterimaNum = parseRupiah(calcUangDiterima);
  const selisihKembalian = diterimaNum - tagihanNum;

  const handleSyncCalcWithSubtotal = () => {
    const val = cartTotal > 0 ? cartTotal : currentPreviewSubtotal;
    if (val > 0) {
      setCalcTagihan(formatNumber(val));
    }
  };

  const quickSetDiterima = (val: number | 'pas') => {
    if (val === 'pas') {
      setCalcUangDiterima(tagihanNum > 0 ? formatNumber(tagihanNum) : '');
    } else {
      setCalcUangDiterima(formatNumber(val));
    }
  };

  const filteredCatalog = masterProducts.filter((p) =>
    p.nama.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* CARD FORM INPUT PENJUALAN PRODUK & KERANJANG */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Header Form */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Input Penjualan Produk
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Search size={12} />
            <span>{showCatalog ? 'Tutup Katalog' : 'Pencarian Produk'}</span>
          </button>
        </div>

        {/* PENCARIAN & KATALOG PRODUK MASTER CEPAT */}
        {showCatalog && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Ketik untuk mencari produk master..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {filteredCatalog.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleAddFromCatalog(prod)}
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg text-left transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="truncate mr-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 truncate">
                      {prod.nama}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {formatRupiah(prod.harga)}
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                    <Plus size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input Manual */}
        <form onSubmit={handleAddProductToCart} className="space-y-3.5">
          {/* Kategori Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Kategori Produk
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`relative flex items-center justify-center p-2 rounded-xl border cursor-pointer transition select-none ${
                  kategori === 'minuman'
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="kategoriProduk"
                  value="minuman"
                  checked={kategori === 'minuman'}
                  onChange={() => setKategori('minuman')}
                  className="sr-only"
                />
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-mug-hot text-amber-500"></i> Minuman
                </span>
              </label>

              <label
                className={`relative flex items-center justify-center p-2 rounded-xl border cursor-pointer transition select-none ${
                  kategori === 'makanan'
                    ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="kategoriProduk"
                  value="makanan"
                  checked={kategori === 'makanan'}
                  onChange={() => setKategori('makanan')}
                  className="sr-only"
                />
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-utensils text-orange-500"></i> Makanan
                </span>
              </label>
            </div>
          </div>

          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              required
              value={namaProduk}
              onChange={(e) => setNamaProduk(e.target.value)}
              placeholder="Contoh: Kopi Susu, Toast, Kentang..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm transition outline-hidden"
            />
          </div>

          {/* Harga Satuan & Jumlah (Qty) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="text"
                required
                value={hargaProduk}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  setHargaProduk(val > 0 ? formatNumber(val) : '');
                }}
                placeholder="10.000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 transition outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Jumlah ({kategori === 'makanan' ? 'Pcs' : 'Cup'})
              </label>
              <input
                type="number"
                min="1"
                required
                value={jumlahQty}
                onChange={(e) => setJumlahQty(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 transition outline-hidden"
              />
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`relative flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition select-none ${
                  metodeBayar === 'CASH'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="metodeBayar"
                  value="CASH"
                  checked={metodeBayar === 'CASH'}
                  onChange={() => setMetodeBayar('CASH')}
                  className="sr-only"
                />
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-money-bill-wave"></i> CASH
                </span>
              </label>

              <label
                className={`relative flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition select-none ${
                  metodeBayar === 'QR'
                    ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="metodeBayar"
                  value="QR"
                  checked={metodeBayar === 'QR'}
                  onChange={() => setMetodeBayar('QR')}
                  className="sr-only"
                />
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-qrcode"></i> QRIS
                </span>
              </label>
            </div>
          </div>

          {/* UPLOAD FOTO BUKTI PEMBAYARAN QRIS */}
          {metodeBayar === 'QR' && (
            <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-900/60 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <Camera size={14} />
                  <span>Foto Bukti Transaksi QRIS</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={12} />
                  <span>{qrisProofUrl ? 'Ganti Foto' : 'Ambil / Upload Foto'}</span>
                </button>
              </div>

              {qrisProofUrl && (
                <div className="relative pt-1">
                  <img
                    src={qrisProofUrl}
                    alt="Bukti QRIS"
                    className="h-28 mx-auto rounded-lg border border-sky-300 dark:border-sky-800 object-contain shadow-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setQrisProofUrl(null)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full text-xs shadow-md"
                    title="Hapus foto"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview Subtotal Omset */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal Omset:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {formatRupiah(currentPreviewSubtotal)}
            </span>
          </div>

          {/* KERANJANG BELANJA (KRANJANG ORDER: Produk 1 -> 2 -> 3) */}
          {cartItems.length > 0 && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <ShoppingCart size={14} />
                  <span>Keranjang Order ({cartItems.length} Produk)</span>
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                >
                  Kosongkan
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-2 bg-white/90 dark:bg-slate-800/90 rounded-lg p-2 border border-indigo-100 dark:border-slate-700 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.nama}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatRupiah(item.harga)} · {item.metode}
                      </div>
                    </div>

                    {/* Qty Counter Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, item.cup - 1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.cup}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, item.cup + 1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-right min-w-[70px]">
                      {formatRupiah(item.total)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCartItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-indigo-200 dark:border-indigo-900/60 pt-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Keranjang</span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                  {formatRupiah(cartTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Tambah Produk & Simpan Semua */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="py-3 px-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 text-xs active:scale-[0.99] cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAllOrder}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-200 dark:shadow-none transition flex items-center justify-center gap-2 text-xs active:scale-[0.99] cursor-pointer"
            >
              <Check size={16} />
              <span>Simpan Semua</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Tambah Produk 1 → Produk 2 → Produk 3 → lalu klik <b>Simpan Semua</b>.
          </p>
        </form>
      </div>

      {/* WIDGET KALKULATOR KEMBALIAN KASIR */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-2.5">
          <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <Coins size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>Kalkulator Kembalian Kasir</span>
          </h2>
          <button
            type="button"
            onClick={handleSyncCalcWithSubtotal}
            className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            title="Salin nilai dari Subtotal Form atau Keranjang di atas"
          >
            <ArrowDown size={12} />
            <span>Ambil Subtotal</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Total Tagihan Belanja Input */}
          <div>
            <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
              Total Tagihan Belanja (Rp)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                Rp
              </span>
              <input
                type="text"
                placeholder="0"
                value={calcTagihan}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  setCalcTagihan(val > 0 ? formatNumber(val) : '');
                }}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Uang Tunai Diterima Input */}
          <div>
            <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
              Uang Tunai Diterima (Rp)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                Rp
              </span>
              <input
                type="text"
                placeholder="0"
                value={calcUangDiterima}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  setCalcUangDiterima(val > 0 ? formatNumber(val) : '');
                }}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Pilihan Cepat Nominal Cash */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Pilihan Cepat Nominal Cash:
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => quickSetDiterima('pas')}
                className="py-1 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => quickSetDiterima(10000)}
                className="py-1 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                10k
              </button>
              <button
                type="button"
                onClick={() => quickSetDiterima(20000)}
                className="py-1 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                20k
              </button>
              <button
                type="button"
                onClick={() => quickSetDiterima(50000)}
                className="py-1 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                50k
              </button>
              <button
                type="button"
                onClick={() => quickSetDiterima(100000)}
                className="py-1 px-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                100k
              </button>
            </div>
          </div>

          {/* Display Kembalian Box */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between transition-colors">
            <div>
              <span className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                {diterimaNum === 0 && tagihanNum === 0
                  ? 'Kembalian'
                  : selisihKembalian < 0
                  ? 'Kekurangan Uang'
                  : 'Uang Kembalian'}
              </span>
              <p
                className={`text-xl font-black tracking-tight ${
                  diterimaNum === 0 && tagihanNum === 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selisihKembalian < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : selisihKembalian === 0
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {diterimaNum === 0 && tagihanNum === 0
                  ? 'Rp0'
                  : formatRupiah(Math.abs(selisihKembalian))}
              </p>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                diterimaNum === 0 && tagihanNum === 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : selisihKembalian < 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : selisihKembalian === 0
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {diterimaNum === 0 && tagihanNum === 0
                ? 'Pas / Siap'
                : selisihKembalian < 0
                ? 'Kurang'
                : selisihKembalian === 0
                ? 'Uang Pas'
                : 'Kembalian'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
