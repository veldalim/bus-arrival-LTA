import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Info } from 'lucide-react';
import { Currency, CURRENCIES } from '../data/currencies';
import { getHistoricalTrends, formatCurrencyValue } from '../services/exchangeRates';

interface RateTrendsProps {
  currentCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
}

export const RateTrends: React.FC<RateTrendsProps> = ({
  currentCurrency,
  onSelectCurrency,
  rates,
  customOverrides,
}) => {
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rawRate = customOverrides[currentCurrency.code] || rates[currentCurrency.code] || currentCurrency.defaultRatePerSGD;

  const trendData = useMemo(() => {
    return getHistoricalTrends(rawRate, days);
  }, [rawRate, days]);

  const { points, min, max, avg, changePct } = trendData;
  const isSGDStronger = changePct >= 0;

  // SVG Chart Dimensions
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const range = max - min || 1;

  const coordinates = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((p.rate - min) / range) * chartHeight;
    return { x, y, point: p };
  });

  const pathD = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`;

  const activePoint = hoveredIndex !== null ? coordinates[hoveredIndex] : coordinates[coordinates.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Controller Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{currentCurrency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  SGD / {currentCurrency.code} Exchange Trends
                </h2>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{currentCurrency.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trajectory of how many {currentCurrency.code} 1 Singapore Dollar buys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency switcher dropdown */}
            <select
              value={currentCurrency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onSelectCurrency(found);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            {/* Time period filter tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    days === d
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Current Rate</span>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {rawRate.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">{days}-Day High</span>
            <div className="text-base font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
              {max.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">{days}-Day Low</span>
            <div className="text-base font-bold font-mono text-rose-700 tabular-nums mt-0.5">
              {min.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Movement ({days}D)</span>
            <div
              className={`text-base font-bold font-mono tabular-nums mt-0.5 flex items-center gap-1 ${
                isSGDStronger ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isSGDStronger ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{changePct >= 0 ? `+${changePct.toFixed(2)}%` : `${changePct.toFixed(2)}%`}</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Hover over points to inspect rate on specific dates
            </span>
            {activePoint && (
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {activePoint.point.dayLabel}: 1 SGD = {activePoint.point.rate.toFixed(4)} {currentCurrency.code}
              </span>
            )}
          </div>

          <div className="w-full overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[260px] overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={width - paddingX}
                y2={paddingY}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + chartHeight / 2}
                x2={width - paddingX}
                y2={paddingY + chartHeight / 2}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={height - paddingY}
                x2={width - paddingX}
                y2={height - paddingY}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />

              {/* Min / Max Labels */}
              <text
                x={paddingX - 6}
                y={paddingY + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {max.toFixed(2)}
              </text>
              <text
                x={paddingX - 6}
                y={height - paddingY + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {min.toFixed(2)}
              </text>

              {/* Fill Area */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots */}
              {coordinates.map((coord, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={idx}>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? 6 : 3}
                      fill={isHovered ? '#e11d48' : '#ffffff'}
                      stroke="#e11d48"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Invisible larger hit target */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={14}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Traveler Insight / Tip */}
        <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-950">
            <span className="font-bold">Traveler Insight: </span>
            {isSGDStronger ? (
              <span>
                The Singapore Dollar has trended stronger against {currentCurrency.code} (+{changePct.toFixed(2)}%) over the last {days} days, meaning your SGD will stretch further when visiting {currentCurrency.country} or purchasing {currentCurrency.code}-priced goods.
              </span>
            ) : (
              <span>
                The {currentCurrency.code} has slightly gained strength against SGD ({changePct.toFixed(2)}%) in this period. Consider checking multiple money changers in Singapore or using a zero-FX-markup card.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
