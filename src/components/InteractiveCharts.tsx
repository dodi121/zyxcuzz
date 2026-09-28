import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { RecapEntry } from '../types/recap';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface InteractiveChartsProps {
  entries: RecapEntry[];
  onSelectCategory?: (category: string) => void;
  onSelectStatus?: (status: string) => void;
  activeCategory?: string;
  activeStatus?: string;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  entries,
  onSelectCategory,
  onSelectStatus,
  activeCategory,
  activeStatus,
}) => {
  const [chartViewMode, setChartViewMode] = useState<'both' | 'income' | 'expense'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    income: number;
    expense: number;
    net: number;
    x: number;
    y: number;
  } | null>(null);

  // 1. Group by Date for Timeline Chart
  const timelineData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();

    // Sort entries by date ascending
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((e) => {
      if (e.status === 'cancelled') return;
      const current = map.get(e.date) || { income: 0, expense: 0 };
      if (e.type === 'income') {
        current.income += e.amount;
      } else {
        current.expense += e.amount;
      }
      map.set(e.date, current);
    });

    return Array.from(map.entries()).map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
      net: values.income - values.expense,
    }));
  }, [entries]);

  // 2. Group by Category
  const categoryData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; count: number }>();

    entries.forEach((e) => {
      if (e.status === 'cancelled') return;
      const cur = map.get(e.category) || { income: 0, expense: 0, count: 0 };
      if (e.type === 'income') cur.income += e.amount;
      else cur.expense += e.amount;
      cur.count += 1;
      map.set(e.category, cur);
    });

    const list = Array.from(map.entries()).map(([category, val]) => ({
      category,
      total: val.income + val.expense,
      income: val.income,
      expense: val.expense,
      count: val.count,
    }));

    list.sort((a, b) => b.total - a.total);
    return list;
  }, [entries]);

  // 3. Group by Status
  const statusData = useMemo(() => {
    const counts: Record<string, { count: number; totalAmount: number; label: string; color: string }> = {
      completed: { count: 0, totalAmount: 0, label: 'Selesai', color: '#10b981' },
      processing: { count: 0, totalAmount: 0, label: 'Diproses', color: '#3b82f6' },
      pending: { count: 0, totalAmount: 0, label: 'Menunggu', color: '#f59e0b' },
      cancelled: { count: 0, totalAmount: 0, label: 'Dibatalkan', color: '#f43f5e' },
    };

    entries.forEach((e) => {
      if (counts[e.status]) {
        counts[e.status].count += 1;
        counts[e.status].totalAmount += e.amount;
      }
    });

    const total = entries.length || 1;
    return Object.entries(counts).map(([key, val]) => ({
      key,
      ...val,
      percentage: Math.round((val.count / total) * 100),
    }));
  }, [entries]);

  // Chart coordinates calculation
  const maxTimelineVal = useMemo(() => {
    let max = 100000;
    timelineData.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15; // padding top
  }, [timelineData]);

  const chartWidth = 600;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 25;

  const pointsIncome = useMemo(() => {
    if (timelineData.length === 0) return '';
    if (timelineData.length === 1) {
      const y = chartHeight - paddingY - (timelineData[0].income / maxTimelineVal) * (chartHeight - paddingY * 2);
      return `M ${paddingX},${y} L ${chartWidth - paddingX},${y}`;
    }
    return timelineData
      .map((d, i) => {
        const x = paddingX + (i / (timelineData.length - 1)) * (chartWidth - paddingX * 2);
        const y = chartHeight - paddingY - (d.income / maxTimelineVal) * (chartHeight - paddingY * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [timelineData, maxTimelineVal]);

  const pointsExpense = useMemo(() => {
    if (timelineData.length === 0) return '';
    if (timelineData.length === 1) {
      const y = chartHeight - paddingY - (timelineData[0].expense / maxTimelineVal) * (chartHeight - paddingY * 2);
      return `M ${paddingX},${y} L ${chartWidth - paddingX},${y}`;
    }
    return timelineData
      .map((d, i) => {
        const x = paddingX + (i / (timelineData.length - 1)) * (chartWidth - paddingX * 2);
        const y = chartHeight - paddingY - (d.expense / maxTimelineVal) * (chartHeight - paddingY * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [timelineData, maxTimelineVal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Visual Timeline Rekapan Harian */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Tren Rekapitulasi Berkala</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pergerakan nominal pemasukan dan beban pengeluaran berdasarkan tanggal
              </p>
            </div>

            {/* Mode switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setChartViewMode('both')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartViewMode === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Keduanya
              </button>
              <button
                onClick={() => setChartViewMode('income')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartViewMode === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setChartViewMode('expense')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartViewMode === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          {timelineData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Calendar className="w-8 h-8 mb-2 opacity-50" />
              <span>Tidak ada data transaksi untuk ditampilkan</span>
            </div>
          ) : (
            <div className="relative mt-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0.25, 0.5, 0.75].map((pct, idx) => {
                  const y = paddingY + pct * (chartHeight - paddingY * 2);
                  const val = maxTimelineVal * (1 - pct);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        fontSize="9"
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        {formatRupiah(val, true)}
                      </text>
                    </g>
                  );
                })}

                {/* Income Area & Path */}
                {(chartViewMode === 'both' || chartViewMode === 'income') && pointsIncome && (
                  <>
                    <path
                      d={`${pointsIncome} L ${chartWidth - paddingX},${chartHeight - paddingY} L ${paddingX},${chartHeight - paddingY} Z`}
                      fill="url(#incomeGradient)"
                    />
                    <path
                      d={pointsIncome}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Expense Area & Path */}
                {(chartViewMode === 'both' || chartViewMode === 'expense') && pointsExpense && (
                  <>
                    <path
                      d={`${pointsExpense} L ${chartWidth - paddingX},${chartHeight - paddingY} L ${paddingX},${chartHeight - paddingY} Z`}
                      fill="url(#expenseGradient)"
                    />
                    <path
                      d={pointsExpense}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Interactive Points on Hover */}
                {timelineData.map((d, i) => {
                  const x =
                    timelineData.length === 1
                      ? chartWidth / 2
                      : paddingX + (i / (timelineData.length - 1)) * (chartWidth - paddingX * 2);
                  const yInc =
                    chartHeight - paddingY - (d.income / maxTimelineVal) * (chartHeight - paddingY * 2);

                  return (
                    <g key={d.date} className="cursor-pointer">
                      {/* Vertical tracking line on hover */}
                      {hoveredPoint?.date === d.date && (
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={chartHeight - paddingY}
                          stroke="#6366f1"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Interactive hit area */}
                      <rect
                        x={x - 18}
                        y={0}
                        width={36}
                        height={chartHeight}
                        fill="transparent"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            date: d.date,
                            income: d.income,
                            expense: d.expense,
                            net: d.net,
                            x,
                            y: yInc,
                          })
                        }
                      />

                      {/* Visible dots */}
                      {(chartViewMode === 'both' || chartViewMode === 'income') && d.income > 0 && (
                        <circle
                          cx={x}
                          cy={yInc}
                          r={hoveredPoint?.date === d.date ? 6 : 4}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      {(chartViewMode === 'both' || chartViewMode === 'expense') && d.expense > 0 && (
                        <circle
                          cx={x}
                          cy={
                            chartHeight -
                            paddingY -
                            (d.expense / maxTimelineVal) * (chartHeight - paddingY * 2)
                          }
                          r={hoveredPoint?.date === d.date ? 6 : 4}
                          fill="#f43f5e"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}

                      {/* Date label at bottom */}
                      <text
                        x={x}
                        y={chartHeight - 6}
                        fontSize="9.5"
                        fill="#64748b"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {d.date.slice(8)}/{d.date.slice(5, 7)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-slate-900/90 text-white backdrop-blur-md rounded-xl p-2.5 text-xs shadow-xl z-20 transition-all border border-slate-700/60"
                  style={{
                    left: `${Math.min(chartWidth - 140, Math.max(20, (hoveredPoint.x / chartWidth) * 100))}%`,
                    top: '10px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-slate-300 pb-1 border-b border-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span>{formatDateIndo(hoveredPoint.date)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4 text-emerald-400">
                      <span>Pemasukan:</span>
                      <span className="font-mono font-bold">{formatRupiah(hoveredPoint.income)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-rose-400">
                      <span>Pengeluaran:</span>
                      <span className="font-mono font-bold">{formatRupiah(hoveredPoint.expense)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-200 pt-1 border-t border-slate-800 font-semibold">
                      <span>Selisih Bersih:</span>
                      <span className={`font-mono ${hoveredPoint.net >= 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
                        {formatRupiah(hoveredPoint.net)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Pemasukan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Pengeluaran</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Arahkan kursor ke titik data untuk detail harian
          </span>
        </div>
      </div>

      {/* Chart 2: Distribusi Status & Kategori Ranking */}
      <div className="space-y-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Status Realisasi</h3>
            </div>
            {activeStatus && (
              <button
                onClick={() => onSelectStatus && onSelectStatus('')}
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {statusData.map((item) => {
              const isSelected = activeStatus === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => onSelectStatus && onSelectStatus(isSelected ? '' : item.key)}
                  className={`p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                      : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Distribusi Kategori</h3>
            </div>
            {activeCategory && (
              <button
                onClick={() => onSelectCategory && onSelectCategory('')}
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">Belum ada kategori</div>
            ) : (
              categoryData.slice(0, 5).map((cat) => {
                const isSelected = activeCategory === cat.category;
                const maxCatTotal = categoryData[0]?.total || 1;
                const pct = Math.round((cat.total / maxCatTotal) * 100);

                return (
                  <div
                    key={cat.category}
                    onClick={() => onSelectCategory && onSelectCategory(isSelected ? '' : cat.category)}
                    className={`p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                        : 'hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {cat.category}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatRupiah(cat.total, true)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
