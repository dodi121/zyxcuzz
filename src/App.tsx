import { useState, useEffect, useRef } from 'react';
import {
  AppState,
  ProductItem,
  ExpenseItem,
  FreeItem,
  ShiftType,
} from './types/sales';
import {
  STORAGE_KEY,
  THEME_KEY,
  INITIAL_APP_STATE,
  createEmptyShift,
  cleanAndDeduplicateState,
  formatRupiah,
} from './utils/salesHelpers';
import { Header } from './components/sales/Header';
import { SummaryCards } from './components/sales/SummaryCards';
import { StockInputs } from './components/sales/StockInputs';
import { ProductFormAndCalculator } from './components/sales/ProductFormAndCalculator';
import { SalesTable } from './components/sales/SalesTable';
import { ExpensesSection } from './components/sales/ExpensesSection';
import { FreeItemsSection } from './components/sales/FreeItemsSection';
import { ClosingSection } from './components/sales/ClosingSection';
import { EditProductModal } from './components/sales/EditProductModal';
import { OutletManagerModal } from './components/sales/OutletManagerModal';
import { ResetConfirmModal } from './components/sales/ResetConfirmModal';
import { ClosingSummaryModal } from './components/sales/ClosingSummaryModal';
import { PrintLayout } from './components/sales/PrintLayout';
import { SupabaseModal } from './components/sales/SupabaseModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { OrderReceiptModal } from './components/sales/OrderReceiptModal';
import { ModernPosCatalogAndCart } from './components/pos/ModernPosCatalogAndCart';
import { supabaseSync, CloudSyncStatus } from './services/supabase';

