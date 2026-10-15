import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, Share2, Check, ArrowRight } from 'lucide-react';
import { Currency, CURRENCIES, SGD_CURRENCY } from '../data/currencies';
import { calculateToSGD, formatCurrencyValue } from '../services/exchangeRates';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currencyCode: string;
  createdAt: string;
}

interface ShoppingTallyProps {
  currentCurrency: Currency;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
  spreadPercent: number;
}

export const ShoppingTally: React.FC<ShoppingTallyProps> = ({
  currentCurrency,
  rates,
  customOverrides,
  spreadPercent,
}) => {
  const [items, setItems] = useState<ExpenseItem[]>(() => {
    try {
      const stored = localStorage.getItem('singarate_expenses_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Initial sample items for quick demonstration
    return [
      {
        id: '1',
        title: 'Dinner & Drinks',
        amount: currentCurrency.code === 'MYR' ? 148 : currentCurrency.code === 'JPY' ? 4200 : 85,
        currencyCode: currentCurrency.code,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Local Supermarket',
        amount: currentCurrency.code === 'MYR' ? 62 : currentCurrency.code === 'JPY' ? 1850 : 35,
        currencyCode: currentCurrency.code,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);
  const [copied, setCopied] = useState(false);

  // Sync selected currency if user switched outside
  useEffect(() => {
    setSelectedCurrencyCode(currentCurrency.code);
  }, [currentCurrency.code]);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem('singarate_expenses_v1', JSON.stringify(items));
    } catch {}
  }, [items]);

  const activeCurrency = CURRENCIES.find((c) => c.code === selectedCurrencyCode) || currentCurrency;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (isNaN(val) || val <= 0) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: newTitle.trim() || `Item ${items.length + 1}`,
      amount: val,
      currencyCode: selectedCurrencyCode,
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewAmount('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all items from this shopping tally?')) {
      setItems([]);
    }
  };

  // Compute total in SGD
  let totalSGD = 0;
  items.forEach((item) => {
    const conv = calculateToSGD(
      item.amount,
      item.currencyCode,
      rates,
      customOverrides,
      spreadPercent
    );
    totalSGD += conv.sgdAmount;
  });

  const handleCopySummary = () => {
    const lines = items.map((i) => {
      const conv = calculateToSGD(i.amount, i.currencyCode, rates, customOverrides, spreadPercent);
      return `• ${i.title}: ${i.amount} ${i.currencyCode} (≈ S$ ${conv.sgdAmount.toFixed(2)})`;
    });
    const summaryText = `SingaRate Trip Expense Tally:\n${lines.join('\n')}\nTotal in SGD: S$ ${totalSGD.toFixed(2)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Total SGD Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Overseas Shopping & Dining Tally
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add purchases in foreign currencies to track your live total in Singapore Dollars. Works 100% offline.
            </p>
          </div>

          <div className="text-left sm:text-right bg-rose-50/60 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-rose-100 sm:border-0">
            <span className="text-xs font-semibold text-slate-500">Total Spent:</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-600 tabular-nums">
              S$ {formatCurrencyValue(totalSGD, 2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {items.length} item{items.length === 1 ? '' : 's'} tallied
            </div>
          </div>
        </div>

        {/* Add item form */}
        <form onSubmit={handleAddItem} className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Currency</label>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Item / Merchant</label>
            <input
              type="text"
              placeholder="e.g. Uniqlo Ginza, Din Tai Fung, Taxi"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Amount</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 tabular-nums"
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full h-[38px] bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Receipt Items
          </span>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Breakdown'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No expenses recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your meals, shopping, or transport above to tally your trip spending into Singapore Dollars.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const itemCurr = CURRENCIES.find((c) => c.code === item.currencyCode) || currentCurrency;
              const converted = calculateToSGD(
                item.amount,
                item.currencyCode,
                rates,
                customOverrides,
                spreadPercent
              );

              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0 leading-none">{itemCurr.flag}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono tabular-nums">
                        {item.amount.toLocaleString()} {item.currencyCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                        S$ {formatCurrencyValue(converted.sgdAmount, 2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        Rate: 1 SGD = {converted.rawRate.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete item"
                      aria-label="Delete expense item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
