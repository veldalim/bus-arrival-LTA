/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  Layers, 
  Receipt, 
  TrendingUp, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  ShieldCheck, 
  Plane,
  Coins
} from 'lucide-react';
import { CURRENCIES, Currency, DEFAULT_WATCHLIST_CODES } from './data/currencies';
import { 
  RatesState, 
  loadStoredRatesState, 
  fetchLiveRates, 
  saveSpreadPercent, 
  saveCustomOverrides, 
  saveForceOffline,
  getBaselineRates
} from './services/exchangeRates';
import { TopNav } from './components/TopNav';
import { ConverterCard } from './components/ConverterCard';
import { WatchlistMatrix } from './components/WatchlistMatrix';
import { ShoppingTally } from './components/ShoppingTally';
import { RateTrends } from './components/RateTrends';
import { CurrencyPickerModal } from './components/CurrencyPickerModal';
import { OfflineVaultModal } from './components/OfflineVaultModal';
import { CustomRateModal } from './components/CustomRateModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'converter' | 'watchlist' | 'tally' | 'trends'>('converter');
  
  // Active foreign currency (defaults to Malaysian Ringgit - highest cross-border volume with Singapore)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    try {
      const savedCode = localStorage.getItem('singarate_selected_curr');
      if (savedCode) {
        const found = CURRENCIES.find((c) => c.code === savedCode);
        if (found) return found;
      }
    } catch {}
    return CURRENCIES[0]; // MYR
  });

  // Rates and offline state
  const [ratesState, setRatesState] = useState<RatesState>(() => loadStoredRatesState());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Watchlist codes
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('singarate_watchlist_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WATCHLIST_CODES;
  });

  // Modals state
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState<boolean>(false);
  const [isOfflineVaultOpen, setIsOfflineVaultOpen] = useState<boolean>(false);
  const [isCustomRateOpen, setIsCustomRateOpen] = useState<boolean>(false);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setRatesState((prev) => ({ ...prev, isOnline: true }));
    };
    const handleOffline = () => {
      setRatesState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save selected currency
  useEffect(() => {
    try {
      localStorage.setItem('singarate_selected_curr', selectedCurrency.code);
    } catch {}
  }, [selectedCurrency]);

  // Save watchlist
  useEffect(() => {
    try {
      localStorage.setItem('singarate_watchlist_v1', JSON.stringify(watchlistCodes));
    } catch {}
  }, [watchlistCodes]);

  // Automatic background refresh on mount if online and not forced offline
  const handleRefresh = useCallback(async () => {
    if (ratesState.forceOffline) return;
    setIsRefreshing(true);
    try {
      const result = await fetchLiveRates();
      if (result) {
        setRatesState((prev) => ({
          ...prev,
          rates: result.rates,
          lastUpdated: result.timestamp,
          source: 'live',
        }));
      }
    } catch (e) {
      console.warn('Silent live rate update skipped', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [ratesState.forceOffline]);

  useEffect(() => {
    if (ratesState.isOnline && !ratesState.forceOffline) {
      handleRefresh();
    }
  }, [handleRefresh, ratesState.isOnline, ratesState.forceOffline]);

  // Spread percent handler
  const handleSpreadChange = (newSpread: number) => {
    saveSpreadPercent(newSpread);
    setRatesState((prev) => ({ ...prev, spreadPercent: newSpread }));
  };

  // Custom Cash Rate overrides
  const handleSaveCustomOverride = (currencyCode: string, rate: number | null) => {
    const next = { ...ratesState.customOverrides };
    if (rate === null || rate <= 0) {
      delete next[currencyCode];
    } else {
      next[currencyCode] = rate;
    }
    saveCustomOverrides(next);
    setRatesState((prev) => ({ ...prev, customOverrides: next }));
  };

  const handleClearOverrides = () => {
    saveCustomOverrides({});
    setRatesState((prev) => ({ ...prev, customOverrides: {} }));
  };

  const handleResetBaseline = () => {
    const baseline = getBaselineRates();
    const now = new Date().toISOString();
    setRatesState((prev) => ({
      ...prev,
      rates: baseline,
      lastUpdated: now,
      source: 'baseline',
      customOverrides: {},
    }));
  };

  const handleToggleForceOffline = (val: boolean) => {
    saveForceOffline(val);
    setRatesState((prev) => ({ ...prev, forceOffline: val }));
  };

  const handleToggleWatchlist = (code: string) => {
    if (watchlistCodes.includes(code)) {
      setWatchlistCodes(watchlistCodes.filter((c) => c !== code));
    } else {
      setWatchlistCodes([...watchlistCodes, code]);
    }
  };

  const handleSelectFromWatchlist = (c: Currency) => {
    setSelectedCurrency(c);
    setActiveTab('converter');
  };

  const effectiveOnline = ratesState.isOnline && !ratesState.forceOffline;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={ratesState.isOnline}
        forceOffline={ratesState.forceOffline}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
        lastUpdated={ratesState.lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        
        {/* Offline Banner alert if simulated or offline */}
        {!effectiveOnline && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Offline Vault Active:</strong> Converting using locally cached exchange rates from {new Date(ratesState.lastUpdated).toLocaleDateString('en-SG')}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOfflineVaultOpen(true)}
              className="font-semibold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
            >
              Manage Vault
            </button>
          </div>
        )}

        {/* Tab Content Rendering */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Singapore Dollar Currency Converter
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Instant foreign exchange to SGD · 100% offline support · Bank spread calculator
                </p>
              </div>

              {/* Unboxed metadata indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Direct S$ Spot</span>
                <span aria-hidden="true">·</span>
                <span>SGD Base</span>
                <span aria-hidden="true">·</span>
                <span>{Object.keys(ratesState.rates).length} Currencies</span>
              </div>
            </div>

            {/* The Converter Card */}
            <ConverterCard
              foreignCurrency={selectedCurrency}
              onOpenCurrencyPicker={() => setIsCurrencyPickerOpen(true)}
              rates={ratesState.rates}
              customOverrides={ratesState.customOverrides}
              spreadPercent={ratesState.spreadPercent}
              onSpreadChange={handleSpreadChange}
              onOpenCustomRateModal={() => setIsCustomRateOpen(true)}
            />

            {/* Quick Regional Shortcuts */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Popular Travel Destinations
                </span>
                <span className="text-xs text-slate-400">Quick Switch</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {[
                  { code: 'MYR', name: 'Malaysia', spot: ratesState.rates['MYR'] || 3.32 },
                  { code: 'JPY', name: 'Japan', spot: ratesState.rates['JPY'] || 114.5 },
                  { code: 'THB', name: 'Thailand', spot: ratesState.rates['THB'] || 26.35 },
                  { code: 'IDR', name: 'Indonesia', spot: ratesState.rates['IDR'] || 12150 },
                  { code: 'USD', name: 'USA', spot: ratesState.rates['USD'] || 0.765 },
                  { code: 'EUR', name: 'Eurozone', spot: ratesState.rates['EUR'] || 0.705 },
                ].map((item) => {
                  const curr = CURRENCIES.find((c) => c.code === item.code);
                  if (!curr) return null;
                  const isSelected = selectedCurrency.code === item.code;
                  const rate = ratesState.customOverrides[item.code] || item.spot;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setSelectedCurrency(curr)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{curr.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{curr.code}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.name}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-mono font-semibold text-slate-700 tabular-nums">
                        1 SGD = {rate.toFixed(curr.decimals === 0 ? 0 : 2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <WatchlistMatrix
            watchlistCodes={watchlistCodes}
            onToggleWatchlist={handleToggleWatchlist}
            rates={ratesState.rates}
            customOverrides={ratesState.customOverrides}
            onSelectForConvert={handleSelectFromWatchlist}
            spreadPercent={ratesState.spreadPercent}
          />
        )}

        {activeTab === 'tally' && (
          <ShoppingTally
            currentCurrency={selectedCurrency}
            rates={ratesState.rates}
            customOverrides={ratesState.customOverrides}
            spreadPercent={ratesState.spreadPercent}
          />
        )}

        {activeTab === 'trends' && (
          <RateTrends
            currentCurrency={selectedCurrency}
            onSelectCurrency={setSelectedCurrency}
            rates={ratesState.rates}
            customOverrides={ratesState.customOverrides}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Natural thumb reach zone, <15% viewport height) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4">
        <div className="grid grid-cols-4 items-center h-12">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'converter' ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Convert</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'watchlist' ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tally')}
            className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'tally' ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Tally</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'trends' ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Trends</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <CurrencyPickerModal
        isOpen={isCurrencyPickerOpen}
        onClose={() => setIsCurrencyPickerOpen(false)}
        selectedCode={selectedCurrency.code}
        onSelectCurrency={setSelectedCurrency}
        rates={ratesState.rates}
        customOverrides={ratesState.customOverrides}
      />

      <OfflineVaultModal
        isOpen={isOfflineVaultOpen}
        onClose={() => setIsOfflineVaultOpen(false)}
        rates={ratesState.rates}
        lastUpdated={ratesState.lastUpdated}
        source={ratesState.source}
        isOnline={ratesState.isOnline}
        forceOffline={ratesState.forceOffline}
        onToggleForceOffline={handleToggleForceOffline}
        onRefreshLive={handleRefresh}
        isRefreshing={isRefreshing}
        customOverrides={ratesState.customOverrides}
        onClearOverrides={handleClearOverrides}
        onResetBaseline={handleResetBaseline}
      />

      <CustomRateModal
        isOpen={isCustomRateOpen}
        onClose={() => setIsCustomRateOpen(false)}
        currency={selectedCurrency}
        liveRate={ratesState.rates[selectedCurrency.code] || selectedCurrency.defaultRatePerSGD}
        currentOverride={ratesState.customOverrides[selectedCurrency.code]}
        onSaveOverride={handleSaveCustomOverride}
      />
    </div>
  );
}