const DEVICE_OUTLET_KEY = 'rekapan_device_active_outlet';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Cloud sync status state
  const [cloudStatus, setCloudStatus] = useState<{
    status: CloudSyncStatus;
    message: string;
  }>({
    status: 'syncing',
    message: 'MENGHUBUNGKAN CLOUD...',
  });

  // Supabase settings modal state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // App State loaded from localStorage (dengan deduplikasi otomatis)
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedOutlets = {
          ...INITIAL_APP_STATE.outlets,
          ...(parsed.outlets || {}),
        };
        const mergedData = {
          ...INITIAL_APP_STATE.data,
          ...(parsed.data || {}),
        };
        const rawState: AppState = {
          ...INITIAL_APP_STATE,
          ...parsed,
          outlets: mergedOutlets,
          data: mergedData,
        };
        const deduplicated = cleanAndDeduplicateState(rawState);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
        } catch (_) {}
        return deduplicated;
      }
    } catch {
      // fallback
    }
    return INITIAL_APP_STATE;
  });

  // Per-device active outlet: HP di Outlet Nusama tetap di Nusama, HP di Outlet Nusa Indah tetap di Nusa Indah
  const [activeOutletKey, setActiveOutletKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(DEVICE_OUTLET_KEY);
      if (saved) return saved;
    } catch (_) {}
    return 'nusama';
  });

  // Pastikan outlet yang aktif valid
  const currentOutletKey = appState.outlets[activeOutletKey]
    ? activeOutletKey
    : Object.keys(appState.outlets)[0] || 'nusama';

  // Initialize Supabase & Server realtime sync
  useEffect(() => {
    const handleRemoteUpdate = (incomingState: AppState, source: string) => {
      setAppState((prev) => {
        // Deep merge data per outlet: pembaruan di outlet Nusama tidak menimpa outlet Nusa Indah
        const mergedOutlets = {
          ...prev.outlets,
          ...(incomingState.outlets || {}),
        };
        const mergedData = {
          ...prev.data,
          ...(incomingState.data || {}),
        };

        const updated: AppState = cleanAndDeduplicateState({
          ...prev,
          outlets: mergedOutlets,
          data: mergedData,
          _syncUpdatedAt: Math.max(
            Number(prev._syncUpdatedAt || 0),
            Number(incomingState._syncUpdatedAt || 0)
          ),
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        showToast(`⚡ Data tersinkron dari ${source}!`);
        return updated;
      });
    };

    const handleStatusChange = (status: CloudSyncStatus, message: string) => {
      setCloudStatus({ status, message });
    };

    const handlePingReceived = (senderName: string) => {
      showToast(`🔔 Sinyal Uji Realtime Diterima dari "${senderName}"!`);
    };

    supabaseSync.init(handleRemoteUpdate, handleStatusChange, handlePingReceived);

    // Load state awal dari server & cloud
    supabaseSync.loadInitialState(appState).then((latestState) => {
      if (latestState) {
        setAppState((prev) => {
          const mergedOutlets = {
            ...prev.outlets,
            ...(latestState.outlets || {}),
          };
          const mergedData = {
            ...prev.data,
            ...(latestState.data || {}),
          };
          const combined: AppState = cleanAndDeduplicateState({
            ...latestState,
            outlets: mergedOutlets,
            data: mergedData,
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
          } catch (_) {}
          return combined;
        });
      }
    });

    return () => {
      supabaseSync.destroy();
    };
  }, []);

  // Update App State helper that saves to LocalStorage and queues to Supabase
  const updateAndSyncState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      const withTimestamp = {
        ...next,
        _syncUpdatedAt: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
      } catch (_) {}

      // Push update ke Server & Supabase Realtime
      supabaseSync.queueSave(withTimestamp);
      return withTimestamp;
    });
  };

  // Modal Awal input focus ref
  const modalAwalInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [editProductIndex, setEditProductIndex] = useState<number | null>(null);

  // Admin Panel & Login states (Private access)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('is_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Cashier Navigation Tab: 'pos' (Modern POS Catalog & Cart as in screenshot)
  const [posNavTab, setPosNavTab] = useState<'pos' | 'history' | 'expenses' | 'closing' | 'manual'>('pos');

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    orderItems: ProductItem[];
    orderNo: number;
    meta?: any;
  }>({
    isOpen: false,
    orderItems: [],
    orderNo: 1,
  });

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    try {
      sessionStorage.setItem('is_admin_logged_in', 'true');
    } catch (_) {}
    setIsAdminLoginModalOpen(false);
    setIsAdminPanelOpen(true);
    showToast('Login Admin Berhasil! Selamat datang di Panel Admin.');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      sessionStorage.removeItem('is_admin_logged_in');
    } catch (_) {}
    setIsAdminPanelOpen(false);
    showToast('Telah keluar dari mode Admin.');
  };

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Outlet & Shift data untuk outlet yang sedang dibuka di perangkat ini
  const currentOutletInfo = appState.outlets[currentOutletKey] || {
    name: 'Outlet Nusama',
  };
  const currentOutletData =
    appState.data[currentOutletKey] || {
      activeShift: 'pagi',
      pagi: createEmptyShift(500000, 80),
      sore: createEmptyShift(500000, 80),
    };
  const currentShiftType: ShiftType = currentOutletData.activeShift || 'pagi';
  const currentShiftData =
    currentOutletData[currentShiftType] || createEmptyShift(500000, 80);

  // Outlet Switching pada perangkat ini (tidak mengubah tampilan outlet di HP lain)
  const handleSwitchOutlet = (outletKey: string) => {
    if (!appState.outlets[outletKey]) return;
    setActiveOutletKey(outletKey);
    try {
      localStorage.setItem(DEVICE_OUTLET_KEY, outletKey);
    } catch (_) {}
  };

  const handleAddOutlet = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Cek apakah outlet dengan nama yang sama sudah ada (hindari ganda)
    const existingKey = Object.keys(appState.outlets).find(
      (k) => appState.outlets[k]?.name?.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (existingKey) {
      handleSwitchOutlet(existingKey);
      showToast(`Outlet "${trimmed}" sudah ada! Berpindah ke outlet tersebut.`);
      return;
    }

    const key = 'outlet_' + Date.now();
    setActiveOutletKey(key);
    try {
      localStorage.setItem(DEVICE_OUTLET_KEY, key);
    } catch (_) {}

    updateAndSyncState((prev) => ({
      ...prev,
      outlets: {
        ...prev.outlets,
        [key]: { name: trimmed },
      },
      data: {
        ...prev.data,
        [key]: {
          activeShift: 'pagi',
          pagi: createEmptyShift(500000, 80),
          sore: createEmptyShift(500000, 80),
        },
      },
    }));
    showToast(`Outlet "${trimmed}" berhasil ditambahkan!`);
  };

  const handleDeleteOutlet = (key: string) => {
    const remainingKeys = Object.keys(appState.outlets).filter((k) => k !== key);
    if (remainingKeys.length === 0) return;

    if (currentOutletKey === key) {
      const nextKey = remainingKeys[0];
      setActiveOutletKey(nextKey);
      try {
        localStorage.setItem(DEVICE_OUTLET_KEY, nextKey);
      } catch (_) {}
    }

    updateAndSyncState((prev) => {
      const nextOutlets = { ...prev.outlets };
      delete nextOutlets[key];
      const nextData = { ...prev.data };
      delete nextData[key];

      return {
        ...prev,
        outlets: nextOutlets,
        data: nextData,
      };
    });
    showToast('Outlet berhasil dihapus.');
  };

  // Shift Switching pada outlet aktif saat ini
  const handleSwitchShift = (shift: ShiftType) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            activeShift: shift,
          },
        },
      };
    });
  };

  // Update Stock Inputs pada outlet aktif saat ini
  const handleUpdateModalAwal = (val: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              modalAwal: val,
            },
          },
        },
      };
    });
  };

  const handleUpdateCupAwal = (val: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              cupAwal: val,
            },
          },
        },
      };
    });
  };

  const handleUpdateCupTerjualManual = (val: number | null) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              cupTerjualManual: val,
            },
          },
        },
      };
    });
  };

  // Update Cash Aktual pada outlet aktif saat ini
  const handleUpdateCashAktual = (val: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              cashAktual: val,
            },
          },
        },
      };
    });
  };

  // Products CRUD pada outlet aktif saat ini
  const handleSaveOrder = (
    items: ProductItem[],
    meta?: {
      cashDiterima?: number;
      kembalian?: number;
      qrisProofUrl?: string;
      paymentMethod?: any;
    }
  ) => {
    let assignedOrderNo = 1;
    let savedItemsWithOrder: ProductItem[] = [];

    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      const currentList = outletData[shift].produkList || [];

      const existingOrderNos = currentList
        .map((p) => p.orderNo || 0)
        .filter((n) => n > 0);
      const nextOrderNo =
        existingOrderNos.length > 0 ? Math.max(...existingOrderNos) + 1 : 1;
      assignedOrderNo = nextOrderNo;
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      savedItemsWithOrder = items.map((it, idx) => ({
        ...it,
        id: Date.now() + idx,
        orderId,
        orderNo: nextOrderNo,
        cashDiterima: meta?.cashDiterima,
        kembalian: meta?.kembalian,
        qrisProofUrl: it.qrisProofUrl || meta?.qrisProofUrl,
        createdAt: new Date().toISOString(),
      }));

      // Update physical outlet stock per outlet (mengurangi sisa barang)
      const currentStocks = { ...(prev.outletStocks || {}) };
      const outletStockMap = { ...(currentStocks[currentOutletKey] || {}) };
      const masterList = prev.masterProducts || [];

      items.forEach((it) => {
        const matched =
          masterList.find((m) => m.id === it.masterProductId) ||
          masterList.find((m) => m.nama.trim().toLowerCase() === it.nama.trim().toLowerCase());
        if (matched) {
          const prevQty = outletStockMap[matched.id] ?? 40;
          outletStockMap[matched.id] = Math.max(0, prevQty - (it.cup || 1));
        }
      });
      currentStocks[currentOutletKey] = outletStockMap;

      return {
        ...prev,
        outletStocks: currentStocks,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              produkList: [...currentList, ...savedItemsWithOrder],
            },
          },
        },
      };
    });

    // Buka Struk Pembelian Kasir POS otomatis
    setReceiptData({
      isOpen: true,
      orderItems: savedItemsWithOrder,
      orderNo: assignedOrderNo,
      meta,
    });
  };

  const handleUpdateProduct = (index: number, updatedItem: ProductItem) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      const list = [...outletData[shift].produkList];
      list[index] = updatedItem;

      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              produkList: list,
            },
          },
        },
      };
    });
    showToast('Produk berhasil diperbarui!');
  };

  const handleDeleteProduct = (index: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      const list = outletData[shift].produkList.filter((_, i) => i !== index);

      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              produkList: list,
            },
          },
        },
      };
    });
    showToast('Produk dihapus.');
  };

  // Expenses CRUD pada outlet aktif saat ini
  const handleAddPengeluaran = (item: ExpenseItem) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              pengeluaranList: [...outletData[shift].pengeluaranList, item],
            },
          },
        },
      };
    });
    showToast('Pengeluaran berhasil dicatat!');
  };

  const handleDeletePengeluaran = (index: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      const list = outletData[shift].pengeluaranList.filter((_, i) => i !== index);
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              pengeluaranList: list,
            },
          },
        },
      };
    });
    showToast('Pengeluaran dihapus.');
  };

  // Free items CRUD pada outlet aktif saat ini
  const handleAddGratis = (item: FreeItem) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              gratisList: [...outletData[shift].gratisList, item],
            },
          },
        },
      };
    });
    showToast('Pengambilan tanpa bayar dicatat!');
  };

  const handleDeleteGratis = (index: number) => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      const list = outletData[shift].gratisList.filter((_, i) => i !== index);
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: {
              ...outletData[shift],
              gratisList: list,
            },
          },
        },
      };
    });
    showToast('Catatan gratis dihapus.');
  };

  // Reset shift data pada outlet aktif saat ini
  const handleConfirmReset = () => {
    updateAndSyncState((prev) => {
      const outletData = prev.data[currentOutletKey] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
      const shift = outletData.activeShift;
      return {
        ...prev,
        data: {
          ...prev.data,
          [currentOutletKey]: {
            ...outletData,
            [shift]: createEmptyShift(500000, 80),
          },
        },
      };
    });
    showToast(`Data shift ${currentShiftType.toUpperCase()} di ${currentOutletInfo.name} berhasil di-reset.`);
  };

  // Perhitungan Finansial & Rekapan Otomatis KHUSUS untuk outlet yang sedang aktif
  const cupTerjualMinuman = currentShiftData.produkList
    .filter((p) => p.kategori === 'minuman')
    .reduce((sum, p) => sum + (p.cup || 0), 0);

  const cupGratis = currentShiftData.gratisList
    .filter((g) => g.kategori === 'minuman')
    .reduce((sum, g) => sum + (g.cup || 0), 0);

  // Total cup keluar = cup terjual + cup gratis / internal
  const totalCupKeluar = cupTerjualMinuman + cupGratis;
  const totalCupAuto = totalCupKeluar;

  const totalMakananTerjualQty = currentShiftData.produkList
    .filter((p) => p.kategori === 'makanan')
    .reduce((sum, p) => sum + (p.cup || 0), 0);

  const totalMakananGratisQty = currentShiftData.gratisList
    .filter((g) => g.kategori === 'makanan')
    .reduce((sum, g) => sum + (g.cup || 0), 0);

  const totalMakananKeluar = totalMakananTerjualQty + totalMakananGratisQty;

  const totalCash = currentShiftData.produkList
    .filter((p) => p.metode === 'CASH')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const totalQR = currentShiftData.produkList
    .filter((p) => p.metode === 'QR')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const totalOmset = totalCash + totalQR;

  const totalPengeluaran = currentShiftData.pengeluaranList.reduce(
    (sum, ex) => sum + (ex.nominal || 0),
    0
  );

  const cashSeharusnya =
    (currentShiftData.modalAwal || 0) + totalCash - totalPengeluaran;

  const editingProductItem =
    editProductIndex !== null && currentShiftData.produkList[editProductIndex]
      ? currentShiftData.produkList[editProductIndex]
      : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16 transition-colors duration-200">
      {/* TOAST POPUP NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 border border-slate-700">
          <i className="fa-solid fa-circle-check text-emerald-400"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <Header
        appState={{
          ...appState,
          activeOutlet: currentOutletKey,
        }}
        onSwitchOutlet={handleSwitchOutlet}
        onSwitchShift={handleSwitchShift}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        cloudStatus={cloudStatus}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-5">
        {/* TOP CASHIER NAVIGATION SEGMENT */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div
            className="flex items-center gap-1.5 scroll-touch-x py-1 text-xs font-bold select-none cursor-grab active:cursor-grabbing max-w-full"
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
              type="button"
              onClick={() => setPosNavTab('pos')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                posNavTab === 'pos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-cash-register"></i>
              <span>Kasir POS (Katalog &amp; Keranjang)</span>
            </button>

            <button
              type="button"
              onClick={() => setPosNavTab('history')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                posNavTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>Riwayat Transaksi ({currentShiftData.produkList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPosNavTab('expenses')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                posNavTab === 'expenses'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-wallet"></i>
              <span>Biaya &amp; Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => setPosNavTab('closing')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                posNavTab === 'closing'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-lock"></i>
              <span>Tutup Kas &amp; Shift</span>
            </button>

            <button
              type="button"
              onClick={() => setPosNavTab('manual')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                posNavTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Input Manual Bebas</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span>Shift {currentShiftType.toUpperCase()}</span>
            <span>·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatRupiah(totalOmset)}</span>
          </div>
        </div>

        {/* TAB 1: KASIR POS MODERN DENGAN GRID KATALOG & KERANJANG (MATCHES USER SCREENSHOT) */}
        {posNavTab === 'pos' && (
          <div className="space-y-6">
            <ModernPosCatalogAndCart
              masterProducts={appState.masterProducts || []}
              outletStocks={appState.outletStocks?.[currentOutletKey] || {}}
              activeOutletName={currentOutletInfo.name}
              activeShift={currentShiftType}
              onSwitchShift={handleSwitchShift}
              onSaveOrder={handleSaveOrder}
              onQuickAlert={(msg) => showToast(msg)}
            />

            {/* Quick preview of recent transactions below */}
            {currentShiftData.produkList.length > 0 && (
              <div className="pt-2">
                <SalesTable
                  produkList={currentShiftData.produkList}
                  onOpenEditModal={(idx) => setEditProductIndex(idx)}
                  onDeleteProduct={handleDeleteProduct}
                  onPrintReceipt={(orderItems, orderNo, meta) => {
                    setReceiptData({
                      isOpen: true,
                      orderItems,
                      orderNo,
                      meta,
                    });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT TRANSAKSI LENGKAP */}
        {posNavTab === 'history' && (
          <SalesTable
            produkList={currentShiftData.produkList}
            onOpenEditModal={(idx) => setEditProductIndex(idx)}
            onDeleteProduct={handleDeleteProduct}
            onPrintReceipt={(orderItems, orderNo, meta) => {
              setReceiptData({
                isOpen: true,
                orderItems,
                orderNo,
                meta,
              });
            }}
          />
        )}

        {/* TAB 3: BIAYA & PENGELUARAN */}
        {posNavTab === 'expenses' && (
          <div className="space-y-6">
            <ExpensesSection
              pengeluaranList={currentShiftData.pengeluaranList}
              onAddPengeluaran={handleAddPengeluaran}
              onDeletePengeluaran={handleDeletePengeluaran}
            />
            <FreeItemsSection
              gratisList={currentShiftData.gratisList}
              onAddGratis={handleAddGratis}
              onDeleteGratis={handleDeleteGratis}
            />
          </div>
        )}

        {/* TAB 4: TUTUP KAS & SHIFT */}
        {posNavTab === 'closing' && (
          <div className="space-y-6">
            <SummaryCards
              modalAwal={currentShiftData.modalAwal || 0}
              totalCupKeluar={totalCupKeluar}
              cupTerjualMinuman={cupTerjualMinuman}
              cupGratis={cupGratis}
              totalMakananKeluar={totalMakananKeluar}
              totalCash={totalCash}
              totalQR={totalQR}
              totalOmset={totalOmset}
              totalPengeluaran={totalPengeluaran}
              shift={currentShiftType}
              onFocusModalAwal={() => {
                modalAwalInputRef.current?.focus();
                modalAwalInputRef.current?.select();
              }}
            />
            <StockInputs
              modalAwal={currentShiftData.modalAwal || 0}
              cupAwal={currentShiftData.cupAwal || 0}
              cupTerjualManual={currentShiftData.cupTerjualManual}
              totalCupAuto={totalCupAuto}
              cupTerjualMinuman={cupTerjualMinuman}
              cupGratis={cupGratis}
              onUpdateModalAwal={handleUpdateModalAwal}
              onUpdateCupAwal={handleUpdateCupAwal}
              onUpdateCupTerjualManual={handleUpdateCupTerjualManual}
              modalAwalInputRef={modalAwalInputRef}
            />
            <ClosingSection
              cashSeharusnya={cashSeharusnya}
              cashAktual={currentShiftData.cashAktual || 0}
              onUpdateCashAktual={handleUpdateCashAktual}
              onOpenClosingModal={() => setIsClosingModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 5: FORM INPUT MANUAL BEBAS */}
        {posNavTab === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <ProductFormAndCalculator
                masterProducts={appState.masterProducts}
                onSaveOrder={handleSaveOrder}
                onQuickAlert={(msg) => showToast(msg)}
              />
            </div>
            <div className="lg:col-span-7">
              <SalesTable
                produkList={currentShiftData.produkList}
                onOpenEditModal={(idx) => setEditProductIndex(idx)}
                onDeleteProduct={handleDeleteProduct}
                onPrintReceipt={(orderItems, orderNo, meta) => {
                  setReceiptData({
                    isOpen: true,
                    orderItems,
                    orderNo,
                    meta,
                  });
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <EditProductModal
        isOpen={editProductIndex !== null}
        item={editingProductItem}
        index={editProductIndex}
        onClose={() => setEditProductIndex(null)}
        onSave={handleUpdateProduct}
      />

      <OutletManagerModal
        isOpen={isOutletModalOpen}
        outlets={appState.outlets}
        activeOutlet={currentOutletKey}
        onClose={() => setIsOutletModalOpen(false)}
        onAddOutlet={handleAddOutlet}
        onDeleteOutlet={handleDeleteOutlet}
        onSwitchOutlet={(key: string) => {
          handleSwitchOutlet(key);
          setIsOutletModalOpen(false);
        }}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      <ClosingSummaryModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        currentShiftData={currentShiftData}
        outletName={currentOutletInfo.name}
        shiftType={currentShiftType}
        businessConfig={appState.businessConfig}
        outletInfo={currentOutletInfo}
        onPrint={() => window.print()}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        cloudStatus={cloudStatus}
        onSendPingAlert={(msg) => showToast(msg)}
      />

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        savedPin={appState.adminPin}
      />

      {/* FULL ADMIN PANEL */}
      {isAdminPanelOpen && (
        <AdminPanel
          appState={appState}
          onClose={() => setIsAdminPanelOpen(false)}
          onLogout={handleAdminLogout}
          onUpdateState={updateAndSyncState}
          cloudStatus={cloudStatus}
          onShowToast={(msg) => showToast(msg)}
        />
      )}

      {/* POS ORDER RECEIPT THERMAL MODAL */}
      <OrderReceiptModal
        isOpen={receiptData.isOpen}
        onClose={() => setReceiptData((prev) => ({ ...prev, isOpen: false }))}
        orderItems={receiptData.orderItems}
        orderNo={receiptData.orderNo}
        outletName={currentOutletInfo.name}
        outletInfo={currentOutletInfo}
        businessConfig={appState.businessConfig}
        shiftName={currentShiftType}
        cashDiterima={receiptData.meta?.cashDiterima}
        kembalian={receiptData.meta?.kembalian}
        qrisProofUrl={receiptData.meta?.qrisProofUrl}
        paymentMethod={receiptData.meta?.paymentMethod}
        notes={receiptData.meta?.notes}
      />

      {/* PRINT LAYOUT (Thermal Receipt Style for window.print()) */}
      <PrintLayout
        currentShiftData={currentShiftData}
        outletName={currentOutletInfo.name}
        shiftType={currentShiftType}
        businessConfig={appState.businessConfig}
        outletInfo={currentOutletInfo}
      />
    </div>
  );
}
