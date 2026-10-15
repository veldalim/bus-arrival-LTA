import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown, Sparkles, Percent, Edit3, Keyboard, Check } from 'lucide-react';
import { Currency, SGD_CURRENCY } from '../data/currencies';
import { calculateToSGD, calculateFromSGD, formatCurrencyValue } from '../services/exchangeRates';
import { QuickKeypad } from './QuickKeypad';

interface ConverterCardProps {
  foreignCurrency: Currency;
  onOpenCurrencyPicker: () => void;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
  spreadPercent: number;
  onSpreadChange: (spread: number) => void;
  onOpenCustomRateModal: () => void;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  foreignCurrency,
  onOpenCurrencyPicker,
  rates,
  customOverrides,
  spreadPercent,
  onSpreadChange,
  onOpenCustomRateModal,
}) => {
  // Mode: true = Foreign -> SGD, false = SGD -> Foreign
  const [isForeignToSGD, setIsForeignToSGD] = useState(true);
  
  // The primary input value as a raw string so users can type '12.' or '0' naturally
  const [inputValueStr, setInputValueStr] = useState<string>('100');
  const [showKeypad, setShowKeypad] = useState<boolean>(true);

  const numericInput = parseFloat(inputValueStr) || 0;

  // Perform conversion
  const conversion = isForeignToSGD
    ? calculateToSGD(numericInput, foreignCurrency.code, rates, customOverrides, spreadPercent)
    : calculateFromSGD(numericInput, foreignCurrency.code, rates, customOverrides, spreadPercent);

  const rawRate = customOverrides[foreignCurrency.code] || rates[foreignCurrency.code] || foreignCurrency.defaultRatePerSGD;
  const hasCustomOverride = Boolean(customOverrides[foreignCurrency.code]);

  // Keypad interactions
  const handleDigit = (digit: string) => {
    if (digit === '.') {
      if (inputValueStr.includes('.')) return;
      if (inputValueStr === '' || inputValueStr === '0') {
        setInputValueStr('0.');
        return;
      }
      setInputValueStr(inputValueStr + '.');
      return;
    }
    if (digit === '00') {
      if (inputValueStr === '0' || inputValueStr === '') return;
      setInputValueStr(inputValueStr + '00');
      return;
    }
    if (inputValueStr === '0') {
      setInputValueStr(digit);
      return;
    }
    // Limit to reasonable length
    if (inputValueStr.length >= 12) return;
    setInputValueStr(inputValueStr + digit);
  };

  const handleBackspace = () => {
    if (inputValueStr.length <= 1) {
      setInputValueStr('0');
    } else {
      setInputValueStr(inputValueStr.slice(0, -1));
    }
  };

  const handleClear = () => {
    setInputValueStr('0');
  };

  const handleAddStep = (step: number) => {
    const current = parseFloat(inputValueStr) || 0;
    const next = current + step;
    setInputValueStr(next.toString());
  };

  const handlePresetClick = (amount: number) => {
    setInputValueStr(amount.toString());
  };

  const handleSwapDirection = () => {
    // When swapping, calculate equivalent output as the new input
    const newStr = isForeignToSGD 
      ? conversion.sgdAmount.toFixed(2) 
      : conversion.foreignAmount.toFixed(foreignCurrency.decimals);
    setInputValueStr(parseFloat(newStr).toString());
    setIsForeignToSGD(!isForeignToSGD);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Top Banner / Direction Switch */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isForeignToSGD ? 'Convert to SGD' : 'Convert from SGD'}
          </span>
          {hasCustomOverride && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
              Custom Rate Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwapDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            title="Swap conversion direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Reverse</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKeypad(!showKeypad)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showKeypad
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle On-Screen Touch Keypad"
            aria-label="Toggle keypad"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Source Currency Input Area */}
        <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/70 focus-within:border-rose-400 focus-within:bg-white transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              {isForeignToSGD ? 'You Pay (Foreign Currency)' : 'You Pay (Singapore Dollars)'}
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {isForeignToSGD ? foreignCurrency.symbol : SGD_CURRENCY.symbol}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Currency Selector Button */}
            {isForeignToSGD ? (
              <button
                type="button"
                onClick={onOpenCurrencyPicker}
                className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs shrink-0"
              >
                <span className="text-2xl leading-none">{foreignCurrency.flag}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 leading-none">
                    {foreignCurrency.code}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                    {foreignCurrency.name}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200 shrink-0">
                <span className="text-2xl leading-none">{SGD_CURRENCY.flag}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 leading-none">SGD</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                    Singapore Dollar
                  </div>
                </div>
              </div>
            )}

            {/* Direct Input Field */}
            <div className="flex-1 text-right">
              <input
                type="text"
                inputMode="decimal"
                value={inputValueStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                  setInputValueStr(cleaned || '0');
                }}
                className="w-full text-right font-mono font-bold text-3xl sm:text-4xl text-slate-900 bg-transparent focus:outline-none tabular-nums"
                aria-label="Input amount"
              />
            </div>
          </div>

          {/* Quick presets row */}
          <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Quick:</span>
            {(isForeignToSGD ? foreignCurrency.presets : SGD_CURRENCY.presets).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetClick(amt)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer shrink-0 tabular-nums ${
                  numericInput === amt
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Mid-divider with Swap Icon */}
        <div className="relative flex items-center justify-center -my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <button
            type="button"
            onClick={handleSwapDirection}
            className="relative z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
            title="Swap currency direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Target Result Area */}
        <div className="bg-rose-50/40 p-4 sm:p-5 rounded-2xl border border-rose-100 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-900">
              {isForeignToSGD ? 'You Get (Singapore Dollars)' : 'You Get (Foreign Currency)'}
            </span>
            <span className="text-xs font-mono text-rose-600 tabular-nums">
              {isForeignToSGD ? SGD_CURRENCY.symbol : foreignCurrency.symbol}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Target Currency Badge */}
            {isForeignToSGD ? (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-rose-200/80 shrink-0">
                <span className="text-2xl leading-none">{SGD_CURRENCY.flag}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 leading-none">SGD</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                    Singapore Dollar
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenCurrencyPicker}
                className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs shrink-0"
              >
                <span className="text-2xl leading-none">{foreignCurrency.flag}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 leading-none">
                    {foreignCurrency.code}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                    {foreignCurrency.name}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
              </button>
            )}

            {/* Target Amount Output */}
            <div className="flex-1 text-right">
              <div className="font-mono font-bold text-3xl sm:text-4xl text-rose-600 tabular-nums tracking-tight">
                {isForeignToSGD
                  ? `S$ ${formatCurrencyValue(conversion.sgdAmount, 2)}`
                  : `${foreignCurrency.symbol} ${formatCurrencyValue(conversion.foreignAmount, foreignCurrency.decimals)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Live Exchange Rate & Breakdown Pill */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              1 SGD = {rawRate.toLocaleString('en-SG', { maximumFractionDigits: 4 })} {foreignCurrency.code}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-600 tabular-nums">
              1 {foreignCurrency.code} = S${(1 / rawRate).toFixed(4)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCustomRateModal}
              className="text-xs font-medium text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasCustomOverride ? 'Edit Custom Rate' : 'Set Cash Rate'}</span>
            </button>
          </div>
        </div>

        {/* Bank & Multi-currency Card Markup Fee Selector */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              <span>Card / Bank Spread Fee</span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
              {spreadPercent === 0 ? '0% (Exact Spot / Cash)' : `+${spreadPercent}% Fee`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Spot / Cash', val: 0, desc: 'Money Changer' },
              { label: '1.0% FX Card', val: 1.0, desc: 'YouTrip / Revolut' },
              { label: '2.0% Amaze', val: 2.0, desc: 'Instarem Amaze' },
              { label: '3.25% Bank', val: 3.25, desc: 'DBS / UOB / OCBC' },
            ].map((tier) => {
              const active = spreadPercent === tier.val;
              return (
                <button
                  key={tier.val}
                  type="button"
                  onClick={() => onSpreadChange(tier.val)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${active ? 'text-rose-700' : 'text-slate-800'}`}>
                      {tier.label}
                    </span>
                    {active && <Check className="w-3 h-3 text-rose-600 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {tier.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Tactile Keypad */}
        {showKeypad && (
          <div className="pt-2">
            <QuickKeypad
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onAddStep={handleAddStep}
              stepAmount={foreignCurrency.unitStep}
              currencySymbol={isForeignToSGD ? foreignCurrency.symbol : SGD_CURRENCY.symbol}
            />
          </div>
        )}
      </div>
    </div>
  );
};
