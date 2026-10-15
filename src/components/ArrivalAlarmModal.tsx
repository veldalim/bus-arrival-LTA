import React, { useState } from 'react';
import { X, Bell, Volume2, CheckCircle2 } from 'lucide-react';

interface ArrivalAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceNo: string;
  initialEtaSeconds: number;
}

export const ArrivalAlarmModal: React.FC<ArrivalAlarmModalProps> = ({
  isOpen,
  onClose,
  serviceNo,
  initialEtaSeconds
}) => {
  const [notifyBeforeMins, setNotifyBeforeMins] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAlarmSet, setIsAlarmSet] = useState(false);

  if (!isOpen) return null;

  const playSynthesizedChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  };

  const handleSetAlarm = () => {
    if (soundEnabled) {
      playSynthesizedChime();
    }
    setIsAlarmSet(true);
    setTimeout(() => {
      onClose();
      setIsAlarmSet(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Set Arrival Alarm</h3>
              <p className="text-xs text-slate-500">Bus {serviceNo} Arrival Notification</p>
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
          {isAlarmSet ? (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Alarm Active!
              </div>
              <p className="text-xs text-slate-500 mt-1">
                You will be alerted when Bus {serviceNo} is {notifyBeforeMins} minutes away.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Alert me when Bus {serviceNo} is:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setNotifyBeforeMins(mins)}
                      className={`py-3 px-3 rounded-2xl border font-bold text-sm transition-all ${
                        notifyBeforeMins === mins
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins} min prior
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Play Chime Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={playSynthesizedChime}
                    className="text-[11px] text-emerald-600 font-semibold hover:underline"
                  >
                    Test Tone
                  </button>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Keep this browser tab open to receive the audio chime when the bus reaches the threshold.
              </p>

              <button
                onClick={handleSetAlarm}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                Confirm Alarm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
