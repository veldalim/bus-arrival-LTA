import React, { useState } from 'react';
import { X, Calculator, CreditCard, Info } from 'lucide-react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusData';
import { calculateSgTransitFare } from '../services/ltaBusApi';

interface FareEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOriginStopCode?: string;
}

export const FareEstimatorModal: React.FC<FareEstimatorModalProps> = ({
  isOpen,
  onClose,
  defaultOriginStopCode
}) => {
  const [originCode, setOriginCode] = useState(defaultOriginStopCode || SINGAPORE_BUS_STOPS[0].BusStopCode);
  const [destCode, setDestCode] = useState(SINGAPORE_BUS_STOPS[1]?.BusStopCode || SINGAPORE_BUS_STOPS[0].BusStopCode);
  const [category, setCategory] = useState<'adult' | 'senior' | 'student' | 'workfare'>('adult');

  if (!isOpen) return null;

  const originStop = SINGAPORE_BUS_STOPS.find(s => s.BusStopCode === originCode) || SINGAPORE_BUS_STOPS[0];
  const destStop = SINGAPORE_BUS_STOPS.find(s => s.BusStopCode === destCode) || SINGAPORE_BUS_STOPS[1];

  // Calculate approximate road distance using coordinates
  const R = 6371;
  const dLat = (destStop.Latitude - originStop.Latitude) * Math.PI / 180;
  const dLon = (destStop.Longitude - originStop.Longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(originStop.Latitude * Math.PI / 180) * Math.cos(destStop.Latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistKm = R * c;
  // Road travel factor in urban Singapore is approx 1.35x crow-flies distance
  const roadDistKm = Math.max(1.2, directDistKm * 1.35);

  const fareResult = calculateSgTransitFare(roadDistKm, category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">LTA Distance Fare Calculator</h3>
              <p className="text-xs text-slate-500">Official PTC Singapore Distance Fares framework</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Origin Stop Select */}
          <div>
            <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Boarding Stop
            </label>
            <select
              value={originCode}
              onChange={(e) => setOriginCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {SINGAPORE_BUS_STOPS.map(s => (
                <option key={s.BusStopCode} value={s.BusStopCode}>
                  {s.Description} ({s.BusStopCode}) · {s.RoadName}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Stop Select */}
          <div>
            <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Alighting Stop
            </label>
            <select
              value={destCode}
              onChange={(e) => setDestCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {SINGAPORE_BUS_STOPS.map(s => (
                <option key={s.BusStopCode} value={s.BusStopCode}>
                  {s.Description} ({s.BusStopCode}) · {s.RoadName}
                </option>
              ))}
            </select>
          </div>

          {/* Rider Category Interactive Filter Tabs */}
          <div>
            <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Passenger Fare Category
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {[
                { id: 'adult', label: 'Adult' },
                { id: 'student', label: 'Student' },
                { id: 'senior', label: 'Senior' },
                { id: 'workfare', label: 'Workfare' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors ${
                    category === item.id 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Card Fare (SimplyGo / EZ-Link)</span>
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {fareResult.fareFormatted}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {fareResult.stageInfo}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-medium">
                Distance Tier
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Max 45m Transfer
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Fare calculated using Singapore Public Transport Council (PTC) distance fare formula. Multiple bus transfers within 45 minutes count as one continuous journey without re-charging the base boarding fare.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
