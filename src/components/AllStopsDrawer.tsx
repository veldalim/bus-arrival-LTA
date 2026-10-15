import React, { useState } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { LtaBusStop, SINGAPORE_BUS_STOPS } from '../data/singaporeBusData';
import { searchBusStops } from '../services/ltaBusApi';

interface AllStopsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStop: (stop: LtaBusStop) => void;
  currentStopCode: string;
}

export const AllStopsDrawer: React.FC<AllStopsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectStop,
  currentStopCode
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredStops = searchBusStops(search);

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-slide-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Singapore Bus Stop Directory</h3>
            <p className="text-xs text-slate-500">Search by 5-digit LTA code, road name, or bus service</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search e.g. 09048, Lucky Plaza, Orchard, or Bus 190..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredStops.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching Singapore bus stops found for "{search}".
            </div>
          ) : (
            filteredStops.map((stop) => {
              const isSelected = stop.BusStopCode === currentStopCode;

              return (
                <div
                  key={stop.BusStopCode}
                  onClick={() => {
                    onSelectStop(stop);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {stop.BusStopCode}
                    </span>
                    {stop.mrtInterchange && stop.mrtInterchange.length > 0 && (
                      <div className="flex items-center gap-1">
                        {stop.mrtInterchange.map(mrt => (
                          <span
                            key={mrt}
                            className="text-[9px] font-mono font-bold px-1 py-0.2 rounded text-white"
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
                      </div>
                    )}
                  </div>

                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                    {stop.Description}
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{stop.RoadName}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                    {stop.services.slice(0, 10).map((svc) => (
                      <span
                        key={svc}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold"
                      >
                        {svc}
                      </span>
                    ))}
                    {stop.services.length > 10 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{stop.services.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>{filteredStops.length} stops available</span>
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
