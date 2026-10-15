import React from 'react';
import { Wifi, WifiOff, RefreshCw, Layers } from 'lucide-react';

interface TopNavProps {
  activeTab: 'converter' | 'watchlist' | 'tally' | 'trends';
  setActiveTab: (tab: 'converter' | 'watchlist' | 'tally' | 'trends') => void;
  isOnline: boolean;
  forceOffline: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenOfflineVault: () => void;
  lastUpdated: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  forceOffline,
  isRefreshing,
  onRefresh,
  onOpenOfflineVault,
  lastUpdated,
}) => {
  const effectiveOnline = isOnline && !forceOffline;

  // Format last update relative or time
  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element wordmark with subtle Singapore red dot */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm shadow-rose-600/20">
            S$
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SingaRate
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'converter'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-600'
                : 'hover:text-slate-900'
            }`}
          >
            Converter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'watchlist'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-600'
                : 'hover:text-slate-900'
            }`}
          >
            Watchlist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tally')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'tally'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-600'
                : 'hover:text-slate-900'
            }`}
          >
            Shopping Tally
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'trends'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-600'
                : 'hover:text-slate-900'
            }`}
          >
            Rate Trends
          </button>
        </nav>

        {/* Zone 3: Primary action - Offline / Cache status button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenOfflineVault}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              effectiveOnline
                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
                : 'bg-amber-50/80 text-amber-800 border-amber-200/80 hover:bg-amber-100'
            }`}
            title="Open Offline Cache & Rate Settings"
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Live FX</span>
                <span className="text-[11px] opacity-75 font-mono">{formatTime(lastUpdated)}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Offline Cached</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || !effectiveOnline}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Refresh exchange rates"
            aria-label="Refresh exchange rates"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
};
