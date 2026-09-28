import React, { useState } from 'react';
import { ProductItem } from '../../types/sales';
import { formatRupiah } from '../../utils/salesHelpers';
import { Printer, Camera, Eye, Trash2, Edit3 } from 'lucide-react';

interface SalesTableProps {
  produkList: ProductItem[];
  onOpenEditModal: (index: number) => void;
  onDeleteProduct: (index: number) => void;
  onPrintReceipt?: (orderItems: ProductItem[], orderNo: number, meta?: any) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  produkList,
  onOpenEditModal,
  onDeleteProduct,
  onPrintReceipt,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Group products by Order
  const groupedOrders: Record<string, { orderNo: number; items: { item: ProductItem; idx: number }[] }> = {};
  produkList.forEach((item, idx) => {
    const key = item.orderId || `legacy-${idx}`;
    if (!groupedOrders[key]) {
      groupedOrders[key] = {
        orderNo: item.orderNo || 0,
        items: [],
      };
    }
    groupedOrders[key].items.push({ item, idx });
  });

  const orderGroups = Object.values(groupedOrders);
  const totalItemCount = produkList.length;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-indigo-600 dark:text-indigo-400"></i>
            <span>Daftar Transaksi Penjualan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rincian produk dan omset transaksi shift berjalan
          </p>
        </div>
        <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
          {orderGroups.length} Order · {totalItemCount} Produk
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-3.5 text-center w-12">No</th>
              <th className="py-3 px-3.5">Produk</th>
              <th className="py-3 px-3.5 text-center">Kategori</th>
              <th className="py-3 px-3.5 text-right">Harga</th>
              <th className="py-3 px-3.5 text-center">Qty / Jumlah</th>
              <th className="py-3 px-3.5 text-center">Bayar</th>
              <th className="py-3 px-3.5 text-right bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 border-x border-indigo-100 dark:border-indigo-900/60 font-extrabold">
                Omset
              </th>
              <th className="py-3 px-3.5 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {orderGroups.map((group, orderIdx) => {
              const orderNo = group.orderNo || orderIdx + 1;
              const orderTotal = group.items.reduce(
                (sum, e) => sum + (e.item.total || e.item.harga * (e.item.cup || 1)),
                0
              );
              const itemsList = group.items.map((e) => e.item);
              const firstItem = itemsList[0];

              return (
                <React.Fragment key={orderIdx}>
                  {/* Order header row */}
                  <tr className="bg-indigo-50/70 dark:bg-indigo-950/30 border-y border-indigo-100 dark:border-indigo-900/60">
                    <td colSpan={8} className="py-2.5 px-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-xs">
                            <i className="fa-solid fa-receipt"></i> ORDER #{orderNo}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                            {group.items.length} Produk
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 mr-2">
                            Total: {formatRupiah(orderTotal)}
                          </span>

                          {/* Tombol Cetak Struk per Order Kasir */}
                          {onPrintReceipt && (
                            <button
                              type="button"
                              onClick={() =>
                                onPrintReceipt(itemsList, orderNo, {
                                  cashDiterima: firstItem?.cashDiterima,
                                  kembalian: firstItem?.kembalian,
                                  qrisProofUrl: firstItem?.qrisProofUrl,
                                  paymentMethod: firstItem?.metode,
                                })
                              }
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Printer size={12} className="text-indigo-600 dark:text-indigo-400" />
                              <span>Cetak Struk</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Order items rows */}
                  {group.items.map(({ item, idx }, itemIdx) => {
                    const isMakanan = item.kategori === 'makanan';
                    const itemTotal = item.total || item.harga * (item.cup || 1);

                    return (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <td className="py-3 px-3.5 text-center font-semibold text-slate-400 text-xs">
                          {itemIdx + 1}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <span>{item.nama}</span>
                            {item.qrisProofUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImageUrl(item.qrisProofUrl!)}
                                className="text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1"
                                title="Lihat Foto Bukti QRIS"
                              >
                                <Camera size={10} />
                                <span>Foto QRIS</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-center">
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
                        <td className="py-3 px-3.5 text-right font-medium text-xs sm:text-sm">
                          {formatRupiah(item.harga)}
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-xs sm:text-sm">
                          <span>{item.cup || 1}</span>{' '}
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            {isMakanan ? 'pcs' : 'cup'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          {item.metode === 'QR' ? (
                            <span className="bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              QRIS
                            </span>
                          ) : (
                            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              CASH
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs sm:text-sm">
                          {formatRupiah(itemTotal)}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(idx)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition cursor-pointer"
                              title="Edit item"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus produk "${item.nama}"?`)) {
                                  onDeleteProduct(idx);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {produkList.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <i className="fa-solid fa-receipt text-4xl text-slate-300 dark:text-slate-700"></i>
            <p className="text-sm font-medium">
              Belum ada transaksi dimasukkan pada shift ini.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Gunakan form di sebelah kiri untuk menambah penjualan.
            </p>
          </div>
        )}
      </div>

      {/* QRIS Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-800 dark:text-white">
                Foto Bukti Pembayaran QRIS
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <img
              src={previewImageUrl}
              alt="Bukti QRIS"
              className="max-h-80 mx-auto rounded-xl object-contain shadow-sm border border-slate-200 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
