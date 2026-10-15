import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { CURRENCIES, Currency, SGD_CURRENCY } from '../data/currencies';
import { formatCurrencyValue } from '../services/exchangeRates';

interface WatchlistMatrixProps {
  watchlistCodes: string[];
  onToggleWatchlist: (code: string) => void;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
  onSelectForConvert: (currency: Currency) => void;
  spreadPercent: number;
}

export const WatchlistMatrix: React.FC<WatchlistMatrixProps> = ({
  watchlistCodes,
  onToggleWatchlist,
  rates,
  customOverrides,
  onSelectForConvert,
  spreadPercent,
}) => {
  const [baseSGD, setBaseSGD] = useState<number>(100);
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const watchedCurrencies = watchlistCodes
    .map((code) => CURRENCIES.find((c) => c.code === code))
    .filter(Boolean) as Currency[];

  const unpinnedCurrencies = CURRENCIES.filter(
    (c) => !watchlistCodes.includes(c.code)
  );

  return (
    <div className="space-y-6">
      {/* Header card with base SGD amount controller */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Singapore Dollar Multi-Currency Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compare your SGD spending power across your favorite travel & shopping currencies instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Base Amount:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBaseSGD(amt)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer tabular-nums ${
                    baseSGD === amt
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  S${amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom amount input slider / quick field */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Custom SGD amount:</span>
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="font-mono text-sm font-bold text-slate-700">S$</span>
            <input
              type="number"
              min="1"
              max="100000"
              value={baseSGD}
              onChange={(e) => setBaseSGD(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold text-right bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Grid of watched currencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchedCurrencies.map((c) => {
          const rawRate = customOverrides[c.code] || rates[c.code] || c.defaultRatePerSGD;
          const foreignValue = baseSGD * rawRate * (1 - spreadPercent / 100);
          const hasOverride = Boolean(customOverrides[c.code]);

          return (
            <div
              key={c.code}
              className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">{c.code}</span>
                        <span className="text-xs text-slate-400 font-normal">·</span>
                        <span className="text-xs text-slate-600 truncate max-w-[120px]">{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {c.travelTag || c.country}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(c.code)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                    title="Remove from watchlist"
                    aria-label={`Remove ${c.code} from watchlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Big Converted Value */}
                <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>S${baseSGD} buys:</span>
                    {hasOverride && (
                      <span className="text-[10px] text-amber-700 font-mono">Custom Cash Rate</span>
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    {c.symbol} {formatCurrencyValue(foreignValue, c.decimals)}
                  </div>
                </div>
              </div>

              {/* Card Footer: Rates and action to convert */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 tabular-nums">
                  1 SGD = {rawRate.toLocaleString('en-SG', { maximumFractionDigits: 4 })} {c.code}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectForConvert(c)}
                  className="font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Convert</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add more card */}
        <div className="bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center hover:border-slate-300 hover:bg-slate-50 transition-all min-h-[170px]">
          <button
            type="button"
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer mb-2"
          >
            <Plus className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-slate-700">Add Currency to Watchlist</span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {unpinnedCurrencies.length} more currencies available
          </span>
        </div>
      </div>

      {/* Available to Pin Drawer/List */}
      {isAddingOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Available Currencies</h3>
            <button
              type="button"
              onClick={() => setIsAddingOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {unpinnedCurrencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onToggleWatchlist(c.code);
                  if (unpinnedCurrencies.length <= 1) setIsAddingOpen(false);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{c.flag}</span>
                  <span className="font-semibold text-xs text-slate-900">{c.code}</span>
                  <span className="text-[11px] text-slate-500 truncate">{c.name}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
