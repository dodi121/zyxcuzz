import React, { useState, useMemo, useRef } from 'react';
import {
  AppState,
  ShiftType,
  MasterProduct,
  ProductCategory,
  BusinessConfig,
  OutletInfo,
} from '../../types/sales';
import {
  formatRupiah,
  formatNumber,
  parseRupiah,
  calculateProfitMetrics,
  generateRekapanCSV,
  downloadCSVFile,
  generateRekapanTXT,
  generateOutletSummaryText,
  downloadTXTFile,
  DEFAULT_MASTER_PRODUCTS,
} from '../../utils/salesHelpers';
import {
  BarChart3,
  TrendingUp,
  Package,
  Boxes,
  FileSpreadsheet,
  Store,
  Settings,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Search,
  Download,
  Printer,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { supabaseSync, CloudSyncStatus } from '../../services/supabase';

interface AdminPanelProps {
  appState: AppState;
  onClose: () => void;
  onLogout: () => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  cloudStatus: { status: CloudSyncStatus; message: string };
  onShowToast: (msg: string) => void;
}

type AdminTab =
  | 'dashboard'
  | 'master_products'
  | 'stock_inventory'
  | 'recap_reports'
  | 'outlet_management'
  | 'business_branding'
  | 'settings_supabase';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appState,
  onClose,
  onLogout,
  onUpdateState,
  cloudStatus,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Business Branding State (Supports Global OR Per-Outlet Customization)
  const [brandingTargetOutlet, setBrandingTargetOutlet] = useState<string>('global'); // 'global' or outletKey

  const currentBiz = appState.businessConfig || {
    businessName: 'Kopi Nusantara & Kitchen',
    tagline: 'Authentic Coffee & Snacks',
    address: 'Jl. Merdeka No. 45, Kota Pusat',
    phone: '0812-3456-7890',
    logoUrl: '',
    footerText: 'Terima kasih atas kunjungan Anda! Simpan struk ini sebagai bukti pembayaran sah.',
  };
  const [bizName, setBizName] = useState(currentBiz.businessName || '');
  const [bizTagline, setBizTagline] = useState(currentBiz.tagline || '');
  const [bizAddress, setBizAddress] = useState(currentBiz.address || '');
  const [bizPhone, setBizPhone] = useState(currentBiz.phone || '');
  const [bizFooter, setBizFooter] = useState(currentBiz.footerText || '');
  const [bizLogoUrl, setBizLogoUrl] = useState(currentBiz.logoUrl || '');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync form inputs when branding target changes
  const handleSelectBrandingTarget = (target: string) => {
    setBrandingTargetOutlet(target);
    if (target === 'global') {
      const g = appState.businessConfig || currentBiz;
      setBizName(g.businessName || '');
      setBizTagline(g.tagline || '');
      setBizAddress(g.address || '');
      setBizPhone(g.phone || '');
      setBizFooter(g.footerText || '');
      setBizLogoUrl(g.logoUrl || '');
    } else {
      const o = appState.outlets[target];
      setBizName(o?.receiptHeader || o?.name || appState.businessConfig?.businessName || '');
      setBizTagline(o?.tagline || appState.businessConfig?.tagline || '');
      setBizAddress(o?.address || appState.businessConfig?.address || '');
      setBizPhone(o?.phone || appState.businessConfig?.phone || '');
      setBizFooter(o?.footerText || appState.businessConfig?.footerText || '');
      setBizLogoUrl(o?.logoUrl || appState.businessConfig?.logoUrl || '');
    }
  };

  // Master Products State
  const [productSearch, setProductSearch] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdHarga, setNewProdHarga] = useState('');
  const [newProdKat, setNewProdKat] = useState<ProductCategory>('minuman');

  // Stock Inventory State
  const [selectedStockOutlet, setSelectedStockOutlet] = useState<string>(
    appState.activeOutlet || Object.keys(appState.outlets)[0] || 'nusama'
  );
  const [stockSearch, setStockSearch] = useState('');

  // Recap Filter State
  const [recapFilterOutlet, setRecapFilterOutlet] = useState('all');

  // Outlet Management State
  const [newOutletName, setNewOutletName] = useState('');

  // Supabase & Security Settings State
  const currentSupabaseConfig = supabaseSync.getConfig();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(currentSupabaseConfig.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(currentSupabaseConfig.anonKey);
  const [newAdminPin, setNewAdminPin] = useState('');

  // Reset confirmation state
  const [resetShiftTarget, setResetShiftTarget] = useState<'current_shift' | 'all_shifts'>('current_shift');
  const [confirmResetText, setConfirmResetText] = useState('');

  // 1. Calculate Profit Metrics (Daily, Weekly, Monthly)
  const metrics = useMemo(() => calculateProfitMetrics(appState), [appState]);

  // 2. Aggregate sales for charts
  const salesSummary = useMemo(() => {
    let cashTotal = 0;
    let qrTotal = 0;
    const outletOmsetMap: Record<string, number> = {};
    const productSoldMap: Record<string, { qty: number; omset: number; kat: string }> = {};

    Object.keys(appState.outlets).forEach((key) => {
      outletOmsetMap[key] = 0;
    });

    Object.entries(appState.data || {}).forEach(([oKey, oData]) => {
      (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
        const s = oData[shift];
        if (!s) return;
        (s.produkList || []).forEach((p) => {
          const qty = Math.max(1, p.cup || 1);
          const total = p.total || p.harga * qty;
          const metode = (p.metode || 'CASH').toUpperCase();

          if (metode === 'QR' || metode === 'QRIS') {
            qrTotal += total;
          } else {
            cashTotal += total;
          }

          outletOmsetMap[oKey] = (outletOmsetMap[oKey] || 0) + total;

          const pName = p.nama.trim();
          if (!productSoldMap[pName]) {
            productSoldMap[pName] = { qty: 0, omset: 0, kat: p.kategori };
          }
          productSoldMap[pName].qty += qty;
          productSoldMap[pName].omset += total;
        });
      });
    });

    const topProducts = Object.entries(productSoldMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    return {
      cashTotal,
      qrTotal,
      totalOmset: cashTotal + qrTotal,
      outletOmsetMap,
      topProducts,
    };
  }, [appState]);

  // Master Products filtered
  const masterProducts = appState.masterProducts || [];
  const filteredMasterProducts = masterProducts.filter((p) =>
    p.nama.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Add Master Product
  const handleAddMasterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const nama = newProdName.trim();
    const harga = parseRupiah(newProdHarga);

    if (!nama || harga <= 0) {
      alert('Nama produk dan harga jual harus diisi dengan benar.');
      return;
    }

    const newProd: MasterProduct = {
      id: 'prod_' + Date.now(),
      nama,
      harga,
      kategori: newProdKat,
    };

    onUpdateState((prev) => {
      const currentList = prev.masterProducts || [];
      const updatedList = [...currentList, newProd];

      // Auto inisialisasi stok 50 di setiap outlet
      const updatedStocks = { ...(prev.outletStocks || {}) };
      Object.keys(prev.outlets).forEach((oKey) => {
        if (!updatedStocks[oKey]) updatedStocks[oKey] = {};
        updatedStocks[oKey][newProd.id] = 50;
      });

      return {
        ...prev,
        masterProducts: updatedList,
        outletStocks: updatedStocks,
      };
    });

    setNewProdName('');
    setNewProdHarga('');
    onShowToast(`Produk "${nama}" berhasil ditambahkan ke katalog master!`);
  };

  // Delete Master Product
  const handleDeleteMasterProduct = (id: string, name: string) => {
    if (!window.confirm(`Hapus produk "${name}" dari katalog master?`)) return;

    onUpdateState((prev) => ({
      ...prev,
      masterProducts: (prev.masterProducts || []).filter((p) => p.id !== id),
    }));
    onShowToast(`Produk "${name}" dihapus dari katalog master.`);
  };

  // Muat / Reset ke Menu Bintang Hokka Drink Lengkap
  const handleResetToBintangMenu = () => {
    if (
      !window.confirm(
        'Ganti dan muat seluruh katalog produk dengan Menu Bintang Hokka Drink (Makanan, Coffe, Hokka Drink, Soda, dan Pop Ice)?'
      )
    ) {
      return;
    }

    onUpdateState((prev) => {
      // Inisialisasi stok 50 untuk setiap produk baru di semua outlet
      const updatedStocks = { ...(prev.outletStocks || {}) };
      Object.keys(prev.outlets).forEach((oKey) => {
        if (!updatedStocks[oKey]) updatedStocks[oKey] = {};
        DEFAULT_MASTER_PRODUCTS.forEach((prod) => {
          if (updatedStocks[oKey][prod.id] === undefined) {
            updatedStocks[oKey][prod.id] = 50;
          }
        });
      });

      return {
        ...prev,
        masterProducts: DEFAULT_MASTER_PRODUCTS,
        outletStocks: updatedStocks,
      };
    });

    onShowToast('✓ Seluruh Menu Bintang Hokka Drink berhasil dimuat ke katalog master!');
  };

  // Restok Barang Sisa Per Outlet
  const handleAddStock = (prodId: string, addQty: number) => {
    onUpdateState((prev) => {
      const currentStocks = { ...(prev.outletStocks || {}) };
      if (!currentStocks[selectedStockOutlet]) {
        currentStocks[selectedStockOutlet] = {};
      }
      const existing = currentStocks[selectedStockOutlet][prodId] ?? 0;
      const updatedQty = Math.max(0, existing + addQty);
      currentStocks[selectedStockOutlet][prodId] = updatedQty;

      return {
        ...prev,
        outletStocks: currentStocks,
      };
    });
    onShowToast(`Stok berhasil ditambahkan (+${addQty})!`);
  };

  const handleSetStockDirect = (prodId: string, directQty: number) => {
    onUpdateState((prev) => {
      const currentStocks = { ...(prev.outletStocks || {}) };
      if (!currentStocks[selectedStockOutlet]) {
        currentStocks[selectedStockOutlet] = {};
      }
      currentStocks[selectedStockOutlet][prodId] = Math.max(0, directQty);

      return {
        ...prev,
        outletStocks: currentStocks,
      };
    });
  };

  // Tambah Outlet Baru
  const handleAddOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newOutletName.trim();
    if (!name) return;

    const existing = Object.keys(appState.outlets).find(
      (k) => appState.outlets[k]?.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      alert(`Outlet dengan nama "${name}" sudah ada.`);
      return;
    }

    const newKey = 'outlet_' + Date.now();

    onUpdateState((prev) => {
      // Siapkan default stok untuk outlet baru ini
      const updatedStocks = { ...(prev.outletStocks || {}) };
      updatedStocks[newKey] = {};
      (prev.masterProducts || []).forEach((p) => {
        updatedStocks[newKey][p.id] = 40;
      });

      return {
        ...prev,
        outlets: {
          ...prev.outlets,
          [newKey]: { name },
        },
        data: {
          ...prev.data,
          [newKey]: {
            activeShift: 'pagi',
            pagi: {
              modalAwal: 500000,
              cupAwal: 80,
              cupTerjualManual: null,
              cashAktual: 0,
              produkList: [],
              pengeluaranList: [],
              gratisList: [],
            },
            sore: {
              modalAwal: 500000,
              cupAwal: 80,
              cupTerjualManual: null,
              cashAktual: 0,
              produkList: [],
              pengeluaranList: [],
              gratisList: [],
            },
          },
        },
        outletStocks: updatedStocks,
      };
    });

    setNewOutletName('');
    onShowToast(`Outlet baru "${name}" berhasil ditambahkan & tersimpan permanen!`);
  };

  // Hapus Outlet
  const handleDeleteOutlet = (key: string, name: string) => {
    const keys = Object.keys(appState.outlets);
    if (keys.length <= 1) {
      alert('Tidak dapat menghapus outlet terakhir!');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus ${name}? Semua data shift outlet ini akan dihapus.`)) {
      return;
    }

    onUpdateState((prev) => {
      const nextOutlets = { ...prev.outlets };
      delete nextOutlets[key];
      const nextData = { ...prev.data };
      delete nextData[key];
      const nextStocks = { ...(prev.outletStocks || {}) };
      delete nextStocks[key];

      const remainingKeys = Object.keys(nextOutlets);
      const activeOutlet = prev.activeOutlet === key ? remainingKeys[0] : prev.activeOutlet;

      return {
        ...prev,
        activeOutlet,
        outlets: nextOutlets,
        data: nextData,
        outletStocks: nextStocks,
      };
    });

    onShowToast(`Outlet "${name}" berhasil dihapus.`);
  };

  // Simpan Pengaturan Supabase
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseSync.saveConfig({
      url: supabaseUrlInput.trim(),
      anonKey: supabaseKeyInput.trim(),
    });
    onShowToast('Pengaturan Supabase berhasil disimpan! Menyambung ulang...');
  };

  // Simpan PIN Admin Baru
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPin.trim().length < 4) {
      alert('PIN minimal 4 karakter!');
      return;
    }

    onUpdateState((prev) => ({
      ...prev,
      adminPin: newAdminPin.trim(),
    }));
    setNewAdminPin('');
    onShowToast('PIN Admin berhasil diperbarui!');
  };

  // Reset Data Shift dari Halaman Admin (Proteksi Penuh)
  const handleExecuteAdminReset = () => {
    if (confirmResetText.trim().toUpperCase() !== 'RESET') {
      alert('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi.');
      return;
    }

    onUpdateState((prev) => {
      const nextData = { ...prev.data };

      if (resetShiftTarget === 'current_shift') {
        const oKey = prev.activeOutlet;
        if (nextData[oKey]) {
          const shift = nextData[oKey].activeShift;
          nextData[oKey] = {
            ...nextData[oKey],
            [shift]: {
              modalAwal: 500000,
              cupAwal: 80,
              cupTerjualManual: null,
              cashAktual: 0,
              produkList: [],
              pengeluaranList: [],
              gratisList: [],
            },
          };
        }
      } else {
        // Reset all shifts on active outlet
        const oKey = prev.activeOutlet;
        if (nextData[oKey]) {
          nextData[oKey] = {
            activeShift: 'pagi',
            pagi: { modalAwal: 500000, cupAwal: 80, cupTerjualManual: null, cashAktual: 0, produkList: [], pengeluaranList: [], gratisList: [] },
            sore: { modalAwal: 500000, cupAwal: 80, cupTerjualManual: null, cashAktual: 0, produkList: [], pengeluaranList: [], gratisList: [] },
          };
        }
      }

      return {
        ...prev,
        data: nextData,
      };
    });

    setConfirmResetText('');
    onShowToast('Data transaksi berhasil di-reset oleh Admin.');
  };

  // Unduh CSV
  const handleDownloadCSV = () => {
    const csvContent = generateRekapanCSV(appState, recapFilterOutlet);
    const filename = `Rekapan_Penjualan_${recapFilterOutlet}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSVFile(filename, csvContent);
    onShowToast('File CSV berhasil diunduh!');
  };

  // Unduh TXT Shift Aktif
  const handleDownloadTXT = () => {
    const activeData = appState.data[appState.activeOutlet];
    if (!activeData) return;
    const shift = activeData.activeShift;
    const txtContent = generateRekapanTXT(
      activeData[shift],
      appState.outlets[appState.activeOutlet]?.name || 'Outlet',
      shift
    );
    const filename = `Rekapan_${shift}_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTXTFile(filename, txtContent);
    onShowToast('File ringkasan TXT berhasil diunduh!');
  };

  // Unduh TXT Rekap Per Outlet Terpisah (Semua shift di outlet terpilih)
  const handleDownloadOutletRecapTXT = (outletKey: string) => {
    const outletName = appState.outlets[outletKey]?.name || outletKey;
    const txtContent = generateOutletSummaryText(appState, outletKey);
    const safeOutlet = outletName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
    const filename = `Rekapan_Outlet_${safeOutlet}_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTXTFile(filename, txtContent);
    onShowToast(`Rekapan terpisah untuk ${outletName} berhasil diunduh!`);
  };

  // Handle Logo Upload (Compress to base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 300;
        const maxH = 150;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/png');
          setBizLogoUrl(compressed);
          onShowToast('Foto logo berhasil dipilih! Jangan lupa klik Simpan.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Simpan Konfigurasi Usaha & Logo Struk (Global atau Per-Outlet)
  const handleSaveBusinessConfig = (e: React.FormEvent) => {
    e.preventDefault();

    if (brandingTargetOutlet === 'global') {
      const updatedConfig: BusinessConfig = {
        businessName: bizName.trim() || 'Kopi Nusantara & Kitchen',
        tagline: bizTagline.trim(),
        address: bizAddress.trim(),
        phone: bizPhone.trim(),
        logoUrl: bizLogoUrl.trim(),
        footerText: bizFooter.trim() || 'Terima kasih atas kunjungan Anda!',
      };

      onUpdateState((prev) => ({
        ...prev,
        businessConfig: updatedConfig,
      }));

      onShowToast('Pengaturan struk global (seluruh cabang) berhasil disimpan!');
    } else {
      // Save specifically for this outlet
      const outletKey = brandingTargetOutlet;
      const targetName = appState.outlets[outletKey]?.name || outletKey;

      onUpdateState((prev) => {
        const currentOutlet = prev.outlets[outletKey] || { name: targetName };
        const updatedOutlet: OutletInfo = {
          ...currentOutlet,
          receiptHeader: bizName.trim(),
          tagline: bizTagline.trim(),
          address: bizAddress.trim(),
          phone: bizPhone.trim(),
          footerText: bizFooter.trim(),
          logoUrl: bizLogoUrl.trim(),
        };

        return {
          ...prev,
          outlets: {
            ...prev.outlets,
            [outletKey]: updatedOutlet,
          },
        };
      });

      onShowToast(`Pengaturan struk khusus "${targetName}" berhasil disimpan!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-md flex flex-col no-print">
      {/* Top Navbar Admin */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Admin Control Panel
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                Private Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Laporan Keuangan · Profit Margin · Stok Sisa Barang · Master Produk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">Kembali ke Kasir POS</span>
            <span className="sm:hidden">Kasir POS</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            title="Keluar dari mode admin"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs (Smooth draggable & touch scrollable) */}
        <div
          className="flex items-center gap-1.5 scroll-touch-x pb-2 border-b border-slate-800 text-xs font-bold select-none cursor-grab active:cursor-grabbing"
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
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp size={16} />
            <span>Dashboard &amp; Profit</span>
          </button>

          <button
            onClick={() => setActiveTab('master_products')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'master_products'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package size={16} />
            <span>Master Produk</span>
          </button>

          <button
            onClick={() => setActiveTab('stock_inventory')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'stock_inventory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Boxes size={16} />
            <span>Stok Sisa Barang Per Outlet</span>
          </button>

          <button
            onClick={() => setActiveTab('recap_reports')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'recap_reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Rekapan &amp; Unduh</span>
          </button>

          <button
            onClick={() => setActiveTab('outlet_management')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'outlet_management'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Store size={16} />
            <span>Kelola Outlet</span>
          </button>

          <button
            onClick={() => setActiveTab('business_branding')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'business_branding'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon size={16} />
            <span>Nama Usaha &amp; Logo Struk</span>
          </button>

          <button
            onClick={() => setActiveTab('settings_supabase')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings_supabase'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings size={16} />
            <span>Supabase &amp; Reset Data</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD & PROFIT (DAILY, WEEKLY, MONTHLY) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards: Daily, Weekly, Monthly Profit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Daily Profit Card */}
              <div className="bg-gradient-to-br from-indigo-900/60 via-slate-800/80 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Daily Profit (Hari Ini)
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                    HARI INI
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {formatRupiah(metrics.daily.profit)}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span>Omset: {formatRupiah(metrics.daily.omset)}</span>
                  <span>Belanja: {formatRupiah(metrics.daily.expense)}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {metrics.daily.ordersCount} Transaksi · {metrics.daily.itemsCount} Item Terjual
                </div>
              </div>

              {/* Weekly Profit Card */}
              <div className="bg-gradient-to-br from-emerald-900/60 via-slate-800/80 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Weekly Profit (Minggu Ini)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    7 HARI
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {formatRupiah(metrics.weekly.profit)}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span>Omset: {formatRupiah(metrics.weekly.omset)}</span>
                  <span>Belanja: {formatRupiah(metrics.weekly.expense)}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {metrics.weekly.ordersCount} Transaksi · {metrics.weekly.itemsCount} Item Terjual
                </div>
              </div>

              {/* Monthly Profit Card */}
              <div className="bg-gradient-to-br from-purple-900/60 via-slate-800/80 to-slate-900 p-5 rounded-2xl border border-purple-500/30 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Monthly Profit (Bulan Ini)
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold">
                    30 HARI
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {formatRupiah(metrics.monthly.profit)}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span>Omset: {formatRupiah(metrics.monthly.omset)}</span>
                  <span>Belanja: {formatRupiah(metrics.monthly.expense)}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {metrics.monthly.ordersCount} Transaksi · {metrics.monthly.itemsCount} Item Terjual
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: Omset Per Outlet Comparison */}
              <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-indigo-400" size={18} />
                    <h3 className="text-sm font-bold">Perbandingan Omset Antar Outlet</h3>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400">
                    Total: {formatRupiah(salesSummary.totalOmset)}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {Object.entries(appState.outlets).map(([oKey, outlet]) => {
                    const omset = salesSummary.outletOmsetMap[oKey] || 0;
                    const percent =
                      salesSummary.totalOmset > 0
                        ? Math.round((omset / salesSummary.totalOmset) * 100)
                        : 0;

                    return (
                      <div key={oKey} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-200">{outlet.name}</span>
                          <span className="text-indigo-300 font-bold">
                            {formatRupiah(omset)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Metode Pembayaran (Cash vs QRIS) */}
              <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="text-emerald-400" size={18} />
                    <h3 className="text-sm font-bold">Metode Pembayaran (Cash vs QRIS)</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 text-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      TUNAI / CASH
                    </span>
                    <div className="text-xl font-extrabold mt-1 text-white">
                      {formatRupiah(salesSummary.cashTotal)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {salesSummary.totalOmset > 0
                        ? `${Math.round((salesSummary.cashTotal / salesSummary.totalOmset) * 100)}% dari total`
                        : '0%'}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 text-center">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                      QR / QRIS
                    </span>
                    <div className="text-xl font-extrabold mt-1 text-white">
                      {formatRupiah(salesSummary.qrTotal)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {salesSummary.totalOmset > 0
                        ? `${Math.round((salesSummary.qrTotal / salesSummary.totalOmset) * 100)}% dari total`
                        : '0%'}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-1 pt-2">
                  <div className="w-full h-4 bg-slate-700 rounded-full flex overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          salesSummary.totalOmset > 0
                            ? (salesSummary.cashTotal / salesSummary.totalOmset) * 100
                            : 50
                        }%`,
                      }}
                      title="Tunai / Cash"
                    ></div>
                    <div
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          salesSummary.totalOmset > 0
                            ? (salesSummary.qrTotal / salesSummary.totalOmset) * 100
                            : 50
                        }%`,
                      }}
                      title="QR / QRIS"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Cash (Tunai di Laci)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                      QRIS (Transfer / Bank)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart 3: Top Produk Terlaris */}
              <div className="lg:col-span-12 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-amber-400" size={18} />
                    <h3 className="text-sm font-bold">Produk Terlaris Shift Berjalan</h3>
                  </div>
                </div>

                {salesSummary.topProducts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Belum ada produk yang terjual pada shift saat ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {salesSummary.topProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-400/30">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {p.kat === 'makanan' ? 'Makanan' : 'Minuman'} · {formatRupiah(p.omset)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-black bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2 py-1 rounded-lg">
                          {p.qty} Item
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MASTER PRODUK & PENCARIAN */}
        {activeTab === 'master_products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Form Tambah Master Produk */}
            <div className="lg:col-span-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                <Plus className="text-indigo-400" size={18} />
                <h3 className="text-sm font-bold">Tambah Produk Master Baru</h3>
              </div>

              <form onSubmit={handleAddMasterProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Produk
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProdKat('minuman')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                        newProdKat === 'minuman'
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-mug-hot"></i> Minuman
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdKat('makanan')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                        newProdKat === 'makanan'
                          ? 'bg-amber-600 border-amber-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-utensils"></i> Makanan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Contoh: Kopi Susu Aren, Toast Nutella..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdHarga}
                    onChange={(e) => {
                      const val = parseRupiah(e.target.value);
                      setNewProdHarga(val > 0 ? formatNumber(val) : '');
                    }}
                    placeholder="18.000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-2"
                >
                  <Plus size={16} />
                  <span>Simpan Produk ke Katalog</span>
                </button>
              </form>
            </div>

            {/* List Master Produk & Search */}
            <div className="lg:col-span-8 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-bold">Katalog Master Produk ({masterProducts.length} Produk)</h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetToBintangMenu}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Muat ulang seluruh menu Bintang Hokka Drink (Makanan, Coffe, Soda, Pop Ice)"
                  >
                    <RefreshCw size={13} />
                    <span>Muat Menu Bintang Hokka Drink</span>
                  </button>

                  {/* Pencarian Produk */}
                  <div className="relative w-full sm:w-56">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Cari nama produk..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Harga Jual</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredMasterProducts.map((p, idx) => {
                      return (
                        <tr key={p.id} className="hover:bg-slate-700/40 transition">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{p.nama}</td>
                          <td className="py-2.5 px-3">
                            {p.kategori === 'makanan' ? (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                Makanan
                              </span>
                            ) : (
                              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                Minuman
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-indigo-300">
                            {formatRupiah(p.harga)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteMasterProduct(p.id, p.nama)}
                              className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                              title="Hapus produk"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESTOK SISA BARANG PER OUTLET */}
        {activeTab === 'stock_inventory' && (
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Boxes className="text-indigo-400" size={18} />
                  <span>Stok Fisik Sisa Barang Per Outlet (Bukan Stok Cup)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola sisa stok fisik barang per outlet. Setiap transaksi penjualan kasir otomatis mengurangi sisa barang ini.
                </p>
              </div>

              {/* Selector Outlet */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Pilih Outlet:</span>
                <select
                  value={selectedStockOutlet}
                  onChange={(e) => setSelectedStockOutlet(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 outline-hidden cursor-pointer"
                >
                  {Object.entries(appState.outlets).map(([key, outlet]) => (
                    <option key={key} value={key}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Search Stok */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Cari barang untuk dicek stok..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Tabel Sisa Barang */}
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3.5">Nama Barang / Produk</th>
                    <th className="py-3 px-3.5">Kategori</th>
                    <th className="py-3 px-3.5 text-center">Sisa Stok Fisik</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Tambah Stok Masuk (Restok)</th>
                    <th className="py-3 px-3.5 text-center">Update Sisa Aktual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {masterProducts
                    .filter((p) => p.nama.toLowerCase().includes(stockSearch.toLowerCase()))
                    .map((p) => {
                      const outletStocks = appState.outletStocks?.[selectedStockOutlet] || {};
                      const stockQty = outletStocks[p.id] ?? 40;
                      const isCritical = stockQty <= 5;
                      const isMedium = stockQty > 5 && stockQty <= 15;

                      return (
                        <tr key={p.id} className="hover:bg-slate-700/40 transition">
                          <td className="py-3 px-3.5 font-bold text-white">
                            <div>{p.nama}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Harga: {formatRupiah(p.harga)}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            {p.kategori === 'makanan' ? (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                Makanan
                              </span>
                            ) : (
                              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                Minuman
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`text-base font-black px-3 py-1 rounded-xl inline-block ${
                                isCritical
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                  : isMedium
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {stockQty}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {isCritical ? (
                              <span className="text-[10px] font-bold text-rose-400 flex items-center justify-center gap-1">
                                <AlertTriangle size={12} /> Kritis
                              </span>
                            ) : isMedium ? (
                              <span className="text-[10px] font-bold text-amber-400">
                                Menipis
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} /> Tersedia
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAddStock(p.id, 5)}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddStock(p.id, 10)}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddStock(p.id, 25)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                              >
                                +25
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <input
                              type="number"
                              min="0"
                              value={stockQty}
                              onChange={(e) =>
                                handleSetStockDirect(p.id, parseInt(e.target.value, 10) || 0)
                              }
                              className="w-16 px-2 py-1 text-center bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REKAPAN & UNDUH */}
        {activeTab === 'recap_reports' && (
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FileSpreadsheet className="text-indigo-400" size={18} />
                  <span>Sistem Rekap Laporan Penjualan Pusat</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unduh rekapan omset dalam format CSV / Excel, teks ringkas, atau cetak laporan.
                </p>
              </div>

              {/* Action Buttons: Unduh CSV & TXT */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Unduh Rekapan (CSV / Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTXT}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Ringkasan TXT</span>
                </button>
              </div>
            </div>

            {/* Filter Outlet & Tombol Download Per-Outlet Terpisah */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Filter Tampilan Tabel:</span>
                <select
                  value={recapFilterOutlet}
                  onChange={(e) => setRecapFilterOutlet(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Outlet (Gabungan)</option>
                  {Object.entries(appState.outlets).map(([key, outlet]) => (
                    <option key={key} value={key}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>

              {recapFilterOutlet !== 'all' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadOutletRecapTXT(recapFilterOutlet)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Unduh Rekap {appState.outlets[recapFilterOutlet]?.name || 'Outlet Ini'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* KARTU REKAPAN TERPISAH PER OUTLET */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Store size={14} className="text-indigo-400" />
                  <span>Rekapan Per Outlet Terpisah (Shift Pagi + Shift Sore)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Data masing-masing cabang terisolasi dan tidak tercampur
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Object.entries(appState.outlets).map(([oKey, outlet]) => {
                  const oData = appState.data[oKey];
                  let outOmset = 0;
                  let outCash = 0;
                  let outQR = 0;
                  let outExpense = 0;
                  let outMinuman = 0;
                  let outMakanan = 0;
                  let outOrderCount = 0;

                  if (oData) {
                    (['pagi', 'sore'] as ShiftType[]).forEach((sKey) => {
                      const s = oData[sKey];
                      if (!s) return;
                      const orderIds = new Set<string>();
                      (s.produkList || []).forEach((p) => {
                        const qty = Math.max(1, p.cup || 1);
                        const sub = p.total || p.harga * qty;
                        outOmset += sub;
                        if (p.kategori === 'makanan') outMakanan += qty;
                        else outMinuman += qty;

                        const m = (p.metode || 'CASH').toUpperCase();
                        if (m === 'QR' || m === 'QRIS') outQR += sub;
                        else outCash += sub;

                        orderIds.add(p.orderId || `${p.orderNo}`);
                      });
                      outOrderCount += orderIds.size;
                      (s.pengeluaranList || []).forEach((e) => {
                        outExpense += e.nominal || 0;
                      });
                    });
                  }

                  const outNet = outOmset - outExpense;

                  return (
                    <div
                      key={oKey}
                      className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                            <span>{outlet.name}</span>
                          </h5>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
                            {outOrderCount} Order
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {outMinuman} Minuman | {outMakanan} Makanan
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total Omset</span>
                          <span className="font-black text-indigo-300 text-sm">
                            {formatRupiah(outOmset)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Biaya & Belanja</span>
                          <span className="font-bold text-rose-300">
                            {formatRupiah(outExpense)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Cash : QRIS</span>
                          <span className="font-mono text-[11px] text-slate-300">
                            {formatRupiah(outCash)} : {formatRupiah(outQR)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Omset Bersih</span>
                          <span className="font-black text-emerald-400">
                            {formatRupiah(outNet)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setRecapFilterOutlet(oKey);
                            onShowToast(`Tabel difilter ke ${outlet.name}`);
                          }}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer text-center"
                        >
                          Lihat Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadOutletRecapTXT(oKey)}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={`Unduh rekapan khusus ${outlet.name}`}
                        >
                          <Download size={13} />
                          <span>Unduh</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabel Preview Rekap Transaksi */}
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Outlet</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3 text-center">Jumlah (Qty)</th>
                    <th className="py-2.5 px-3 text-right">Harga</th>
                    <th className="py-2.5 px-3 text-center">Bayar</th>
                    <th className="py-2.5 px-3 text-right">Omset</th>
                    <th className="py-2.5 px-3 text-center">Bukti QRIS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {Object.entries(appState.outlets)
                    .filter(([key]) => recapFilterOutlet === 'all' || key === recapFilterOutlet)
                    .flatMap(([oKey, outlet]) => {
                      const oData = appState.data[oKey];
                      if (!oData) return [];

                      return (['pagi', 'sore'] as ShiftType[]).flatMap((shift) => {
                        const shiftData = oData[shift];
                        if (!shiftData || !shiftData.produkList) return [];

                        return shiftData.produkList.map((p, pIdx) => (
                          <tr key={`${oKey}-${shift}-${p.id || pIdx}`} className="hover:bg-slate-700/40 transition">
                            <td className="py-2.5 px-3 font-bold text-white">{outlet.name}</td>
                            <td className="py-2.5 px-3 uppercase text-slate-300 font-mono text-[10px]">
                              {shift}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-indigo-300">
                              #{p.orderNo || 1}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{p.nama}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{p.cup || 1}</td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              {formatRupiah(p.harga)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {p.metode === 'QR' ? (
                                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  QRIS
                                </span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  CASH
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-indigo-300">
                              {formatRupiah(p.total || p.harga * (p.cup || 1))}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {p.qrisProofUrl ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const w = window.open('');
                                    w?.document.write(`<img src="${p.qrisProofUrl}" style="max-width:100%"/>`);
                                  }}
                                  className="text-[10px] font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-lg transition"
                                >
                                  Lihat Foto
                                </button>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ));
                      });
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA OUTLET (HANYA ADA DI HALAMAN ADMIN) */}
        {activeTab === 'outlet_management' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Form Tambah Outlet */}
            <div className="lg:col-span-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                <Store className="text-indigo-400" size={18} />
                <h3 className="text-sm font-bold">Tambah Outlet Baru</h3>
              </div>
              <p className="text-xs text-slate-400">
                Outlet baru yang ditambahkan di sini akan langsung tersimpan permanen di server dan disinkronkan ke seluruh perangkat tanpa hilang sendiri.
              </p>

              <form onSubmit={handleAddOutlet} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Outlet Baru
                  </label>
                  <input
                    type="text"
                    required
                    value={newOutletName}
                    onChange={(e) => setNewOutletName(e.target.value)}
                    placeholder="Contoh: Outlet Nusa Indah 2, Cabang Sudirman..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Simpan Outlet Permanen</span>
                </button>
              </form>
            </div>

            {/* List Outlet Aktif */}
            <div className="lg:col-span-8 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Store className="text-indigo-400" size={18} />
                  <span>Daftar Outlet Terdaftar ({Object.keys(appState.outlets).length} Outlet)</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {Object.entries(appState.outlets).map(([key, outlet]) => {
                  const oData = appState.data[key];
                  const pagiItems = oData?.pagi?.produkList?.length || 0;
                  const soreItems = oData?.sore?.produkList?.length || 0;

                  return (
                    <div
                      key={key}
                      className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{outlet.name}</span>
                          {key === appState.activeOutlet && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                              Aktif Sekarang
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Key: <code className="font-mono text-slate-300">{key}</code> · Shift Pagi:{' '}
                          {pagiItems} transaksi, Shift Sore: {soreItems} transaksi
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {Object.keys(appState.outlets).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOutlet(key, outlet.name)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                            title="Hapus outlet"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PENGATURAN NAMA USAHA & LOGO STRUK (ADMIN ONLY) */}
        {activeTab === 'business_branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Form Pengaturan Usaha */}
            <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-bold">Identitas Usaha &amp; Pengaturan Struk</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Thermal 58mm / 80mm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atur kop nama usaha, logo, dan alamat pada struk kasir. Anda bisa mengatur secara <b>Global (Semua Cabang)</b> atau <b>Khusus Per Outlet</b> yang berbeda-beda.
              </p>

              {/* Selector: Global atau Outlet Spesifik */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Pilih Target Pengaturan Struk:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectBrandingTarget('global')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      brandingTargetOutlet === 'global'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🌐 Global (Default Seluruh Outlet)
                  </button>
                  {Object.entries(appState.outlets).map(([oKey, oInfo]) => (
                    <button
                      key={oKey}
                      type="button"
                      onClick={() => handleSelectBrandingTarget(oKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        brandingTargetOutlet === oKey
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Store size={12} />
                      <span>Khusus {oInfo.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-indigo-300/80 pt-1">
                  {brandingTargetOutlet === 'global'
                    ? '✏️ Mengubah pengaturan global akan berlaku untuk outlet yang belum memiliki pengaturan khusus.'
                    : `✏️ Mengubah pengaturan khusus untuk outlet "${appState.outlets[brandingTargetOutlet]?.name || brandingTargetOutlet}". Struk outlet ini akan menggunakan logo/nama tersendiri.`}
                </p>
              </div>

              <form onSubmit={handleSaveBusinessConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {brandingTargetOutlet === 'global' ? 'Nama Usaha / Brand Utama' : `Nama Usaha / Kop Struk (${appState.outlets[brandingTargetOutlet]?.name})`}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder={brandingTargetOutlet === 'global' ? 'Contoh: Kopi Nusantara & Kitchen' : `Contoh: Kopi Nusantara - ${appState.outlets[brandingTargetOutlet]?.name}`}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slogan / Tagline (Opsional)
                  </label>
                  <input
                    type="text"
                    value={bizTagline}
                    onChange={(e) => setBizTagline(e.target.value)}
                    placeholder="Contoh: Authentic Coffee & Eatery"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                {/* Upload Logo Usaha */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-200">
                    Logo Usaha untuk Struk
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Unggah gambar logo usaha Anda (format PNG, JPG, WebP). Logo akan dicetak di bagian atas kertas struk kasir.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Upload size={14} />
                      <span>{bizLogoUrl ? 'Ganti Foto Logo' : 'Unggah Foto Logo'}</span>
                    </button>
                    {bizLogoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setBizLogoUrl('');
                          onShowToast('Logo dihapus dari struk.');
                        }}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition border border-rose-500/30 cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>

                  {/* URL Input alternatif jika punya hosting logo */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Atau Tempel Tautan Gambar Logo (URL Web)
                    </label>
                    <input
                      type="text"
                      value={bizLogoUrl.startsWith('data:') ? '(Gambar Tersimpan Lokal)' : bizLogoUrl}
                      onChange={(e) => {
                        if (!bizLogoUrl.startsWith('data:')) {
                          setBizLogoUrl(e.target.value);
                        }
                      }}
                      placeholder="https://example.com/logo.png"
                      disabled={bizLogoUrl.startsWith('data:')}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Usaha / Pusat
                    </label>
                    <input
                      type="text"
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      placeholder="Jl. Merdeka No. 45, Kota Pusat"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catatan Kaki Struk (Footer Struk)
                  </label>
                  <input
                    type="text"
                    value={bizFooter}
                    onChange={(e) => setBizFooter(e.target.value)}
                    placeholder="Terima kasih atas kunjungan Anda! Follow IG: @usaha_anda"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan Nama Usaha &amp; Logo Struk</span>
                </button>
              </form>
            </div>

            {/* Live Preview Struk Kertas Kasir Thermal */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-3">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Printer size={14} className="text-indigo-400" />
                  <span>Live Preview Kertas Struk Kasir</span>
                </h4>
                <span className="text-[10px] text-slate-400">Pratinjau Nyata</span>
              </div>

              {/* Simulasi Kertas Thermal */}
              <div className="bg-amber-50/20 text-slate-800 dark:text-slate-200 p-5 rounded-2xl border border-slate-300 dark:border-slate-700 font-mono text-xs space-y-3 shadow-inner">
                {/* Header Logo & Usaha */}
                <div className="text-center space-y-1 border-b border-dashed border-slate-400 dark:border-slate-600 pb-3">
                  {bizLogoUrl ? (
                    <div className="flex justify-center mb-1">
                      <img
                        src={bizLogoUrl}
                        alt="Logo Usaha"
                        className="max-h-14 max-w-[120px] object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-1">
                      <Store size={20} />
                    </div>
                  )}

                  <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider leading-tight">
                    {bizName || 'NAMA USAHA ANDA'}
                  </h3>

                  {bizTagline && (
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                      {bizTagline}
                    </p>
                  )}

                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    {brandingTargetOutlet !== 'global'
                      ? appState.outlets[brandingTargetOutlet]?.name
                      : appState.outlets[appState.activeOutlet]?.name || 'OUTLET CABANG'}
                  </p>

                  {bizAddress && (
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                      {bizAddress}
                    </p>
                  )}

                  {bizPhone && (
                    <p className="text-[9px] text-slate-500 dark:text-slate-400">
                      Telp: {bizPhone}
                    </p>
                  )}

                  <div className="pt-1 border-t border-dotted border-slate-300 dark:border-slate-700 flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
                    <span>27 Sep 2026 · 11:30</span>
                    <span className="font-bold">SHIFT PAGI</span>
                  </div>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                    ORDER #101
                  </p>
                </div>

                {/* Items Dummy */}
                <div className="space-y-1.5 border-b border-dashed border-slate-400 dark:border-slate-600 pb-2 text-[11px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Kopi Susu Gula Aren</div>
                      <div className="text-[9px] text-slate-500">2 × Rp18.000</div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Rp36.000</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Kentang Goreng Crispy</div>
                      <div className="text-[9px] text-slate-500">1 × Rp15.000</div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Rp15.000</div>
                  </div>
                </div>

                {/* Totals Dummy */}
                <div className="space-y-1 border-b border-dashed border-slate-400 dark:border-slate-600 pb-2 text-[11px]">
                  <div className="flex justify-between font-bold text-xs">
                    <span>TOTAL</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">Rp51.000</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Metode Bayar</span>
                    <span className="font-bold">TUNAI (CASH)</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Uang Diterima</span>
                    <span>Rp100.000</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>Kembalian</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Rp49.000</span>
                  </div>
                </div>

                {/* Footer Struk */}
                <div className="text-center text-[9px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <p className="font-bold">{bizFooter || 'Terima kasih atas kunjungan Anda!'}</p>
                  <p>Simpan struk ini sebagai bukti transaksi sah.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PENGATURAN SUPABASE SERVER & RESET DATA (ADMIN ONLY) */}
        {activeTab === 'settings_supabase' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Pengaturan Supabase */}
            <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-bold">Pengaturan Supabase Cloud Database</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {cloudStatus.message}
                </span>
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Key (Anon Public / Service Key)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    Simpan Pengaturan Database
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      supabaseSync.sendPingTest();
                      onShowToast('Sinyal uji dikirim ke seluruh HP!');
                    }}
                    className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Tes Ping
                  </button>
                </div>
              </form>

              {/* Ganti PIN Admin */}
              <div className="border-t border-slate-700 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ganti Password / PIN Admin
                </h4>
                <form onSubmit={handleSaveNewPin} className="flex gap-2">
                  <input
                    type="password"
                    value={newAdminPin}
                    onChange={(e) => setNewAdminPin(e.target.value)}
                    placeholder="PIN baru (min. 4 digit)"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-hidden font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Ubah PIN
                  </button>
                </form>
              </div>
            </div>

            {/* RESET DATA KHUSUS ADMIN (HANYA ADA DI SINI) */}
            <div className="lg:col-span-6 bg-slate-800/80 border border-rose-500/30 p-5 rounded-2xl text-white space-y-4">
              <div className="border-b border-rose-500/30 pb-3 flex items-center gap-2 text-rose-400">
                <RotateCcw size={18} />
                <h3 className="text-sm font-bold">Reset Data Transaksi (Khusus Admin)</h3>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 leading-relaxed space-y-1">
                <p>
                  Fitur reset ini <b>hanya menghapus catatan transaksi harian dan pengeluaran kas</b> pada outlet yang dipilih.
                </p>
                <p className="text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 size={13} />
                  <span>Daftar Master Produk &amp; Katalog Barang TIDAK AKAN PERNAH terhapus saat melakukan reset.</span>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilihan Target Reset
                  </label>
                  <select
                    value={resetShiftTarget}
                    onChange={(e) => setResetShiftTarget(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2.5 outline-hidden"
                  >
                    <option value="current_shift">
                      Reset Hanya Shift Aktif Saat Ini di {appState.outlets[appState.activeOutlet]?.name}
                    </option>
                    <option value="all_shifts">
                      Reset Semua Shift (Pagi &amp; Sore) di {appState.outlets[appState.activeOutlet]?.name}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Konfirmasi Keamanan: Ketik kata <span className="text-rose-400 font-mono font-bold">RESET</span>
                  </label>
                  <input
                    type="text"
                    value={confirmResetText}
                    onChange={(e) => setConfirmResetText(e.target.value)}
                    placeholder="Ketik RESET"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-rose-500 outline-hidden font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecuteAdminReset}
                  disabled={confirmResetText.trim().toUpperCase() !== 'RESET'}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    confirmResetText.trim().toUpperCase() === 'RESET'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-lg shadow-rose-600/30'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw size={16} />
                  <span>Jalankan Reset Data Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
