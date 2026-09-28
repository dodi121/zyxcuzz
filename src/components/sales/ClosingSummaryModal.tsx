import React from 'react';
import { ShiftData, ShiftType, BusinessConfig, OutletInfo } from '../../types/sales';
import { formatRupiah, generateRekapanTXT, downloadTXTFile } from '../../utils/salesHelpers';

interface ClosingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShiftData: ShiftData;
  outletName: string;
  shiftType: ShiftType;
  onPrint: () => void;
  businessConfig?: BusinessConfig;
  outletInfo?: OutletInfo;
}

export const ClosingSummaryModal: React.FC<ClosingSummaryModalProps> = ({
  isOpen,
  onClose,
  currentShiftData,
  outletName,
  shiftType,
  onPrint,
  businessConfig,
  outletInfo,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const shiftLabel = shiftType === 'sore' ? 'SHIFT SORE' : 'SHIFT PAGI';
  const logo = outletInfo?.logoUrl || businessConfig?.logoUrl;
  const brandName = outletInfo?.receiptHeader || businessConfig?.businessName || outletName;

  // Calculate totals
  let totalCupAuto = 0;
  let totalMakananAuto = 0;
  let totalCash = 0;
  let totalQR = 0;

  currentShiftData.produkList.forEach((item) => {
    const isMakanan = item.kategori === 'makanan';
    const qty = item.cup || 1;
    if (isMakanan) totalMakananAuto += qty;
    else totalCupAuto += qty;

    const metode = String(item.metode || 'CASH').toUpperCase();
    const val = item.total || item.harga * qty;
    if (metode === 'QR' || metode === 'QRIS') {
      totalQR += val;
    } else {
      totalCash += val;
    }
  });

  let cupGratisCount = 0;
  currentShiftData.gratisList.forEach((g) => {
    if (g.kategori !== 'makanan') cupGratisCount += g.cup || 1;
  });

  const totalPengeluaran = currentShiftData.pengeluaranList.reduce(
    (sum, p) => sum + (p.nominal || 0),
    0
  );

  const minTerjual =
    currentShiftData.cupTerjualManual !== null
      ? currentShiftData.cupTerjualManual
      : totalCupAuto;
  const sisaCup = (currentShiftData.cupAwal || 0) - minTerjual - cupGratisCount;
  const totalOmset = totalCash + totalQR;
  const cashSeharusnya =
    (currentShiftData.modalAwal || 0) + totalCash - totalPengeluaran;
  const selisih = (currentShiftData.cashAktual || 0) - cashSeharusnya;

  const handleDownloadTXT = () => {
    const content = generateRekapanTXT(currentShiftData, outletName, shiftType);
    const safeOutlet = outletName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
    const safeShift = shiftLabel.replace(/\s+/g, '_');
    const dateFile = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const filename = `Rekapan_Omset_${safeOutlet}_${safeShift}_${dateFile}.txt`;

    downloadTXTFile(filename, content);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-indigo-600 dark:text-indigo-400 text-lg"></i>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Ringkasan Closing Penjualan
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* TAMPILAN RESI CLOSING MODAL */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700 font-mono text-xs space-y-2 text-slate-800 dark:text-slate-200">
          <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            {logo && (
              <div className="flex justify-center mb-1.5">
                <img
                  src={logo}
                  alt={brandName}
                  className="max-h-12 max-w-[100px] object-contain rounded-md"
                />
              </div>
            )}
            <p className="font-extrabold text-sm uppercase text-slate-900 dark:text-white tracking-wider">
              {brandName}
            </p>
            <p className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">
              {outletName}
            </p>
            <p className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] mt-0.5">
              {shiftLabel}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tanggal: {dateStr} - {timeStr}
            </p>
          </div>

          <div className="space-y-1 py-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">MODAL AWAL</span>
              <span className="font-bold">{formatRupiah(currentShiftData.modalAwal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">CUP AWAL</span>
              <span className="font-bold">{currentShiftData.cupAwal || 0} CUP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">MINUMAN TERJUAL</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {minTerjual} CUP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">MAKANAN TERJUAL</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {totalMakananAuto} PCS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">CUP GRATIS / NON-BAYAR</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {cupGratisCount} CUP
              </span>
            </div>
            <div className="flex justify-between bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-1 rounded-md">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">TOTAL CUP KELUAR</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {minTerjual + cupGratisCount} CUP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">SISA CUP FISIK</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sisaCup} CUP</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">OMSET CASH</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {formatRupiah(totalCash)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">OMSET QR</span>
              <span className="font-bold text-sky-700 dark:text-sky-400">
                {formatRupiah(totalQR)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">TOTAL PENGELUARAN</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatRupiah(totalPengeluaran)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 font-bold">
              <span>TOTAL OMSET BERSIH</span>
              <span className="text-indigo-700 dark:text-indigo-400 font-extrabold">
                {formatRupiah(totalOmset)}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">CASH SEHARUSNYA</span>
              <span className="font-bold">{formatRupiah(cashSeharusnya)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">CASH AKTUAL</span>
              <span className="font-bold">
                {formatRupiah(currentShiftData.cashAktual || 0)}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>SELISIH</span>
              <span
                className={
                  selisih === 0
                    ? 'text-slate-800 dark:text-slate-200'
                    : selisih < 0
                    ? 'text-rose-600'
                    : 'text-sky-600'
                }
              >
                {formatRupiah(Math.abs(selisih))}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span>STATUS</span>
              {selisih === 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CLOSING SESUAI
                </span>
              ) : selisih < 0 ? (
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  CASH KURANG
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  CASH LEBIH
                </span>
              )}
            </div>
          </div>

          {/* Rincian Pengeluaran di Resi */}
          {currentShiftData.pengeluaranList.length > 0 && (
            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
              <p className="font-bold text-[11px] text-slate-600 dark:text-slate-300">
                Rincian Pengeluaran:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                {currentShiftData.pengeluaranList.map((p, idx) => (
                  <li key={idx}>
                    {p.keterangan}: {formatRupiah(p.nominal)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rincian Gratis di Resi */}
          {currentShiftData.gratisList.length > 0 && (
            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
              <p className="font-bold text-[11px] text-slate-600 dark:text-slate-300">
                Pengambilan Tanpa Bayar:
              </p>
              <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                {currentShiftData.gratisList.map((g, idx) => (
                  <li key={idx}>
                    {g.keterangan} ({g.cup || 1} {g.kategori === 'makanan' ? 'Pcs' : 'Cup'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleDownloadTXT}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-100 dark:shadow-none transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-download text-sm"></i>
            <span>UNDUH (.TXT)</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-print text-sm"></i>
            <span>CETAK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
