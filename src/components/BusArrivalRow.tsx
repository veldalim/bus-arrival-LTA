import React, { useState } from 'react';
import { OPERATOR_COLORS, LOAD_CONFIG, TYPE_CONFIG } from '../services/ltaBusApi';
import { ServiceArrival, BusArrivalInfo, BusOperator, BusLoad } from '../data/singaporeBusData';
import { Bus, Accessibility, ChevronDown, ChevronUp, Bell, MapPin, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

interface BusArrivalRowProps {
  arrival: ServiceArrival;
  isSelectedForRoute: boolean;
  onSelectRoute: (serviceNo: string) => void;
  onSetAlarm: (serviceNo: string, etaSeconds: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (serviceNo: string) => void;
}

export const BusArrivalRow: React.FC<BusArrivalRowProps> = ({
  arrival,
  isSelectedForRoute,
  onSelectRoute,
  onSetAlarm,
  isFavorite,
  onToggleFavorite
}) => {
  const [expanded, setExpanded] = useState(false);

  // Helper to format remaining time
  const getEtaDetails = (etaIso?: string) => {
    if (!etaIso) return { label: '-', sub: '', minutes: 999, isArriving: false };
    const diffMs = new Date(etaIso).getTime() - Date.now();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;

    if (totalSecs <= 45) {
      return { label: 'Arr', sub: 'Now', minutes: 0, isArriving: true, totalSecs };
    }
    if (mins < 1) {
      return { label: `${secs}s`, sub: 'due', minutes: 0, isArriving: true, totalSecs };
    }
    return { label: `${mins}`, sub: 'min', minutes: mins, isArriving: false, totalSecs };
  };

  const next1Eta = getEtaDetails(arrival.NextBus?.EstimatedArrival);
  const next2Eta = getEtaDetails(arrival.NextBus2?.EstimatedArrival);
  const next3Eta = getEtaDetails(arrival.NextBus3?.EstimatedArrival);

  const operatorInfo = OPERATOR_COLORS[arrival.Operator as BusOperator] || OPERATOR_COLORS.SBST;

  const renderBusPill = (bus?: BusArrivalInfo, eta?: ReturnType<typeof getEtaDetails>, rank: number = 1) => {
    if (!bus || !eta || eta.minutes === 999) {
      return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 min-w-[76px] h-[68px]">
          <span className="text-xs font-mono">-</span>
        </div>
      );
    }

    const loadStyle = LOAD_CONFIG[bus.Load as BusLoad] || LOAD_CONFIG.SEA;
    const isImminent = eta.isArriving;

    return (
      <div 
        className={`flex flex-col justify-between p-2 rounded-xl min-w-[80px] h-[68px] border transition-all ${
          isImminent 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' 
            : eta.minutes <= 4 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
          </span>
          <div className="flex items-center gap-1">
            {bus.Feature === 'WAB' && (
              <span title="Wheelchair Accessible">
                <Accessibility className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              </span>
            )}
            <span 
              className={`w-2 h-2 rounded-full ${loadStyle.indicator}`} 
              title={loadStyle.label}
            />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-0.5">
          <span className="text-base font-bold font-mono tabular-nums leading-none">
            {eta.label}
          </span>
          <span className="text-[10px] font-medium text-slate-500 lowercase leading-none">
            {eta.sub}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span>{bus.Type}</span>
          <span>{bus.SpeedKmh}k/h</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isSelectedForRoute 
        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-xs' 
        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
    }`}>
      {/* Primary Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Service Badge & Operator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectRoute(arrival.ServiceNo)}
            className="flex items-center justify-center min-w-[56px] h-12 px-3 rounded-xl bg-slate-950 text-white font-mono font-extrabold text-lg tracking-tight hover:bg-emerald-600 transition-colors shadow-xs group"
            title="Click to view live bus route & GPS telemetry"
          >
            <span>{arrival.ServiceNo}</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {operatorInfo.name}
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {arrival.NextBus.StopsAway === 0 ? 'Next at stop' : `${arrival.NextBus.StopsAway} stops away`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                ~{arrival.NextBus.DistanceMeters}m
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {arrival.NextBus.ConfidencePct}% Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Arrival Forecast Boxes */}
        <div className="flex items-center gap-2">
          {renderBusPill(arrival.NextBus, next1Eta, 1)}
          <div className="hidden sm:block">
            {renderBusPill(arrival.NextBus2, next2Eta, 2)}
          </div>
          <div className="hidden md:block">
            {renderBusPill(arrival.NextBus3, next3Eta, 3)}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => onSelectRoute(arrival.ServiceNo)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                isSelectedForRoute 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="Track live buses & route map"
            >
              <MapPin className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSetAlarm(arrival.ServiceNo, next1Eta.totalSecs || 120)}
              className="p-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Set bus arrival alarm"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Show live vehicle telemetry"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Telemetry Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Bus className="w-3 h-3 text-slate-500" />
              <span>Vehicle Plate</span>
            </div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {arrival.NextBus.VehiclePlate || 'SG5921A'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-500" />
              <span>Speed & Distance</span>
            </div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {arrival.NextBus.SpeedKmh} km/h · {arrival.NextBus.DistanceMeters}m
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Passenger Load</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {LOAD_CONFIG[arrival.NextBus.Load as BusLoad]?.label} ({arrival.NextBus.Type})
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-500" />
              <span>LTA ETA Precision</span>
            </div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {arrival.NextBus.ConfidencePct}% Accuracy
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
