import {
  AppState,
  ShiftData,
  ProductItem,
  ShiftType,
  OutletInfo,
  OutletData,
  MasterProduct,
  BusinessConfig,
} from '../types/sales';

export const STORAGE_KEY = 'rekapan_penjualan_outlet_v3';
export const THEME_KEY = 'rekapan_theme_mode';

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: 'Bintang Hokka Drink',
  tagline: 'Segar, Manis, Bikin Happy!',
  address: 'Jl. Merdeka No. 45',
  phone: '0812-3456-7890',
  logoUrl: '',
  footerText: 'Terima kasih atas kunjungan Anda! Simpan struk ini sebagai bukti pembayaran sah.',
};

export const DEFAULT_MASTER_PRODUCTS: MasterProduct[] = [
  // --- FOTO 1: MENU MAKANAN (15 Menu) ---
  { id: 'mkn_01', sku: 'MKN-01', nama: 'Dimsum', harga: 2000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_02', sku: 'MKN-02', nama: 'Dimsum Goreng Keju', harga: 4000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_03', sku: 'MKN-03', nama: 'Udang Keju', harga: 3000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_04', sku: 'MKN-04', nama: 'Udang Rambutan', harga: 3000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_05', sku: 'MKN-05', nama: 'Ebi Furai', harga: 8000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_06', sku: 'MKN-06', nama: 'Chicken Cordon Bleu', harga: 5000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_07', sku: 'MKN-07', nama: 'Chicken Crunchy Roll', harga: 3000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_08', sku: 'MKN-08', nama: 'Risolle', harga: 4000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_09', sku: 'MKN-09', nama: 'Burger Chicken', harga: 13000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_10', sku: 'MKN-10', nama: 'Burger Beef', harga: 15000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_11', sku: 'MKN-11', nama: 'Rice Bowl Paru', harga: 13000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_12', sku: 'MKN-12', nama: 'Rice Bowl Cumi', harga: 15000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_13', sku: 'MKN-13', nama: 'Mix Platter', harga: 15000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_14', sku: 'MKN-14', nama: 'Nasgor Bintang', harga: 13000, kategori: 'makanan', subKategori: 'Makanan' },
  { id: 'mkn_15', sku: 'MKN-15', nama: 'Mie Level', harga: 10000, kategori: 'makanan', subKategori: 'Makanan' },

  // --- FOTO 2: MENU MINUMAN KLASIK / SEGAR (3 Menu) ---
  { id: 'mnm_teh', sku: 'MNM-01', nama: 'Es Teh / Teh Hangat', harga: 3000, kategori: 'minuman', subKategori: 'Teh & Jeruk' },
  { id: 'mnm_kampul', sku: 'MNM-02', nama: 'Es Kampul', harga: 4000, kategori: 'minuman', subKategori: 'Teh & Jeruk' },
  { id: 'mnm_jeruk', sku: 'MNM-03', nama: 'Es Jeruk', harga: 5000, kategori: 'minuman', subKategori: 'Teh & Jeruk' },

  // --- FOTO 3: VARIAN COFFEE (14 Menu) ---
  { id: 'kopi_01', sku: 'KOP-01', nama: 'Cafe Latte (Normal)', harga: 8000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_02', sku: 'KOP-02', nama: 'Cafe Latte (Strong)', harga: 11000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_03', sku: 'KOP-03', nama: 'Butterscoth Latte', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_04', sku: 'KOP-04', nama: 'Ice Roast (1 Shoot)', harga: 5000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_05', sku: 'KOP-05', nama: 'Ice Roast (2 Shoot)', harga: 7000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_06', sku: 'KOP-06', nama: 'Ice Roast (3 Shoot)', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_07', sku: 'KOP-07', nama: 'Palm Sugar Latte', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_08', sku: 'KOP-08', nama: 'Vanila Latte', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_09', sku: 'KOP-09', nama: 'Pandan Latte', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_10', sku: 'KOP-10', nama: 'Salted Caramel Latte', harga: 9000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_11', sku: 'KOP-11', nama: 'Milo Latte', harga: 10000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_12', sku: 'KOP-12', nama: 'Matcha Latte', harga: 10000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_13', sku: 'KOP-13', nama: 'Mango Milk', harga: 8000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_14', sku: 'KOP-14', nama: 'Robusta Gold', harga: 6000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_15', sku: 'KOP-15', nama: 'Arabica Gold', harga: 6000, kategori: 'minuman', subKategori: 'Coffee' },
  { id: 'kopi_16', sku: 'KOP-16', nama: 'Chocolate Coffee', harga: 8000, kategori: 'minuman', subKategori: 'Coffee' },

  // --- FOTO 4: BINTANG HOKKA DRINK (Varian Menu @ 8.000) ---
  // 1. Varian Chocolate (@ 8.000)
  { id: 'hokka_c1', sku: 'HOK-01', nama: 'Choco Almond', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c2', sku: 'HOK-02', nama: 'Dark Choco', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c3', sku: 'HOK-03', nama: 'Creamy Chocolate', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c4', sku: 'HOK-04', nama: 'Choco Banana', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c5', sku: 'HOK-05', nama: 'Blackforest', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c6', sku: 'HOK-06', nama: 'Choco Cookies', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c7', sku: 'HOK-07', nama: 'Choco Avocado', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c8', sku: 'HOK-08', nama: 'Black Choco Granule', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c9', sku: 'HOK-09', nama: 'Choco Hazelnut', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c10', sku: 'HOK-10', nama: 'Choco Cheese', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_c11', sku: 'HOK-11', nama: 'Choco Vanilla', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },

  // 2. Varian Fruity (@ 8.000)
  { id: 'hokka_f1', sku: 'HOK-12', nama: 'Mango', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f2', sku: 'HOK-13', nama: 'Grape', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f3', sku: 'HOK-14', nama: 'Blueberry', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f4', sku: 'HOK-15', nama: 'Strawberry', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f5', sku: 'HOK-16', nama: 'Avocado', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f6', sku: 'HOK-17', nama: 'Lychee', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f7', sku: 'HOK-18', nama: 'Lemon Tea', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f8', sku: 'HOK-19', nama: 'Durian', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_f9', sku: 'HOK-20', nama: 'Banana Oreo', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },

  // 3. Best Seller (@ 8.000)
  { id: 'hokka_b1', sku: 'HOK-21', nama: 'Matcha Greentea', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b2', sku: 'HOK-22', nama: 'Thai Tea', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b3', sku: 'HOK-23', nama: 'Vanilla Latte Drink', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b4', sku: 'HOK-24', nama: 'Vanilla Blue', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b5', sku: 'HOK-25', nama: 'Blue Velvet', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b6', sku: 'HOK-26', nama: 'Bubble Gum', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b7', sku: 'HOK-27', nama: 'Pink Bubblegum', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b8', sku: 'HOK-28', nama: 'Milktea', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b9', sku: 'HOK-29', nama: 'Red Velvet', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },
  { id: 'hokka_b10', sku: 'HOK-30', nama: 'Hazelnut', harga: 8000, kategori: 'minuman', subKategori: 'Hokka Drink' },

  // --- FOTO 5: SODA SERIES (6 Menu) ---
  { id: 'soda_1', sku: 'SOD-01', nama: 'Soda Lychee', harga: 8000, kategori: 'minuman', subKategori: 'Soda Series' },
  { id: 'soda_2', sku: 'SOD-02', nama: 'Soda Mango', harga: 8000, kategori: 'minuman', subKategori: 'Soda Series' },
  { id: 'soda_3', sku: 'SOD-03', nama: 'Soda Frambozen', harga: 8000, kategori: 'minuman', subKategori: 'Soda Series' },
  { id: 'soda_4', sku: 'SOD-04', nama: 'Soda Melon', harga: 8000, kategori: 'minuman', subKategori: 'Soda Series' },
  { id: 'soda_5', sku: 'SOD-05', nama: 'Blue Curacao', harga: 10000, kategori: 'minuman', subKategori: 'Soda Series' },
  { id: 'soda_6', sku: 'SOD-06', nama: 'Soda Gembira', harga: 15000, kategori: 'minuman', subKategori: 'Soda Series' },

  // --- FOTO 6 & 7: MENU POP ICE (Semua Varian @ 5.000) ---
  { id: 'pop_01', sku: 'POP-01', nama: 'Pop Ice Matcha', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_02', sku: 'POP-02', nama: 'Pop Ice Cotton Candy', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_03', sku: 'POP-03', nama: 'Pop Ice Bubble Gum', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_04', sku: 'POP-04', nama: 'Pop Ice Muscat Candy', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_05', sku: 'POP-05', nama: 'Pop Ice Brown Sugar', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_06', sku: 'POP-06', nama: 'Pop Ice Marie Biskuit', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_07', sku: 'POP-07', nama: 'Pop Ice Coklat', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_08', sku: 'POP-08', nama: 'Pop Ice Vanilla Blue', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_09', sku: 'POP-09', nama: 'Pop Ice Anggur', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_10', sku: 'POP-10', nama: 'Pop Ice Blueberry', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_11', sku: 'POP-11', nama: 'Pop Ice Permen Karet', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_12', sku: 'POP-12', nama: 'Pop Ice Durian', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_13', sku: 'POP-13', nama: 'Pop Ice Strawberry', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_14', sku: 'POP-14', nama: 'Pop Ice Mango', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_15', sku: 'POP-15', nama: 'Pop Ice Melon', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_16', sku: 'POP-16', nama: 'Pop Ice Taro', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_17', sku: 'POP-17', nama: 'Pop Ice Cappuccino', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_18', sku: 'POP-18', nama: 'Pop Ice Vanilla Latte', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_19', sku: 'POP-19', nama: 'Pop Ice Moccacino', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_20', sku: 'POP-20', nama: 'Pop Ice Choco Cookies', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_21', sku: 'POP-21', nama: 'Pop Ice Matcha Caramel Latte', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_22', sku: 'POP-22', nama: 'Pop Ice Matcha Cookies Latte', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_23', sku: 'POP-23', nama: 'Pop Ice Matcha Coffee Latte', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_24', sku: 'POP-24', nama: 'Pop Ice Cioccolato', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_25', sku: 'POP-25', nama: 'Pop Ice Cookies & Cream', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_26', sku: 'POP-26', nama: 'Pop Ice Cheesy Red Velvet', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_27', sku: 'POP-27', nama: 'Pop Ice Popcorn Caramel', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_28', sku: 'POP-28', nama: 'Pop Ice Avocado Cappuccino', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_29', sku: 'POP-29', nama: 'Pop Ice White Coffee', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_30', sku: 'POP-30', nama: 'Pop Ice Durian Cappuccino', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_31', sku: 'POP-31', nama: 'Pop Ice Coffee Latte', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
  { id: 'pop_32', sku: 'POP-32', nama: 'Pop Ice Lychee', harga: 5000, kategori: 'minuman', subKategori: 'Pop Ice' },
];

export const DEFAULT_OUTLET_STOCKS: Record<string, Record<string, number>> = {
  nusama: {},
  nusa_indah: {},
};

export function cleanAndDeduplicateState(state: AppState): AppState {
  if (!state || !state.outlets) return state;

  const uniqueOutlets: Record<string, OutletInfo> = {};
  const uniqueData: Record<string, OutletData> = {};
  const seenNames = new Map<string, string>(); // normalized name -> primary key

  // Urutkan kunci: utamakan 'nusama' dan 'nusa_indah' sebagai kunci standar
  const keys = Object.keys(state.outlets).sort((a, b) => {
    const isAStandard = a === 'nusama' || a === 'nusa_indah';
    const isBStandard = b === 'nusama' || b === 'nusa_indah';
    if (isAStandard && !isBStandard) return -1;
    if (!isAStandard && isBStandard) return 1;
    return a.localeCompare(b);
  });

  for (const key of keys) {
    const outlet = state.outlets[key];
    if (!outlet || !outlet.name) continue;

    const normalizedName = outlet.name.trim().toLowerCase();

    if (seenNames.has(normalizedName)) {
      // Jika duplikat nama ditemukan, jangan buat ganda!
      // Gabungkan data penjualan jika entri duplikat memiliki transaksi
      const primaryKey = seenNames.get(normalizedName)!;
      const dupData = state.data[key];
      const primaryData = uniqueData[primaryKey];

      if (dupData && primaryData) {
        (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
          if (
            dupData[shift]?.produkList?.length > 0 &&
            (!primaryData[shift]?.produkList || primaryData[shift].produkList.length === 0)
          ) {
            primaryData[shift].produkList = dupData[shift].produkList;
            primaryData[shift].modalAwal = dupData[shift].modalAwal;
            primaryData[shift].cupAwal = dupData[shift].cupAwal;
          }
        });
      }
    } else {
      // Entri pertama: simpan sebagai entri tunggal yang sah
      seenNames.set(normalizedName, key);
      uniqueOutlets[key] = { name: outlet.name.trim() };
      uniqueData[key] = state.data[key] || {
        activeShift: 'pagi',
        pagi: createEmptyShift(500000, 80),
        sore: createEmptyShift(500000, 80),
      };
    }
  }

  // Pastikan activeOutlet mengarah ke kunci yang valid
  const validKeys = Object.keys(uniqueOutlets);
  let activeOutlet = state.activeOutlet;
  if (!uniqueOutlets[activeOutlet] && validKeys.length > 0) {
    activeOutlet = validKeys[0];
  }

  // Master products: Jika masih berisi produk default lama (Kopi Susu Gula Aren dsb) atau kosong, migrasikan ke DEFAULT_MASTER_PRODUCTS (Bintang Hokka Drink)
  const isOldDefaultList =
    state.masterProducts &&
    state.masterProducts.length > 0 &&
    state.masterProducts.some((p) => p.id === 'prod_1' || p.nama === 'Kopi Susu Gula Aren');

  const masterProducts =
    !state.masterProducts || state.masterProducts.length === 0 || isOldDefaultList
      ? DEFAULT_MASTER_PRODUCTS
      : state.masterProducts;

  const outletStocks = state.outletStocks || DEFAULT_OUTLET_STOCKS;
  const adminPin = state.adminPin || 'admin123';
  const businessConfig =
    state.businessConfig && state.businessConfig.businessName !== 'Kopi Nusantara & Kitchen'
      ? state.businessConfig
      : DEFAULT_BUSINESS_CONFIG;

  // Bersihkan transaksi demo lama jika ditemukan agar profit & omset kembali ke 0 bersih
  const OLD_DEMO_NAMES = new Set([
    'kopi susu gula aren',
    'kentang goreng original',
    'matcha latte ice',
    'toast cokelat keju',
    'americano ice',
    'roti bakar kaya butter',
    'cafe latte (normal)',
    'dimsum goreng keju',
    'choco almond',
  ]);

  Object.keys(uniqueData).forEach((oKey) => {
    (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
      const s = uniqueData[oKey][shift];
      if (s && s.produkList && s.produkList.length > 0) {
        s.produkList = s.produkList.filter(
          (p) => !OLD_DEMO_NAMES.has((p.nama || '').trim().toLowerCase())
        );
      }
    });
  });

  return {
    ...state,
    activeOutlet,
    outlets: uniqueOutlets,
    data: uniqueData,
    businessConfig,
    masterProducts,
    outletStocks,
    adminPin,
  };
}

