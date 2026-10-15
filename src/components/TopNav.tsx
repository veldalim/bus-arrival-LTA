import React from 'react';
import { RefreshCw, Navigation } from 'lucide-react';

interface TopNavProps {
  onOpenBackendModal: () => void;
  onOpenFareModal: () => void;
  onOpenInterchanges: () => void;
  onOpenAllStops: () => void;
  onLocateUser: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isBackendConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenBackendModal,
  onOpenFareModal,
  onOpenInterchanges,
  onOpenAllStops,
  onLocateUser,
  onRefresh,
  isRefreshing,
  isBackendConnected
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, no compound pill badges) */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>SG BusLive</span>
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button 
            type="button"
            onClick={onOpenAllStops}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            All Bus Stops
          </button>
          <button 
            type="button"
            onClick={onOpenInterchanges}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Interchanges
          </button>
          <button 
            type="button"
            onClick={onOpenFareModal}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Fare Estimator
          </button>
          <button 
            type="button"
            onClick={onOpenBackendModal}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>LTA Backend Setup</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLocateUser}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
            title="Find nearest Singapore bus stop"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Nearby</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
