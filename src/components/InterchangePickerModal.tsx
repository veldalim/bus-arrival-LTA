import React from 'react';
import { X, Train, MapPin } from 'lucide-react';
import { LtaBusStop, SINGAPORE_BUS_STOPS } from '../data/singaporeBusData';

interface InterchangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStop: (stop: LtaBusStop) => void;
  currentStopCode: string;
}

const MAJOR_INTERCHANGES = [
  { code: '09048', name: 'Lucky Plaza / Orchard', tag: 'Orchard Belt', mrt: ['NS22', 'TE14'] },
  { code: '08138', name: 'Dhoby Ghaut Interchange', tag: 'Central Line', mrt: ['NS24', 'NE6', 'CC1'] },
  { code: '04179', name: 'Ocean Financial / Raffles Place', tag: 'Downtown CBD', mrt: ['EW14', 'NS26'] },
  { code: '03509', name: 'Marina Bay Sands', tag: 'Bayfront Hub', mrt: ['DT16', 'CE1'] },
  { code: '28009', name: 'Jurong East Interchange', tag: 'West Hub', mrt: ['NS1', 'EW24'] },
  { code: '75009', name: 'Tampines Interchange', tag: 'East Hub', mrt: ['EW2', 'DT32'] },
  { code: '46009', name: 'Woodlands Integrated Hub', tag: 'North Hub', mrt: ['NS9', 'TE2'] },
  { code: '66009', name: 'Serangoon Interchange / NEX', tag: 'North-East Hub', mrt: ['NE12', 'CC13'] },
  { code: '17009', name: 'Clementi Interchange', tag: 'West Corridor', mrt: ['EW23'] },
  { code: '84009', name: 'Bedok Interchange', tag: 'East Coast', mrt: ['EW5'] },
  { code: '53009', name: 'Bishan Interchange / Junction 8', tag: 'Central Transit', mrt: ['NS17', 'CC15'] },
  { code: '95109', name: 'Changi Airport Terminal 3', tag: 'Aviation Hub', mrt: ['CG2'] }
];

export const InterchangePickerModal: React.FC<InterchangePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectStop,
  currentStopCode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
              <Train className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Major Singapore Transit Hubs</h3>
              <p className="text-xs text-slate-500">Key bus interchanges and high-traffic MRT connection points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {MAJOR_INTERCHANGES.map((item) => {
            const stopData = SINGAPORE_BUS_STOPS.find(s => s.BusStopCode === item.code);
            if (!stopData) return null;
            const isSelected = item.code === currentStopCode;

            return (
              <button
                key={item.code}
                onClick={() => {
                  onSelectStop(stopData);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.tag}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {item.code}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">
                    {item.name}
                  </div>

                  <div className="text-slate-500 text-xs mt-0.5">
                    {stopData.RoadName}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {item.mrt.map(line => (
                      <span 
                        key={line} 
                        className="px-1.5 py-0.5 rounded font-mono font-bold text-[9px] text-white"
                        style={{
                          backgroundColor: line.startsWith('NS') ? '#d42e12' :
                                           line.startsWith('EW') ? '#009645' :
                                           line.startsWith('NE') ? '#8f1a95' :
                                           line.startsWith('CC') ? '#fa9e0d' :
                                           line.startsWith('DT') ? '#005ec4' :
                                           line.startsWith('TE') ? '#9d5b25' : '#555'
                        }}
                      >
                        {line}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {stopData.services.length} lines
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
