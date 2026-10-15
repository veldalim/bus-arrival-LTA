import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Building2 } from 'lucide-react';
import { Currency } from '../data/currencies';

interface CustomRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  liveRate: number;
  currentOverride?: number;
  onSaveOverride: (currencyCode: string, rate: number | null) => void;
}

export const CustomRateModal: React.FC<CustomRateModalProps> = ({
  isOpen,
  onClose,
  currency,
  liveRate,
  currentOverride,
  onSaveOverride,
}) => {
  const [rateInput, setRateInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setRateInput(currentOverride ? currentOverride.toString() : liveRate.toString());
    }
  }, [isOpen, currentOverride, liveRate]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) {
      onSaveOverride(currency.code, val);
      onClose();
    }
  };

  const handleResetToLive = () => {
    onSaveOverride(currency.code, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-rate-title"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="custom-rate-title" className="text-base font-bold text-slate-900">
                Custom Cash Exchange Rate
              </h2>
              <div className="text-xs text-slate-400">
                Physical Money Changer / Cash Overwrite
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Live Interbank Market Rate:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              1 SGD = {liveRate.toFixed(4)} {currency.code}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Custom Rate (1 SGD = ? {currency.code})
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                min="0.00001"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-lg text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white tabular-nums"
                required
              />
              <span className="absolute right-4 font-semibold text-sm text-slate-400 pointer-events-none">
                {currency.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              e.g. Rate obtained at The Arcade (Raffles Place), Chinatown, or Mustafa Centre.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {currentOverride ? (
              <button
                type="button"
                onClick={handleResetToLive}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Live FX</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs shadow-rose-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Rate</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
