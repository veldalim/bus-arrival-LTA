import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SINGAPORE_BUS_STOPS, 
  LtaBusStop, 
  BUS_SERVICE_DETAILS,
  BusServiceDetail,
  ServiceArrival
} from './data/singaporeBusData';
import { 
  fetchBusArrivals, 
  getNearbyBusStops, 
  advanceSimulationClock 
} from './services/ltaBusApi';
import { TopNav } from './components/TopNav';
import { BusArrivalRow } from './components/BusArrivalRow';
import { SingaporeBusMap } from './components/SingaporeBusMap';
import { RouteProgressionDrawer } from './components/RouteProgressionDrawer';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { FareEstimatorModal } from './components/FareEstimatorModal';
import { InterchangePickerModal } from './components/InterchangePickerModal';
import { AllStopsDrawer } from './components/AllStopsDrawer';
import { ArrivalAlarmModal } from './components/ArrivalAlarmModal';
import { 
  Search, 
  MapPin, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Clock, 
  Filter, 
  ArrowRight, 
  Layers, 
  Route, 
  Sparkles,
  ChevronRight,
  Sun,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function App() {
  // Primary State
  const [selectedStop, setSelectedStop] = useState<LtaBusStop>(SINGAPORE_BUS_STOPS[0]);
  const [arrivals, setArrivals] = useState<ServiceArrival[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedRouteService, setSelectedRouteService] = useState<string | null>('65');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'soon' | 'wab' | 'dd' | 'seats'>('all');

  // Favorites
  const [favoriteStops, setFavoriteStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sgbus_favorite_stops');
      return saved ? JSON.parse(saved) : ['09048', '08138', '28009'];
    } catch {
      return ['09048', '08138'];
    }
  });

  // Modals & Drawers
  const [showBackendModal, setShowBackendModal] = useState<boolean>(false);
  const [showFareModal, setShowFareModal] = useState<boolean>(false);
  const [showInterchangeModal, setShowInterchangeModal] = useState<boolean>(false);
  const [showAllStopsDrawer, setShowAllStopsDrawer] = useState<boolean>(false);
  const [showRouteDrawer, setShowRouteDrawer] = useState<boolean>(false);
  const [alarmModalData, setAlarmModalData] = useState<{ serviceNo: string; initialSecs: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-refresh countdown (15s cycle)
  const [countdownSecs, setCountdownSecs] = useState<number>(15);

  const isBackendConfigured = useMemo(() => {
    return !!localStorage.getItem('sgbus_backend_url');
  }, [showBackendModal]);

  // Load arrivals for currently selected stop
  const loadArrivals = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingArrivals(true);
    setIsRefreshing(true);
    try {
      const data = await fetchBusArrivals(selectedStop.BusStopCode);
      setArrivals(data);
      // Auto-select first service if currently selected route isn't available at this stop
      if (!selectedRouteService || !data.some(d => d.ServiceNo === selectedRouteService)) {
        if (data.length > 0) {
          setSelectedRouteService(data[0].ServiceNo);
        }
      }
    } catch (err) {
      console.error('Failed to load arrivals:', err);
    } finally {
      setLoadingArrivals(false);
      setIsRefreshing(false);
      setCountdownSecs(15);
    }
  }, [selectedStop.BusStopCode, selectedRouteService]);

  // Initial and stop-change loading
  useEffect(() => {
    loadArrivals();
  }, [selectedStop.BusStopCode]);

  // Auto-refresh timer loop (every second, refresh arrivals every 15s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSecs((prev) => {
        if (prev <= 1) {
          loadArrivals(true);
          return 15;
        }
        return prev - 1;
      });
      // Advance internal simulation clock so GPS and speed interpolate smoothly
      advanceSimulationClock();
    }, 1000);

    return () => clearInterval(timer);
  }, [loadArrivals]);

  // Toggle Favorite
  const toggleFavoriteStop = (code: string) => {
    const updated = favoriteStops.includes(code)
      ? favoriteStops.filter(c => c !== code)
      : [...favoriteStops, code];
    setFavoriteStops(updated);
    localStorage.setItem('sgbus_favorite_stops', JSON.stringify(updated));
  };

  // Locate User
  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          const nearby = getNearbyBusStops(lat, lng, 1);
          if (nearby.length > 0) {
            setSelectedStop(nearby[0].stop);
          }
        },
        (err) => {
          console.warn('Geolocation failed or denied, using central Singapore:', err);
          // Fallback to Singapore Orchard coordinates
          setUserLocation({ lat: 1.3048, lng: 103.8318 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 1.3048, lng: 103.8318 });
    }
  };

  // Filter Arrivals
  const filteredArrivals = useMemo(() => {
    let list = arrivals;
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      list = list.filter(item => 
        item.ServiceNo.toLowerCase().includes(q) ||
        item.Operator.toLowerCase().includes(q)
      );
    }

    if (activeFilterTab === 'soon') {
      list = list.filter(item => {
        const diffMs = new Date(item.NextBus.EstimatedArrival).getTime() - Date.now();
        return diffMs <= 180000; // <= 3 minutes
      });
    } else if (activeFilterTab === 'wab') {
      list = list.filter(item => item.NextBus.Feature === 'WAB');
    } else if (activeFilterTab === 'dd') {
      list = list.filter(item => item.NextBus.Type === 'DD');
    } else if (activeFilterTab === 'seats') {
      list = list.filter(item => item.NextBus.Load === 'SEA');
    }

    return list;
  }, [arrivals, searchFilter, activeFilterTab]);

  const isCurrentStopFavorite = favoriteStops.includes(selectedStop.BusStopCode);
  const selectedServiceDetail: BusServiceDetail | undefined = selectedRouteService ? BUS_SERVICE_DETAILS[selectedRouteService] : undefined;

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Universal Top Nav conforming to 3-zone contract */}
      <TopNav
        onOpenBackendModal={() => setShowBackendModal(true)}
        onOpenFareModal={() => setShowFareModal(true)}
        onOpenInterchanges={() => setShowInterchangeModal(true)}
        onOpenAllStops={() => setShowAllStopsDrawer(true)}
        onLocateUser={handleLocateUser}
        onRefresh={() => loadArrivals(false)}
        isRefreshing={isRefreshing}
        isBackendConnected={isBackendConfigured}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Header Section: Bus Stop Master Banner */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Stop Identity */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-white tracking-wide">
                  BUS STOP {selectedStop.BusStopCode}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStop.RoadName}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStop.services.length} services serving stop</span>
                {selectedStop.mrtInterchange && selectedStop.mrtInterchange.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      {selectedStop.mrtInterchange.map(mrt => (
                        <span 
                          key={mrt} 
                          className="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded text-white"
                          style={{
                            backgroundColor: mrt.startsWith('NS') ? '#d42e12' :
                                             mrt.startsWith('EW') ? '#009645' :
                                             mrt.startsWith('NE') ? '#8f1a95' :
                                             mrt.startsWith('CC') ? '#fa9e0d' :
                                             mrt.startsWith('DT') ? '#005ec4' :
                                             mrt.startsWith('TE') ? '#9d5b25' : '#444'
                          }}
                        >
                          {mrt}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {selectedStop.Description}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>29°C · Clear Weather · Smooth Road Flow</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next refresh in {countdownSecs}s</span>
                </div>
              </div>
            </div>

            {/* Quick Stop Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleFavoriteStop(selectedStop.BusStopCode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border ${
                  isCurrentStopFavorite
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {isCurrentStopFavorite ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-500" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-400" />
                )}
                <span>{isCurrentStopFavorite ? 'Saved Stop' : 'Save Stop'}</span>
              </button>

              <button
                onClick={copyShareLink}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Share or copy bus stop link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => setShowAllStopsDrawer(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch Stop</span>
              </button>
            </div>
          </div>

          {/* Quick Frequent Stops Bar */}
          {favoriteStops.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs text-slate-400 font-medium shrink-0">
                Saved Stops:
              </span>
              {favoriteStops.map((code) => {
                const s = SINGAPORE_BUS_STOPS.find(item => item.BusStopCode === code);
                if (!s) return null;
                const isSelected = s.BusStopCode === selectedStop.BusStopCode;

                return (
                  <button
                    key={s.BusStopCode}
                    onClick={() => setSelectedStop(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75">{s.BusStopCode}</span>
                    <span>{s.Description}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Search & Segmented Filter Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Service Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search service number (e.g. 190, 65, 14)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-thin">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'soon', label: 'Arriving <3m' },
              { id: 'wab', label: 'Wheelchair (WAB)' },
              { id: 'dd', label: 'Double Deck' },
              { id: 'seats', label: 'Seats Available' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  activeFilterTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dual-Column Split Grid: Left = Live Arrivals, Right = Interactive Singapore Bus Map */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Real-Time Bus Arrivals Feed (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>Real-Time Arrivals</span>
                <span className="font-mono text-[11px] text-slate-400">
                  ({filteredArrivals.length} services)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Seats
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Standing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Full
                </span>
              </div>
            </div>

            {loadingArrivals ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                <div className="text-xs font-medium text-slate-500">Loading live LTA bus arrival telemetry...</div>
              </div>
            ) : filteredArrivals.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 space-y-2">
                <p>No bus services match the active filter "{searchFilter || activeFilterTab}".</p>
                <button
                  onClick={() => { setSearchFilter(''); setActiveFilterTab('all'); }}
                  className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredArrivals.map((arrival) => (
                  <BusArrivalRow
                    key={arrival.ServiceNo}
                    arrival={arrival}
                    isSelectedForRoute={selectedRouteService === arrival.ServiceNo}
                    onSelectRoute={(svc) => {
                      setSelectedRouteService(svc);
                    }}
                    onSetAlarm={(svc, secs) => {
                      setAlarmModalData({ serviceNo: svc, initialSecs: secs });
                    }}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map & Route Tracker (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Interactive Singapore Leaflet Map */}
            <div className="h-[380px] sm:h-[440px] w-full">
              <SingaporeBusMap
                selectedStop={selectedStop}
                onSelectStop={(stop) => setSelectedStop(stop)}
                selectedServiceNo={selectedRouteService}
                userCoords={userLocation}
                showAllStops={true}
              />
            </div>

            {/* Selected Bus Service Route Spotlight Card */}
            {selectedServiceDetail ? (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-950 text-white font-mono font-bold text-base">
                      {selectedServiceDetail.ServiceNo}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {selectedServiceDetail.Origin} → {selectedServiceDetail.Destination}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {selectedServiceDetail.Category} · {selectedServiceDetail.Operator}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRouteDrawer(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Full Route</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Operating Hours</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                      {selectedServiceDetail.FirstBus} - {selectedServiceDetail.LastBus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peak Interval</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                      {selectedServiceDetail.FrequencyPeakMin} - {selectedServiceDetail.FrequencyPeakMin + 2} mins
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                Select a bus service on the left to track its live GPS coordinates along the Singapore route.
              </div>
            )}

            {/* Quick Transit Utilities Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-200">Public Transport Council (PTC)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Calculate Singapore distance-based transit fares</div>
              </div>
              <button
                onClick={() => setShowFareModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Fare Calculator
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* Modals & Drawers */}
      <RouteProgressionDrawer
        serviceNo={showRouteDrawer ? selectedRouteService : null}
        currentStopCode={selectedStop.BusStopCode}
        onClose={() => setShowRouteDrawer(false)}
        onSelectStop={(stop) => setSelectedStop(stop)}
      />

      <BackendIntegrationModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        onRefreshFeed={() => loadArrivals(false)}
      />

      <FareEstimatorModal
        isOpen={showFareModal}
        onClose={() => setShowFareModal(false)}
        defaultOriginStopCode={selectedStop.BusStopCode}
      />

      <InterchangePickerModal
        isOpen={showInterchangeModal}
        onClose={() => setShowInterchangeModal(false)}
        onSelectStop={(stop) => setSelectedStop(stop)}
        currentStopCode={selectedStop.BusStopCode}
      />

      <AllStopsDrawer
        isOpen={showAllStopsDrawer}
        onClose={() => setShowAllStopsDrawer(false)}
        onSelectStop={(stop) => setSelectedStop(stop)}
        currentStopCode={selectedStop.BusStopCode}
      />

      {alarmModalData && (
        <ArrivalAlarmModal
          isOpen={true}
          onClose={() => setAlarmModalData(null)}
          serviceNo={alarmModalData.serviceNo}
          initialEtaSeconds={alarmModalData.initialSecs}
        />
      )}

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">SG BusLive</span>
            <span>·</span>
            <span>Singapore LTA DataMall Transit Specifications</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setShowBackendModal(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Backend Integration Guide
            </button>
            <button onClick={() => setShowFareModal(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              PTC Fare Tables
            </button>
            <button onClick={() => setShowInterchangeModal(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Major Interchanges
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
