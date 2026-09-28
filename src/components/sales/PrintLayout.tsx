import React from 'react';
import { ShiftData, ShiftType, BusinessConfig, OutletInfo } from '../../types/sales';
import { formatRupiah, formatNumber } from '../../utils/salesHelpers';

interface PrintLayoutProps {
  currentShiftData: ShiftData;
  outletName: string;
  shiftType: ShiftType;
  businessConfig?: BusinessConfig;
  outletInfo?: OutletInfo;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  currentShiftData,
  outletName,
  shiftType,
  businessConfig,
  outletInfo,
}) => {
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
  const address = outletInfo?.address || businessConfig?.address;
  const phone = outletInfo?.phone || businessConfig?.phone;

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

  return (
    <div id="printArea" className="hidden">
      <div style={{ fontFamily: 'monospace', maxWidth: '350px', margin: 'auto', padding: '10px' }}>
        <div
          style={{
            textAlign: 'center',
            borderBottom: '1px dashed #000',
            paddingBottom: '8px',
            marginBottom: '10px',
          }}
        >
          {logo && (
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <img
                src={logo}
                alt="Logo Usaha"
                style={{
                  maxHeight: '48px',
                  maxWidth: '120px',
                  margin: '0 auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>
            {brandName}
          </h1>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: '2px 0 0 0', textTransform: 'uppercase' }}>
            {outletName}
          </h2>
          {address && (
            <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#444' }}>{address}</p>
          )}
          {phone && (
            <p style={{ fontSize: '10px', margin: '1px 0 0 0', color: '#444' }}>Telp: {phone}</p>
          )}
          <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{shiftLabel}</p>
          <p style={{ fontSize: '11px', margin: '3px 0 0 0' }}>Tanggal: {dateStr}</p>
          <p style={{ fontSize: '11px', margin: '1px 0 0 0' }}>Jam: {timeStr}</p>
        </div>

        <table style={{ width: '100%', fontSize: '11px', marginBottom: '10px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td>Modal Awal</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatRupiah(currentShiftData.modalAwal || 0)}
              </td>
            </tr>
            <tr>
              <td>Cup Awal</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {currentShiftData.cupAwal || 0} CUP
              </td>
            </tr>
            <tr>
              <td>Minuman Terjual</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{minTerjual} CUP</td>
            </tr>
            <tr>
              <td>Makanan Terjual</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{totalMakananAuto} PCS</td>
            </tr>
            <tr>
              <td>Cup Gratis / Non-Bayar</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{cupGratisCount} CUP</td>
            </tr>
            <tr style={{ fontWeight: 'bold', background: '#f1f5f9' }}>
              <td>Total Cup Keluar</td>
              <td style={{ textAlign: 'right' }}>{minTerjual + cupGratisCount} CUP</td>
            </tr>
            <tr>
              <td>Sisa Cup Fisik</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{sisaCup} CUP</td>
            </tr>
            <tr>
              <td>Omset Cash</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(totalCash)}</td>
            </tr>
            <tr>
              <td>Omset QR</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(totalQR)}</td>
            </tr>
            <tr>
              <td>Total Pengeluaran</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatRupiah(totalPengeluaran)}
              </td>
            </tr>
            <tr style={{ borderTop: '1px dashed #000', fontWeight: 'bold' }}>
              <td style={{ paddingTop: '4px' }}>Total Omset Bersih</td>
              <td style={{ textAlign: 'right', paddingTop: '4px' }}>{formatRupiah(totalOmset)}</td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            borderTop: '1px dashed #000',
            paddingTop: '6px',
            fontSize: '11px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cash Seharusnya:</span>
            <strong>{formatRupiah(cashSeharusnya)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Cash Aktual:</span>
            <strong>{formatRupiah(currentShiftData.cashAktual || 0)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Selisih:</span>
            <strong>{formatRupiah(Math.abs(selisih))}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2px',
              fontWeight: 'bold',
            }}
          >
            <span>Status Closing:</span>
            <span>
              {selisih === 0
                ? 'CLOSING SESUAI'
                : selisih < 0
                ? 'CASH KURANG'
                : 'CASH LEBIH'}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '11px' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Rincian Produk & Omset:</p>
          <table
            style={{
              width: '100%',
              fontSize: '10px',
              textAlign: 'left',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '2px 0' }}>Produk</th>
                <th style={{ padding: '2px 0', textAlign: 'right' }}>Harga</th>
                <th style={{ padding: '2px 0', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '2px 0', textAlign: 'center' }}>Bayar</th>
                <th style={{ padding: '2px 0', textAlign: 'right' }}>Omset</th>
              </tr>
            </thead>
            <tbody>
              {currentShiftData.produkList.map((item, idx) => {
                const qty = item.cup || 1;
                const unit = item.kategori === 'makanan' ? 'pcs' : 'cup';
                return (
                  <tr key={idx}>
                    <td style={{ padding: '2px 0' }}>{item.nama}</td>
                    <td style={{ padding: '2px 0', textAlign: 'right' }}>
                      {formatNumber(item.harga)}
                    </td>
                    <td style={{ padding: '2px 0', textAlign: 'center' }}>{qty} {unit}</td>
                    <td style={{ padding: '2px 0', textAlign: 'center' }}>{item.metode}</td>
                    <td style={{ padding: '2px 0', textAlign: 'right' }}>
                      {formatNumber(item.total || item.harga * qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {currentShiftData.pengeluaranList.length > 0 && (
          <div
            style={{
              borderTop: '1px dashed #000',
              paddingTop: '8px',
              marginTop: '8px',
              fontSize: '10px',
            }}
          >
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Pengeluaran Kas:</p>
            <ul style={{ margin: 0, paddingLeft: '15px' }}>
              {currentShiftData.pengeluaranList.map((p, idx) => (
                <li key={idx}>
                  {p.keterangan}: {formatRupiah(p.nominal)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentShiftData.gratisList.length > 0 && (
          <div
            style={{
              borderTop: '1px dashed #000',
              paddingTop: '8px',
              marginTop: '8px',
              fontSize: '10px',
            }}
          >
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Pengambilan Tanpa Bayar:</p>
            <ul style={{ margin: 0, paddingLeft: '15px' }}>
              {currentShiftData.gratisList.map((g, idx) => (
                <li key={idx}>
                  {g.keterangan} ({g.cup || 1} {g.kategori === 'makanan' ? 'Pcs' : 'Cup'})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '15px',
            fontSize: '10px',
            borderTop: '1px dashed #000',
            paddingTop: '8px',
          }}
        >
          {businessConfig?.footerText && (
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{businessConfig.footerText}</p>
          )}
          <p style={{ margin: '0' }}>-- Laporan Shift Ditutup --</p>
        </div>
      </div>
    </div>
  );
};
