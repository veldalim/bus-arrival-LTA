import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';

interface QuickKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onAddStep: (step: number) => void;
  stepAmount: number;
  currencySymbol: string;
}

export const QuickKeypad: React.FC<QuickKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  onAddStep,
  stepAmount,
  currencySymbol,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '00'],
  ];

  return (
    <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 select-none">
      {/* Quick step additions */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <button
          type="button"
          onClick={() => onAddStep(stepAmount)}
          className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          +{stepAmount.toLocaleString()}
        </button>
        <button
          type="button"
          onClick={() => onAddStep(stepAmount * 5)}
          className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          +{(stepAmount * 5).toLocaleString()}
        </button>
        <button
          type="button"
          onClick={() => onAddStep(stepAmount * 10)}
          className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          +{(stepAmount * 10).toLocaleString()}
        </button>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {keys.map((row, rIdx) =>
            row.map((k) => (
              <button
                key={`${rIdx}-${k}`}
                type="button"
                onClick={() => onDigit(k)}
                className="h-12 sm:h-13 text-lg font-mono font-medium text-slate-900 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-100 active:scale-[0.96] transition-all cursor-pointer flex items-center justify-center shadow-xs"
              >
                {k}
              </button>
            ))
          )}
        </div>

        {/* Action column */}
        <div className="col-span-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClear}
            className="h-12 sm:h-13 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 active:scale-[0.96] transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
            title="Clear value"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>CLR</span>
          </button>
          
          <button
            type="button"
            onClick={onBackspace}
            className="flex-1 min-h-[52px] text-slate-700 bg-rose-50/70 border border-rose-200 rounded-xl hover:bg-rose-100 active:scale-[0.96] transition-all cursor-pointer flex items-center justify-center text-sm font-medium"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5 text-rose-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