export function formatRupiah(number: number): string {
  const num = Math.round(number) || 0;
  return 'Rp' + num.toLocaleString('id-ID');
}

export function formatNumber(number: number): string {
  const num = Math.round(number) || 0;
  return num.toLocaleString('id-ID');
}

export function parseRupiah(str: string | number | undefined | null): number {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function createEmptyShift(modalAwal = 500000, cupAwal = 80): ShiftData {
  return {
    modalAwal: Number.isFinite(modalAwal) ? modalAwal : 500000,
    cupAwal: Number.isFinite(cupAwal) ? Math.max(0, cupAwal) : 80,
    cupTerjualManual: null,
    cashAktual: 0,
    produkList: [],
    pengeluaranList: [],
    gratisList: [],
  };
}

export const INITIAL_APP_STATE: AppState = {
  activeOutlet: 'nusama',
  outlets: {
    nusama: { name: 'Outlet Nusama' },
    nusa_indah: { name: 'Outlet Nusa Indah' },
  },
  data: {
    nusama: {
      activeShift: 'pagi',
      pagi: createEmptyShift(500000, 80),
      sore: createEmptyShift(500000, 80),
    },
    nusa_indah: {
      activeShift: 'pagi',
      pagi: createEmptyShift(300000, 60),
      sore: createEmptyShift(300000, 60),
    },
  },
  masterProducts: DEFAULT_MASTER_PRODUCTS,
  outletStocks: DEFAULT_OUTLET_STOCKS,
  adminPin: 'admin123',
  businessConfig: DEFAULT_BUSINESS_CONFIG,
};

export function downloadCSVFile(filename: string, content: string): boolean {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  } catch (error) {
    console.error('Gagal membuat download CSV:', error);
    return false;
  }
}

