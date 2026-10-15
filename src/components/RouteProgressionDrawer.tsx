import React from 'react';
import { BUS_SERVICE_DETAILS, LtaBusStop, SINGAPORE_BUS_STOPS } from '../data/singaporeBusData';
import { getLiveBusesForService, OPERATOR_COLORS } from '../services/ltaBusApi';
import { X, Clock, ArrowRight, Bus, MapPin, Gauge } from 'lucide-react';

interface RouteProgressionDrawerProps {
  serviceNo: string | null;
  currentStopCode: string;
  onClose: () => void;
  onSelectStop: (stop: LtaBusStop) => void;
}

export const RouteProgressionDrawer: React.FC<RouteProgressionDrawerProps> = ({
  serviceNo,
  currentStopCode,
  onClose,
  onSelectStop
}) => {
  if (!serviceNo) return null;
  const detail = BUS_SERVICE_DETAILS[serviceNo];
  if (!detail) return null;

  const liveBuses = getLiveBusesForService(serviceNo);
  const operator = OPERATOR_COLORS[detail.Operator];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-white font-mono font-bold text-xl">
              {detail.ServiceNo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{operator.name}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">{detail.Category}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span>{detail.Origin}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{detail.Destination}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Operating Stats */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>First / Last Bus</span>
            </div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {detail.FirstBus} - {detail.LastBus}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-500" />
              <span>Peak Interval</span>
            </div>
            <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {detail.FrequencyPeakMin} - {detail.FrequencyPeakMin + 2} mins
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Bus className="w-3 h-3 text-sky-500" />
              <span>Active Fleet</span>
            </div>
            <div className="font-mono font-semibold text-sky-600 dark:text-sky-400 mt-1">
              {liveBuses.length} buses live
            </div>
          </div>
        </div>

        {/* Live Active Buses Telemetry Strip */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Vehicles En Route</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">GPS Telemetry</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {liveBuses.map((bus) => (
              <div 
                key={bus.plate} 
                className="shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/40 text-xs shadow-xs min-w-[130px]"
              >
                <div className="flex items-center justify-between font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span>{bus.plate}</span>
                  <span className="text-[10px] text-slate-400">{bus.type}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{bus.speedKmh} km/h</span>
                  <span className="font-semibold text-emerald-600">{bus.progress}% route</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stops Sequence Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Stop Sequence ({detail.Stops.length} stops)
          </div>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-4 py-1">
            {detail.Stops.map((stopItem, index) => {
              const isCurrent = stopItem.BusStopCode === currentStopCode;
              const fullStopData = SINGAPORE_BUS_STOPS.find(s => s.BusStopCode === stopItem.BusStopCode);

              return (
                <div key={stopItem.BusStopCode} className="relative pl-6 group">
                  {/* Timeline Node */}
                  <span 
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                      isCurrent 
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30' 
                        : 'bg-white dark:bg-slate-900 border-slate-400 group-hover:border-emerald-500'
                    }`}
                  />

                  <div 
                    onClick={() => {
                      if (fullStopData) {
                        onSelectStop(fullStopData);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isCurrent 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{stopItem.Description}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono">
                            You are here
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {stopItem.BusStopCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>{stopItem.RoadName}</span>
                      <span className="font-mono text-[11px] text-slate-400">{stopItem.DistanceKm} km</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Tap any stop to switch arrivals view</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
