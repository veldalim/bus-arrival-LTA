import React, { useState } from 'react';
import { X, Wifi, WifiOff, RefreshCw, Download, Database, Check, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { CURRENCIES, Currency } from '../data/currencies';

interface OfflineVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: Record<string, number>;
  lastUpdated: string;
  source: 'live' | 'cache' | 'baseline';
  isOnline: boolean;
  forceOffline: boolean;
  onToggleForceOffline: (val: boolean) => void;
  onRefreshLive: () => void;
  isRefreshing: boolean;
  customOverrides: Record<string, number>;
  onClearOverrides: () => void;
  onResetBaseline: () => void;
}

export const OfflineVaultModal: React.FC<OfflineVaultModalProps> = ({
  isOpen,
  onClose,
  rates,
  lastUpdated,
  source,
  isOnline,
  forceOffline,
  onToggleForceOffline,
  onRefreshLive,
  isRefreshing,
  customOverrides,
  onClearOverrides,
  onResetBaseline,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const effectiveOnline = isOnline && !forceOffline;

  const handleExportJSON = () => {
    const exportData = {
      app: 'SingaRate SGD Converter',
      exportedAt: new Date().toISOString(),
      lastSyncTimestamp: lastUpdated,
      rates,
      customOverrides,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `singarate-rates-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const filteredList = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 id="vault-title" className="text-lg font-bold text-slate-900 tracking-tight">
                Offline Exchange Rate Vault
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All foreign currency rates are cached locally for airplane & overseas offline use.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {effectiveOnline ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Connected & Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline Vault Active</span>
              </div>
            )}
            
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600">
              Last synced: <span className="font-mono font-medium">{new Date(lastUpdated).toLocaleString('en-SG')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshLive}
              disabled={isRefreshing || !isOnline}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* Body Controls */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Offline Simulation Switch */}
          <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900">
                Simulate Airplane / Offline Mode
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Force the app to disconnect from the web and test 100% offline conversion features.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleForceOffline(!forceOffline)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                forceOffline ? 'bg-amber-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  forceOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cached Rates Inspection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Locally Cached Rates ({Object.keys(rates).length} Currencies)
              </span>
              <input
                type="text"
                placeholder="Filter cached currency..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
              {filteredList.map((c) => {
                const currentVal = customOverrides[c.code] || rates[c.code] || c.defaultRatePerSGD;
                const isCustom = Boolean(customOverrides[c.code]);

                return (
                  <div
                    key={c.code}
                    className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span className="font-bold text-slate-900">{c.code}</span>
                      <span className="text-slate-500 truncate max-w-[150px]">{c.name}</span>
                      {isCustom && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="text-right font-mono font-medium text-slate-800 tabular-nums">
                      1 SGD = {currentVal.toFixed(4)} {c.code}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions & Overrides */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadSuccess ? 'Downloaded!' : 'Export Rates (JSON)'}</span>
              </button>

              {Object.keys(customOverrides).length > 0 && (
                <button
                  type="button"
                  onClick={onClearOverrides}
                  className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Custom Cash Rates</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onResetBaseline}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Reset to Singapore Defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>SingaRate operates 100% in-browser with zero backend tracking.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