export function generateRekapanCSV(appState: AppState, filterOutlet = 'all'): string {
  const rows: string[] = [];
  rows.push(['Tanggal', 'Outlet', 'Shift', 'Order ID', 'No Order', 'Kategori', 'Nama Produk', 'Harga Satuan', 'Qty / Jumlah', 'Metode Bayar', 'Total Omset', 'Bukti QRIS'].join(','));

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID');

  const outletKeys = Object.keys(appState.outlets);
  outletKeys.forEach((oKey) => {
    if (filterOutlet !== 'all' && oKey !== filterOutlet) return;
    const oName = appState.outlets[oKey]?.name || oKey;
    const oData = appState.data[oKey];
    if (!oData) return;

    (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
      const shiftData = oData[shift];
      if (!shiftData || !shiftData.produkList) return;

      shiftData.produkList.forEach((p) => {
        const row = [
          `"${dateStr}"`,
          `"${oName}"`,
          `"${shift.toUpperCase()}"`,
          `"${p.orderId || '-'}"`,
          `"${p.orderNo || '-'}"`,
          `"${p.kategori === 'makanan' ? 'Makanan' : 'Minuman'}"`,
          `"${(p.nama || '').replace(/"/g, '""')}"`,
          `${p.harga || 0}`,
          `${p.cup || 1}`,
          `"${p.metode || 'CASH'}"`,
          `${p.total || 0}`,
          `"${p.qrisProofUrl ? 'ADA FOTO QRIS' : '-'}"`,
        ];
        rows.push(row.join(','));
      });
    });
  });

  return '\uFEFF' + rows.join('\n');
}

