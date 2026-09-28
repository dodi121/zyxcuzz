export type ProductCategory = 'minuman' | 'makanan';
export type PaymentMethod = 'CASH' | 'QR';
export type ShiftType = 'pagi' | 'sore';

export interface MasterProduct {
  id: string;
  sku?: string;
  nama: string;
  harga: number;
  kategori: ProductCategory;
  subKategori?: string; // 'Minuman Kopi' | 'Non-Kopi' | 'Snack & Makanan'
  hpp?: number; // Harga Pokok Penjualan / modal dasar untuk kalkulasi profit
}

export interface ProductItem {
  id: number;
  sku?: string;
  nama: string;
  harga: number;
  cup: number; // Qty / Jumlah item
  kategori: ProductCategory;
  subKategori?: string;
  metode: PaymentMethod;
  total: number;
  orderId?: string;
  orderNo?: number;
  notes?: string;
  qrisProofUrl?: string; // Foto bukti transfer / QRIS (base64)
  cashDiterima?: number;
  kembalian?: number;
  createdAt?: string;
  masterProductId?: string;
}

export interface ExpenseItem {
  id: number;
  keterangan: string;
  nominal: number;
  createdAt?: string;
}

export interface FreeItem {
  id: number;
  kategori: ProductCategory;
  keterangan: string;
  cup: number; // Qty / Jumlah item
  createdAt?: string;
}

export interface ShiftData {
  modalAwal: number;
  cupAwal: number;
  cupTerjualManual: number | null;
  cashAktual: number;
  produkList: ProductItem[];
  pengeluaranList: ExpenseItem[];
  gratisList: FreeItem[];
}

export interface OutletData {
  activeShift: ShiftType;
  pagi: ShiftData;
  sore: ShiftData;
}

export interface OutletInfo {
  name: string;
  address?: string;
  phone?: string;
  logoUrl?: string; // Logo khusus outlet
  receiptHeader?: string; // Nama usaha / kop khusus struk outlet ini
  tagline?: string; // Slogan khusus struk outlet ini
  footerText?: string; // Catatan kaki khusus struk outlet ini
}

export interface BusinessConfig {
  businessName: string;
  tagline?: string;
  address?: string;
  phone?: string;
  logoUrl?: string; // base64 or URL
  footerText?: string;
}

export interface AppState {
  activeOutlet: string;
  outlets: Record<string, OutletInfo>;
  data: Record<string, OutletData>;
  businessConfig?: BusinessConfig;
  masterProducts?: MasterProduct[];
  outletStocks?: Record<string, Record<string, number>>; // outletKey -> { [productId or productName]: stockQty }
  adminPin?: string; // Default admin123
  _syncUpdatedAt?: number;
}

