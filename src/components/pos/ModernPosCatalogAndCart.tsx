import React, { useState, useMemo, useRef } from 'react';
import {
  MasterProduct,
  ProductItem,
  PaymentMethod,
  ShiftType,
} from '../../types/sales';
import {
  formatRupiah,
  formatNumber,
  parseRupiah,
} from '../../utils/salesHelpers';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Camera,
  Upload,
  ArrowRight,
  Check,
  Banknote,
  QrCode,
  Store,
  Clock,
} from 'lucide-react';

interface ModernPosCatalogAndCartProps {
  masterProducts: MasterProduct[];
  outletStocks: Record<string, number>; // prodId -> stock remaining
  activeOutletName: string;
  activeShift: ShiftType;
  onSwitchShift: (shift: ShiftType) => void;
  onSaveOrder: (
    items: ProductItem[],
    meta?: {
      cashDiterima?: number;
      kembalian?: number;
      qrisProofUrl?: string;
      paymentMethod?: PaymentMethod;
      notes?: string;
    }
  ) => void;
  onQuickAlert: (msg: string) => void;
}

export const ModernPosCatalogAndCart: React.FC<ModernPosCatalogAndCartProps> = ({
  masterProducts,
  outletStocks,
  activeOutletName,
  activeShift,
  onSwitchShift,
  onSaveOrder,
  onQuickAlert,
}) => {
  // Search & Filter Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart state: item -> { product: MasterProduct, qty: number }
  const [cart, setCart] = useState<
    {
      product: MasterProduct;
      qty: number;
    }[]
  >([]);

  // Payment & Calculator state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashDiterimaInput, setCashDiterimaInput] = useState('');
  const [notes, setNotes] = useState('');

  // QRIS Photo Proof State
  const [qrisProofUrl, setQrisProofUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available categories based on master products
  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', label: `Semua Menu (${masterProducts.length})` },
      { id: 'makanan', label: 'Menu Makanan' },
      { id: 'coffe', label: 'Varian Coffe' },
      { id: 'hokka', label: 'Bintang Hokka Drink' },
      { id: 'popice', label: 'Pop Ice (Rp 5.000)' },
      { id: 'soda', label: 'Soda Series' },
      { id: 'teh_jeruk', label: 'Teh & Jeruk' },
    ];
  }, [masterProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return masterProducts.filter((p) => {
      // 1. Text Search (name or SKU)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 2. Category Tab Filter
      if (selectedCategory === 'all') return true;

      const sub = (p.subKategori || '').toLowerCase();
      const kat = (p.kategori || '').toLowerCase();

      if (selectedCategory === 'makanan') {
        return kat === 'makanan' || sub.includes('makanan');
      }
      if (selectedCategory === 'coffe') {
        return sub.includes('coffee') || sub.includes('coffe') || p.nama.toLowerCase().includes('latte') || p.nama.toLowerCase().includes('roast');
      }
      if (selectedCategory === 'hokka') {
        return sub.includes('hokka') || (p.sku && p.sku.startsWith('HOK'));
      }
      if (selectedCategory === 'popice') {
        return sub.includes('pop ice') || p.nama.toLowerCase().startsWith('pop ice') || (p.sku && p.sku.startsWith('POP'));
      }
      if (selectedCategory === 'soda') {
        return sub.includes('soda') || (p.sku && p.sku.startsWith('SOD'));
      }
      if (selectedCategory === 'teh_jeruk') {
        return sub.includes('teh') || sub.includes('jeruk') || p.nama.toLowerCase().includes('teh') || p.nama.toLowerCase().includes('jeruk');
      }

      return true;
    });
  }, [masterProducts, searchQuery, selectedCategory]);

  // Cart Totals
  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const totalTagihan = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0);
  }, [cart]);

  // Calculator Numbers
  const parsedCash = parseRupiah(cashDiterimaInput);
  const selisihKembalian = parsedCash - totalTagihan;

  // Add product to cart
  const handleAddToCart = (product: MasterProduct) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      } else {
        return [...prev, { product, qty: 1 }];
      }
    });
    onQuickAlert(`+1 "${product.nama}" ditambahkan ke keranjang`);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: MasterProduct; qty: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCashDiterimaInput('');
    setNotes('');
    setQrisProofUrl(null);
  };

  // Quick cash buttons
  const handleQuickCash = (type: 'pas' | number) => {
    if (type === 'pas') {
      setCashDiterimaInput(totalTagihan > 0 ? formatNumber(totalTagihan) : '0');
    } else {
      setCashDiterimaInput(formatNumber(type));
    }
  };

  // Handle QRIS Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file foto bukti transfer QRIS yang didukung.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setQrisProofUrl(base64);
      onQuickAlert('Foto bukti pembayaran QRIS terunggah!');
    };
    reader.readAsDataURL(file);
  };

  // Process & Print Receipt
  const handleProcessOrder = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong! Klik produk di katalog untuk menambahkan pesanan.');
      return;
    }

    if (paymentMethod === 'CASH' && parsedCash > 0 && parsedCash < totalTagihan) {
      if (
        !window.confirm(
          `Uang tunai diterima (Rp${formatNumber(parsedCash)}) kurang dari total tagihan (Rp${formatNumber(totalTagihan)}). Tetap lanjutkan?`
        )
      ) {
        return;
      }
    }

    const orderItems: ProductItem[] = cart.map((c, idx) => ({
      id: Date.now() + idx,
      sku: c.product.sku,
      nama: c.product.nama,
      harga: c.product.harga,
      cup: c.qty,
      kategori: c.product.kategori,
      subKategori: c.product.subKategori,
      metode: paymentMethod,
      total: c.product.harga * c.qty,
      notes: notes.trim() || undefined,
      qrisProofUrl: paymentMethod === 'QR' && qrisProofUrl ? qrisProofUrl : undefined,
      masterProductId: c.product.id,
    }));

    const kembalianFinal = Math.max(0, parsedCash - totalTagihan);

    onSaveOrder(orderItems, {
      cashDiterima: paymentMethod === 'CASH' ? parsedCash : totalTagihan,
      kembalian: paymentMethod === 'CASH' ? kembalianFinal : 0,
      qrisProofUrl: qrisProofUrl || undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    handleClearCart();
    onQuickAlert('Pesanan berhasil diproses & struk pembelian siap dicetak!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-100 font-sans">
      {/* LEFT SECTION (CATALOG GRID & SEARCH): 8 Cols */}
      <div className="lg:col-span-8 space-y-4">
        {/* TOP SEARCH & BADGES BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk berdasarkan nama atau SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Badges: Outlet & Shift */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Outlet Badge */}
            <div
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 flex items-center gap-2 shadow-xs"
              title="Outlet Aktif"
            >
              <Store size={13} className="text-indigo-400" />
              <span>{activeOutletName}</span>
            </div>

            {/* Shift Badge (Clickable to switch shift) */}
            <button
              type="button"
              onClick={() => onSwitchShift(activeShift === 'pagi' ? 'sore' : 'pagi')}
              className="px-3.5 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 shadow-xs hover:bg-amber-900/40 transition cursor-pointer"
              title="Klik untuk ganti shift"
            >
              <Clock size={13} />
              <span>SHIFT {activeShift.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER TABS (Smooth draggable & touch scrollable) */}
        <div
          className="flex items-center gap-2 scroll-touch-x pb-2 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            const el = e.currentTarget;
            let startX = e.pageX - el.offsetLeft;
            let scrollLeft = el.scrollLeft;
            const onMouseMove = (moveEvent: MouseEvent) => {
              const x = moveEvent.pageX - el.offsetLeft;
              const walk = (x - startX) * 1.5;
              el.scrollLeft = scrollLeft - walk;
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        >
          {categoryFilters.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/90 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PRODUCT CARDS GRID (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((p) => {
            const remainingStock = outletStocks[p.id] ?? 34;
            const isOutOfStock = remainingStock <= 0;

            // Subcategory display text
            const subText =
              p.subKategori ||
              (p.kategori === 'makanan' ? 'Snack & Makanan' : 'Minuman Kopi');

            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && handleAddToCart(p)}
                className={`bg-slate-900/90 border rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between group select-none ${
                  isOutOfStock
                    ? 'border-slate-800/60 opacity-60 cursor-not-allowed'
                    : 'border-slate-800/90 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/50 cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Top Row: SKU & Sisa Stok */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
                    {p.sku || 'PROD'}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      remainingStock <= 5
                        ? 'bg-rose-950/60 text-rose-300 border-rose-900/60'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    Sisa: {remainingStock}
                  </span>
                </div>

                {/* Middle: Title & Subcategory */}
                <div className="mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition">
                    {p.nama}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {subText}
                  </p>
                </div>

                {/* Bottom Row: Price & Add Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm sm:text-base font-black text-indigo-400 tracking-tight">
                    {formatRupiah(p.harga)}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) handleAddToCart(p);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition shadow-xs cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-600'
                        : 'bg-slate-800/90 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white border border-slate-700/70 group-hover:border-indigo-500'
                    }`}
                    title="Tambah ke keranjang"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Catalog State */}
        {filteredProducts.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Search size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="font-bold text-sm text-slate-300">
              Tidak ada produk yang cocok dengan pencarian "{searchQuery}"
            </p>
            <p className="text-xs text-slate-500">
              Coba gunakan kata kunci lain atau pilih tab Semua Produk.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: KERANJANG TRANSAKSI (4 Cols) */}
      <div className="lg:col-span-4">
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-5 sticky top-20">
          {/* Header Cart */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight leading-none">
                  Keranjang Transaksi
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {totalItemCount} Item dipilih
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40 transition"
              >
                Reset
              </button>
            )}
          </div>

          {/* Cart Body: Empty or List */}
          <div className="min-h-[160px] flex flex-col justify-center">
            {cart.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <ShoppingCart
                  size={44}
                  className="mx-auto text-slate-700 stroke-1"
                />
                <h4 className="text-sm font-semibold text-slate-300">
                  Keranjang masih kosong
                </h4>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                  Klik produk di katalog untuk menambahkan pesanan.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-xs font-bold text-white truncate">
                        {product.nama}
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        {formatRupiah(product.harga)}
                      </div>
                    </div>

                    {/* Qty +/- Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product.id, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center text-xs font-extrabold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product.id, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="text-xs font-black text-indigo-400 min-w-[70px] text-right">
                      {formatRupiah(product.harga * qty)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtotal & Total Tagihan Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Subtotal ({totalItemCount} Item)</span>
              <span className="font-semibold">{formatRupiah(totalTagihan)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="text-sm font-bold text-white">Total Tagihan</span>
              <span className="text-lg font-black text-indigo-400">
                {formatRupiah(totalTagihan)}
              </span>
            </div>
          </div>

          {/* METODE PEMBAYARAN */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              METODE PEMBAYARAN
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Banknote size={15} />
                <span>CASH (Tunai)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QR')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'QR'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode size={15} />
                <span>QRIS (Nontunai)</span>
              </button>
            </div>

            {/* UPLOAD FOTO BUKTI QRIS (If QR is selected) */}
            {paymentMethod === 'QR' && (
              <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Camera size={13} />
                    <span>Upload Foto QRIS</span>
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
                    <span>{qrisProofUrl ? 'Ganti Foto' : 'Ambil / Upload'}</span>
                  </button>
                </div>

                {qrisProofUrl && (
                  <div className="relative pt-1 text-center">
                    <img
                      src={qrisProofUrl}
                      alt="Bukti QRIS"
                      className="max-h-24 mx-auto rounded-lg border border-sky-700 object-contain shadow-sm bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setQrisProofUrl(null)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-xs shadow-md"
                      title="Hapus foto"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* UANG TUNAI DITERIMA (RP) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              UANG TUNAI DITERIMA (RP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                Rp
              </span>
              <input
                type="text"
                placeholder="0"
                value={cashDiterimaInput}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  setCashDiterimaInput(val > 0 ? formatNumber(val) : '');
                }}
                className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick buttons: Uang Pas, 20k, 50k, 100k */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickCash('pas')}
                className="py-1 px-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 transition text-center cursor-pointer"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(20000)}
                className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-bold text-slate-300 transition text-center cursor-pointer"
              >
                20k
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(50000)}
                className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-bold text-slate-300 transition text-center cursor-pointer"
              >
                50k
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(100000)}
                className="py-1 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-bold text-slate-300 transition text-center cursor-pointer"
              >
                100k
              </button>
            </div>

            {/* Kembalian Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400">
                Kembalian:
              </span>
              <span
                className={`text-base font-black ${
                  parsedCash === 0
                    ? 'text-emerald-400'
                    : selisihKembalian < 0
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {parsedCash === 0
                  ? 'Rp0'
                  : formatRupiah(Math.abs(selisihKembalian))}
              </span>
            </div>
          </div>

          {/* CATATAN TAMBAHAN (OPSIONAL) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Meja 4 / less ice / take away..."
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* BIG SUBMIT BUTTON */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleProcessOrder}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 select-none ${
              cart.length === 0
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 cursor-pointer active:scale-[0.98]'
            }`}
          >
            <span>PROSES &amp; CETAK STRUK</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