export interface ProfitMetrics {
  daily: { omset: number; expense: number; profit: number; ordersCount: number; itemsCount: number };
  weekly: { omset: number; expense: number; profit: number; ordersCount: number; itemsCount: number };
  monthly: { omset: number; expense: number; profit: number; ordersCount: number; itemsCount: number };
}

export function calculateProfitMetrics(appState: AppState): ProfitMetrics {
  let totalOmset = 0;
  let totalExpense = 0;
  let totalCostEstimate = 0;
  let totalOrders = 0;
  let totalItems = 0;

  // Map product names / IDs to HPP
  const hppMap: Record<string, number> = {};
  (appState.masterProducts || DEFAULT_MASTER_PRODUCTS).forEach((mp) => {
    hppMap[mp.nama.toLowerCase()] = mp.hpp || Math.round(mp.harga * 0.4);
    hppMap[mp.id] = mp.hpp || Math.round(mp.harga * 0.4);
  });

  Object.values(appState.data || {}).forEach((outletData) => {
    (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
      const s = outletData[shift];
      if (!s) return;

      (s.produkList || []).forEach((p) => {
        const qty = Math.max(1, p.cup || 1);
        const subtotal = p.total || p.harga * qty;
        totalOmset += subtotal;
        totalItems += qty;

        const hpp = hppMap[p.nama.toLowerCase()] || Math.round((p.harga || 0) * 0.4);
        totalCostEstimate += hpp * qty;
      });

      const uniqueOrderIds = new Set((s.produkList || []).map((p) => p.orderId || `${p.orderNo}`).filter(Boolean));
      totalOrders += uniqueOrderIds.size;

      (s.pengeluaranList || []).forEach((e) => {
        totalExpense += e.nominal || 0;
      });
    });
  });

  // Daily profit = Omset - Pengeluaran - Estimasi HPP
  const dailyProfit = totalOmset - totalExpense - totalCostEstimate;

  // Weekly & Monthly projections / historical simulation based on current shifts
  return {
    daily: {
      omset: totalOmset,
      expense: totalExpense,
      profit: Math.max(0, dailyProfit),
      ordersCount: totalOrders,
      itemsCount: totalItems,
    },
    weekly: {
      omset: totalOmset * 6.5,
      expense: totalExpense * 6.5,
      profit: Math.max(0, dailyProfit * 6.5),
      ordersCount: Math.round(totalOrders * 6.5),
      itemsCount: Math.round(totalItems * 6.5),
    },
    monthly: {
      omset: totalOmset * 28,
      expense: totalExpense * 28,
      profit: Math.max(0, dailyProfit * 28),
      ordersCount: Math.round(totalOrders * 28),
      itemsCount: Math.round(totalItems * 28),
    },
  };
}

