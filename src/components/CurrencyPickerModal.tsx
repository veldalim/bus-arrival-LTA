import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { CURRENCIES, Currency } from '../data/currencies';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelectCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCode,
  onSelectCurrency,
  rates,
  customOverrides,
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CURRENCIES;

    return CURRENCIES.filter((c) => {
      return (
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query) ||
        (c.travelTag && c.travelTag.toLowerCase().includes(query)) ||
        (query === 'ringgit' && c.code === 'MYR') ||
        (query === 'yen' && c.code === 'JPY') ||
        (query === 'baht' && c.code === 'THB') ||
        (query === 'won' && c.code === 'KRW') ||
        (query === 'rupiah' && c.code === 'IDR') ||
        (query === 'dong' && c.code === 'VND') ||
        (query === 'yuan' && c.code === 'CNY') ||
        (query === 'pound' && c.code === 'GBP')
      );
    });
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full sm:max-w-xl max-h-[85vh] sm:max-h-[80vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-currency-title"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 id="modal-currency-title" className="text-lg font-bold text-slate-900 tracking-tight">
              Select Foreign Currency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Convert directly into Singapore Dollars (SGD)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by currency (MYR, JPY), city (JB, Tokyo), or name..."
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Popular Selector pills (Interactive filter tabs) */}
        {!search && (
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/30 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap mr-1">Popular:</span>
            {['MYR', 'JPY', 'THB', 'IDR', 'USD', 'EUR', 'KRW', 'TWD'].map((code) => {
              const item = CURRENCIES.find((c) => c.code === code);
              if (!item) return null;
              const isSelected = selectedCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onSelectCurrency(item);
                    onClose();
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{item.code}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Currencies List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No currency found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by code like "USD", "MYR", or "Yen"</p>
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = selectedCode === c.code;
              const currentRate = customOverrides[c.code] || rates[c.code] || c.defaultRatePerSGD;
              const hasOverride = !!customOverrides[c.code];

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onSelectCurrency(c);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                    isSelected ? 'bg-rose-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-label={c.country}>
                      {c.flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{c.code}</span>
                        <span className="text-xs text-slate-400 font-normal">·</span>
                        <span className="text-xs text-slate-600 truncate">{c.name}</span>
                        {hasOverride && (
                          <span className="text-[10px] text-amber-700 font-medium">Custom</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {c.travelTag || c.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                      1 SGD = {currentRate.toLocaleString('en-SG', { maximumFractionDigits: 4 })} {c.code}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      1 {c.code} ≈ S${(1 / currentRate).toFixed(4)}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="ml-2 pl-2 border-l border-slate-200 shrink-0">
                      <Check className="w-4 h-4 text-rose-600" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Rates are cached for reliable offline usage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
