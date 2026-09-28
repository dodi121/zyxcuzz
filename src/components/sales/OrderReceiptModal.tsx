import React, { useRef } from 'react';
import { ProductItem, BusinessConfig, OutletInfo } from '../../types/sales';
import { formatRupiah } from '../../utils/salesHelpers';
import { Printer, X, Store, Image, Phone, MapPin } from 'lucide-react';

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: ProductItem[];
  orderNo?: number;
  outletName: string;
  outletInfo?: OutletInfo;
  businessConfig?: BusinessConfig;
  shiftName: string;
  cashDiterima?: number;
  kembalian?: number;
  qrisProofUrl?: string;
  paymentMethod?: string;
  notes?: string;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  orderNo = 1,
  outletName,
  outletInfo,
  businessConfig,
  shiftName,
  cashDiterima = 0,
  kembalian = 0,
  qrisProofUrl,
  paymentMethod = 'CASH',
  notes,
}) => {
  if (!isOpen || orderItems.length === 0) return null;

  const totalOmset = orderItems.reduce(
    (sum, item) => sum + (item.total || item.harga * (item.cup || 1)),
    0
  );
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Business branding logic per outlet (outlet-specific settings take precedence)
  const logo = outletInfo?.logoUrl || businessConfig?.logoUrl;
  const brandName = outletInfo?.receiptHeader || businessConfig?.businessName || outletName;
  const tagline = outletInfo?.tagline || businessConfig?.tagline;
  const subBranch = outletName !== brandName ? outletName : undefined;
  const address = outletInfo?.address || businessConfig?.address;
  const phone = outletInfo?.phone || businessConfig?.phone;
  const footerText = outletInfo?.footerText || businessConfig?.footerText || 'Terima kasih atas kunjungan Anda!';

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal - Hidden on Print */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer size={18} />
            <span className="font-bold text-sm">Struk Pembelian Kasir</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Thermal Receipt Paper (Visible on screen and on print) */}
        <div id="orderReceiptPrintArea" className="p-6 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 bg-amber-50/20 dark:bg-slate-950/40">
          {/* HEADER DENGAN LOGO DAN NAMA USAHA */}
          <div className="text-center space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            {/* Logo Usaha (Gambar atau Default Icon) */}
            {logo ? (
              <div className="flex justify-center mb-1">
                <img
                  src={logo}
                  alt={brandName}
                  className="max-h-16 max-w-[120px] object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-1">
                <Store size={22} />
              </div>
            )}

            {/* Nama Usaha / Kop Struk */}
            <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider leading-tight">
              {brandName}
            </h3>

            {/* Slogan / Tagline */}
            {tagline && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {tagline}
              </p>
            )}

            {/* Sub-branch / Nama Outlet */}
            {subBranch && (
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {subBranch}
              </p>
            )}

            {/* Alamat & Telepon */}
            {address && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {address}
              </p>
            )}
            {phone && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Telp: {phone}
              </p>
            )}

            <div className="pt-1.5 border-t border-dotted border-slate-200 dark:border-slate-800 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{dateStr} · {timeStr}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                SHIFT {shiftName.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black tracking-wide">
              ORDER #{orderNo}
            </p>
          </div>

          {/* List Items */}
          <div className="space-y-2 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            {orderItems.map((item, idx) => {
              const qty = Math.max(1, item.cup || 1);
              const unit = item.kategori === 'makanan' ? 'pcs' : 'cup';
              const sub = item.total || item.harga * qty;
              return (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.nama}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {qty} {unit} × {formatRupiah(item.harga)}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatRupiah(sub)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catatan Order Tambahan */}
          {notes && (
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 border-b border-dashed border-slate-300 dark:border-slate-700">
              <span className="font-bold block text-[10px] uppercase text-slate-500">Catatan:</span>
              <p className="italic">"{notes}"</p>
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 text-xs">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{formatRupiah(totalOmset)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>Metode Bayar</span>
              <span className="font-bold uppercase text-slate-800 dark:text-slate-200">{paymentMethod}</span>
            </div>
            {paymentMethod === 'CASH' && cashDiterima > 0 && (
              <>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Tunai Diterima</span>
                  <span className="font-semibold">{formatRupiah(cashDiterima)}</span>
                </div>
                <div className="flex justify-between font-bold text-[11px]">
                  <span>Kembalian</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(kembalian)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Receipt */}
          <div className="text-center text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
            <p className="font-bold">{footerText}</p>
            <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
          </div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