export function downloadTXTFile(filename: string, content: string): boolean {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  } catch (error) {
    console.error('Gagal membuat download TXT:', error);
    return false;
  }
}

export function generateOutletSummaryText(
  appState: AppState,
  outletKey: string
): string {
  const outlet = appState.outlets[outletKey];
  const oData = appState.data[outletKey];
  const oName = outlet?.name || outletKey;
  const address = outlet?.address || appState.businessConfig?.address || '';
  const phone = outlet?.phone || appState.businessConfig?.phone || '';
  const businessName = outlet?.receiptHeader || appState.businessConfig?.businessName || 'Kopi Nusantara';

  const now = new Date();
  const hari = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const tanggal = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const waktu = now.toLocaleTimeString('id-ID');

  let text = `=================================================\n`;
  text += `      REKAPAN PENJUALAN OUTLET TERPISAH\n`;
  text += `=================================================\n`;
  text += `Nama Usaha    : ${businessName}\n`;
  text += `Nama Outlet   : ${oName}\n`;
  if (address) text += `Alamat        : ${address}\n`;
  if (phone) text += `Kontak/Telp   : ${phone}\n`;
  text += `Tanggal Rekap : ${hari}, ${tanggal} (${waktu})\n`;
  text += `=================================================\n\n`;

  if (!oData) {
    text += `Belum ada data shift untuk outlet ini.\n`;
    return '\uFEFF' + text;
  }

  let totalOutletOmset = 0;
  let totalOutletCash = 0;
  let totalOutletQR = 0;
  let totalOutletExpenses = 0;
  let totalOutletMinuman = 0;
  let totalOutletMakanan = 0;

  (['pagi', 'sore'] as ShiftType[]).forEach((shift) => {
    const s = oData[shift];
    if (!s) return;

    const shiftLabel = shift === 'pagi' ? 'SHIFT PAGI' : 'SHIFT SORE';
    let shiftCash = 0;
    let shiftQR = 0;
    let shiftMinuman = 0;
    let shiftMakanan = 0;

    (s.produkList || []).forEach((p) => {
      const qty = Math.max(1, Number(p.cup || 1));
      const total = Number(p.total || Number(p.harga || 0) * qty);
      if (p.kategori === 'makanan') {
        shiftMakanan += qty;
      } else {
        shiftMinuman += qty;
      }

      const metode = String(p.metode || 'CASH').toUpperCase();
      if (metode === 'QR' || metode === 'QRIS') {
        shiftQR += total;
      } else {
        shiftCash += total;
      }
    });

    const shiftExpense = (s.pengeluaranList || []).reduce((sum, e) => sum + (e.nominal || 0), 0);
    const shiftOmset = shiftCash + shiftQR;

    totalOutletOmset += shiftOmset;
    totalOutletCash += shiftCash;
    totalOutletQR += shiftQR;
    totalOutletExpenses += shiftExpense;
    totalOutletMinuman += shiftMinuman;
    totalOutletMakanan += shiftMakanan;

    text += `-------------------------------------------------\n`;
    text += `>>> ${shiftLabel}\n`;
    text += `-------------------------------------------------\n`;
    text += `Modal Awal            : ${formatRupiah(s.modalAwal || 0)}\n`;
    text += `Omset Cash            : ${formatRupiah(shiftCash)}\n`;
    text += `Omset QRIS            : ${formatRupiah(shiftQR)}\n`;
    text += `Total Omset Shift     : ${formatRupiah(shiftOmset)}\n`;
    text += `Total Pengeluaran Kas : ${formatRupiah(shiftExpense)}\n`;
    text += `Cash Aktual Laci      : ${formatRupiah(s.cashAktual || 0)}\n`;
    text += `Item Terjual          : ${shiftMinuman} CUP Minuman | ${shiftMakanan} PCS Makanan\n\n`;

    if (s.produkList && s.produkList.length > 0) {
      text += `Daftar Penjualan Produk (${shiftLabel}):\n`;
      s.produkList.forEach((item, idx) => {
        const qty = item.cup || 1;
        const unit = item.kategori === 'makanan' ? 'pcs' : 'cup';
        const sub = item.total || item.harga * qty;
        text += `  ${idx + 1}. ${item.nama} (${qty} ${unit}) [${item.metode || 'CASH'}] = ${formatRupiah(sub)}\n`;
      });
      text += `\n`;
    }

    if (s.pengeluaranList && s.pengeluaranList.length > 0) {
      text += `Pengeluaran Kas (${shiftLabel}):\n`;
      s.pengeluaranList.forEach((e, idx) => {
        text += `  ${idx + 1}. ${e.keterangan}: ${formatRupiah(e.nominal)}\n`;
      });
      text += `\n`;
    }
  });

  text += `=================================================\n`;
  text += `RINGKASAN AKUMULASI OUTLET (${oName.toUpperCase()}):\n`;
  text += `=================================================\n`;
  text += `Total Minuman Terjual : ${totalOutletMinuman} CUP\n`;
  text += `Total Makanan Terjual : ${totalOutletMakanan} PCS\n`;
  text += `Total Omset Tunai     : ${formatRupiah(totalOutletCash)}\n`;
  text += `Total Omset QRIS      : ${formatRupiah(totalOutletQR)}\n`;
  text += `TOTAL OMSET KOTOR     : ${formatRupiah(totalOutletOmset)}\n`;
  text += `Total Belanja / Biaya : ${formatRupiah(totalOutletExpenses)}\n`;
  text += `OMSET BERSIH OUTLET   : ${formatRupiah(totalOutletOmset - totalOutletExpenses)}\n`;
  text += `=================================================\n`;
  text += `Dicetak otomatis oleh Sistem POS & Rekap Pusat\n`;

  return '\uFEFF' + text;
}

export function generateRekapanTXT(
  current: ShiftData,
  outletName: string,
  shiftType: ShiftType
): string {
  const shiftName = shiftType === 'sore' ? 'SHIFT SORE' : 'SHIFT PAGI';
  const now = new Date();
  const hari = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const tanggal = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const waktu = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const produkList = current.produkList || [];
  const gratisList = current.gratisList || [];
  const pengeluaranList = current.pengeluaranList || [];

  let totalCupAuto = 0;
  let totalMakananAuto = 0;
  let totalCash = 0;
  let totalQR = 0;

  produkList.forEach((item) => {
    const qty = Math.max(1, Number(item.cup || 1));
    const total = Number(item.total || Number(item.harga || 0) * qty);
    if (item.kategori === 'makanan') totalMakananAuto += qty;
    else totalCupAuto += qty;

    const metode = String(item.metode || 'CASH').trim().toUpperCase();
    if (metode === 'QR' || metode === 'QRIS') totalQR += total;
    else totalCash += total;
  });

  let cupGratisCount = 0;
  gratisList.forEach((g) => {
    const qty = Math.max(1, Number(g.cup || 1));
    if (g.kategori !== 'makanan') cupGratisCount += qty;
  });

  const totalPengeluaran = pengeluaranList.reduce(
    (sum, p) => sum + Number(p.nominal || 0),
    0
  );
  const minTerjual =
    current.cupTerjualManual !== null ? current.cupTerjualManual : totalCupAuto;
  const totalCupTerpakai = minTerjual + cupGratisCount;
  const sisaCup = Number(current.cupAwal || 0) - totalCupTerpakai;
  const totalOmset = totalCash + totalQR;
  const cashSeharusnya =
    Number(current.modalAwal || 0) + totalCash - totalPengeluaran;
  const cashAktual = Number(current.cashAktual || 0);
  const selisih = cashAktual - cashSeharusnya;

  const rupiah = (val: number) => formatRupiah(val);
  const signedRupiah = (val: number) =>
    val < 0 ? `-${rupiah(Math.abs(val))}` : rupiah(val);

  // Group by order
  const groupedOrders: Record<string, { orderNo: number; items: ProductItem[] }> = {};
  produkList.forEach((item, idx) => {
    const key = item.orderId || `LEGACY-${item.orderNo || idx + 1}`;
    if (!groupedOrders[key]) {
      groupedOrders[key] = { orderNo: Number(item.orderNo || 0), items: [] };
    }
    groupedOrders[key].items.push(item);
  });

  const orders = Object.values(groupedOrders).sort((a, b) => {
    const ao = a.orderNo || 999999;
    const bo = b.orderNo || 999999;
    return ao - bo;
  });

  let text = `=================================================\n`;
  text += `      REKAPAN OMSET PENJUALAN - ${shiftName}\n`;
  text += `=================================================\n`;
  text += `Outlet        : ${outletName}\n`;
  text += `Tanggal       : ${hari}, ${tanggal}\n`;
  text += `Waktu Unduh   : ${waktu}\n`;
  text += `Shift         : ${shiftName}\n`;
  text += `-------------------------------------------------\n`;
  text += `RINGKASAN KEUANGAN & STOK ITEM:\n`;
  text += `Modal Awal           : ${rupiah(current.modalAwal || 0)}\n`;
  text += `Stok Cup Awal        : ${current.cupAwal || 0} CUP\n`;
  text += `Minuman Terjual      : ${minTerjual} CUP\n`;
  text += `Makanan Terjual      : ${totalMakananAuto} PCS\n`;
  text += `Cup Tanpa Bayar      : ${cupGratisCount} CUP\n`;
  text += `Total Cup Terpakai   : ${totalCupTerpakai} CUP\n`;
  text += `Sisa Cup Fisik       : ${sisaCup} CUP\n`;
  text += `-------------------------------------------------\n`;
  text += `Omset Cash           : ${rupiah(totalCash)}\n`;
  text += `Omset QR/QRIS        : ${rupiah(totalQR)}\n`;
  text += `TOTAL OMSET          : ${rupiah(totalOmset)}\n`;
  text += `-------------------------------------------------\n`;
  text += `Cash Seharusnya      : ${rupiah(cashSeharusnya)}\n`;
  text += `Cash Aktual (Laci)   : ${rupiah(cashAktual)}\n`;
  text += `Selisih Cash         : ${signedRupiah(selisih)}\n`;

  let statusClosing = 'CLOSING SESUAI';
  if (selisih < 0) statusClosing = `CASH KURANG ${rupiah(Math.abs(selisih))}`;
  else if (selisih > 0) statusClosing = `CASH LEBIH ${rupiah(selisih)}`;
  text += `STATUS CLOSING       : ${statusClosing}\n`;
  text += `=================================================\n\n`;

  text += `RINCIAN TRANSAKSI & OMSET PRODUK:\n`;
  if (!orders.length) {
    text += `- Tidak ada transaksi -\n`;
  } else {
    let nomorTransaksi = 1;
    orders.forEach((order, orderIndex) => {
      const nomorOrder = order.orderNo || orderIndex + 1;
      const totalOrder = order.items.reduce((sum, item) => {
        const qty = Math.max(1, Number(item.cup || 1));
        return sum + Number(item.total || Number(item.harga || 0) * qty);
      }, 0);

      text += `ORDER #${nomorOrder} | TOTAL ORDER: ${rupiah(totalOrder)}\n`;
      order.items.forEach((item) => {
        const qty = Math.max(1, Number(item.cup || 1));
        const unit = item.kategori === 'makanan' ? 'Pcs' : 'Cup';
        const total = Number(item.total || Number(item.harga || 0) * qty);
        const kat = item.kategori === 'makanan' ? 'Makanan' : 'Minuman';
        const metode = String(item.metode || 'CASH').trim().toUpperCase();
        text += `${nomorTransaksi}. [${kat}] ${item.nama} | ${rupiah(
          item.harga || 0
        )} x ${qty} ${unit} | [${metode}] | Omset: ${rupiah(total)}\n`;
        nomorTransaksi++;
      });
      if (orderIndex < orders.length - 1)
        text += `-------------------------------------------------\n`;
    });
  }

  text += `\n-------------------------------------------------\n`;
  text += `PENGAMBILAN TANPA BAYAR (GRATIS / INTERNAL):\n`;
  if (!gratisList.length) {
    text += `- Tidak ada pengambilan tanpa bayar -\n`;
  } else {
    gratisList.forEach((g, idx) => {
      const qty = Math.max(1, Number(g.cup || 1));
      const unit = g.kategori === 'makanan' ? 'PCS' : 'CUP';
      text += `${idx + 1}. ${g.keterangan || 'Pengambilan internal'} | ${qty} ${unit}\n`;
    });
  }

  if (pengeluaranList.length) {
    text += `\n-------------------------------------------------\n`;
    text += `PENGELUARAN KAS:\n`;
    pengeluaranList.forEach((p, idx) => {
      text += `${idx + 1}. ${p.keterangan || '-'} | ${rupiah(p.nominal || 0)}\n`;
    });
  }

  text += `=================================================\n`;
  return '\uFEFF' + text;
}
