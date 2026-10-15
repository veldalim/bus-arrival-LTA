import { CURRENCIES, Currency } from '../data/currencies';

export interface RatesState {
  rates: Record<string, number>; // Foreign currency units per 1 SGD
  lastUpdated: string;
  source: 'live' | 'cache' | 'baseline';
  isOnline: boolean;
  forceOffline: boolean;
  spreadPercent: number; // e.g. 0% (spot), 1.5% (multi-currency card), 3.25% (credit card fee)
  customOverrides: Record<string, number>;
}

const STORAGE_KEYS = {
  RATES: 'singarate_cached_rates_v1',
  LAST_UPDATED: 'singarate_last_updated_v1',
  SPREAD: 'singarate_spread_pct_v1',
  OVERRIDES: 'singarate_overrides_v1',
  FORCE_OFFLINE: 'singarate_force_offline_v1',
  WATCHLIST: 'singarate_watchlist_v1',
  EXPENSES: 'singarate_expenses_v1',
};

// Initial baseline rates compiled from CURRENCIES
export const getBaselineRates = (): Record<string, number> => {
  const map: Record<string, number> = { SGD: 1.0 };
  CURRENCIES.forEach((c) => {
    map[c.code] = c.defaultRatePerSGD;
  });
  return map;
};

export const loadStoredRatesState = (): RatesState => {
  const baseline = getBaselineRates();
  let cachedRates = baseline;
  let lastUpdated = new Date().toISOString();
  let source: RatesState['source'] = 'baseline';

  try {
    const storedRatesJson = localStorage.getItem(STORAGE_KEYS.RATES);
    const storedDate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    if (storedRatesJson) {
      const parsed = JSON.parse(storedRatesJson);
      cachedRates = { ...baseline, ...parsed };
      source = 'cache';
    }
    if (storedDate) {
      lastUpdated = storedDate;
    }
  } catch (err) {
    console.warn('Failed to load cached rates from storage', err);
  }

  const forceOffline = localStorage.getItem(STORAGE_KEYS.FORCE_OFFLINE) === 'true';
  const spreadPercent = parseFloat(localStorage.getItem(STORAGE_KEYS.SPREAD) || '0');
  
  let customOverrides: Record<string, number> = {};
  try {
    const rawOverrides = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    if (rawOverrides) {
      customOverrides = JSON.parse(rawOverrides);
    }
  } catch {
    customOverrides = {};
  }

  return {
    rates: cachedRates,
    lastUpdated,
    source,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    forceOffline,
    spreadPercent: isNaN(spreadPercent) ? 0 : spreadPercent,
    customOverrides,
  };
};

export const saveRatesToCache = (rates: Record<string, number>, timestamp: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, timestamp);
  } catch (e) {
    console.error('Failed to cache rates', e);
  }
};

export const saveCustomOverrides = (overrides: Record<string, number>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save overrides', e);
  }
};

export const saveSpreadPercent = (spread: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SPREAD, spread.toString());
  } catch (e) {
    console.error('Failed to save spread', e);
  }
};

export const saveForceOffline = (val: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FORCE_OFFLINE, val ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save force offline flag', e);
  }
};

// Fetch real-time live rates from open FX API
export const fetchLiveRates = async (): Promise<{ rates: Record<string, number>; timestamp: string } | null> => {
  const endpoints = [
    'https://open.er-api.com/v6/latest/SGD',
    'https://api.frankfurter.app/latest?from=SGD',
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();

      if (data && data.rates && typeof data.rates === 'object') {
        const cleanedRates: Record<string, number> = { SGD: 1.0 };
        // Combine baseline with returned rates to make sure all custom currencies exist
        const baseline = getBaselineRates();
        Object.keys(baseline).forEach((code) => {
          if (data.rates[code] && typeof data.rates[code] === 'number') {
            cleanedRates[code] = data.rates[code];
          } else {
            cleanedRates[code] = baseline[code];
          }
        });

        const timestamp = data.time_last_update_utc 
          ? new Date(data.time_last_update_utc).toISOString() 
          : new Date().toISOString();

        saveRatesToCache(cleanedRates, timestamp);
        return { rates: cleanedRates, timestamp };
      }
    } catch (err) {
      console.warn(`Fetch from ${url} failed, checking next fallback...`, err);
    }
  }

  return null;
};

/**
 * Calculates conversion to SGD.
 * Formula: Foreign amount * (1 / ratePerSGD) * (1 + spread/100)
 */
export const calculateToSGD = (
  foreignAmount: number,
  currencyCode: string,
  rates: Record<string, number>,
  customOverrides: Record<string, number>,
  spreadPercent = 0
): { sgdAmount: number; foreignAmount: number; effectiveRate: number; rawRate: number } => {
  if (currencyCode === 'SGD') {
    return { sgdAmount: foreignAmount, foreignAmount, effectiveRate: 1, rawRate: 1 };
  }

  const rawRate = customOverrides[currencyCode] || rates[currencyCode] || 1;
  const spreadMultiplier = 1 + (spreadPercent / 100);
  
  // 1 SGD = rawRate Foreign
  // 1 Foreign = 1 / rawRate SGD
  const sgdAmount = (foreignAmount / rawRate) * spreadMultiplier;
  const effectiveRate = rawRate / spreadMultiplier;

  return {
    sgdAmount,
    foreignAmount,
    effectiveRate,
    rawRate,
  };
};

/**
 * Calculates conversion from SGD into foreign currency.
 */
export const calculateFromSGD = (
  sgdAmount: number,
  currencyCode: string,
  rates: Record<string, number>,
  customOverrides: Record<string, number>,
  spreadPercent = 0
): { sgdAmount: number; foreignAmount: number; effectiveRate: number; rawRate: number } => {
  if (currencyCode === 'SGD') {
    return { sgdAmount, foreignAmount: sgdAmount, effectiveRate: 1, rawRate: 1 };
  }

  const rawRate = customOverrides[currencyCode] || rates[currencyCode] || 1;
  const spreadMultiplier = 1 - (spreadPercent / 100);
  const foreignAmount = (sgdAmount * rawRate) * spreadMultiplier;
  const effectiveRate = rawRate * spreadMultiplier;

  return {
    sgdAmount,
    foreignAmount,
    effectiveRate,
    rawRate,
  };
};

/**
 * Format currency number cleanly based on currency decimals
 */
export const formatCurrencyValue = (val: number, decimals = 2): string => {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

/**
 * Realistic deterministic 7-day to 30-day simulated historical rates based on seed
 * Provides instant rich chart analysis even offline!
 */
export interface TrendPoint {
  date: string;
  dayLabel: string;
  rate: number;
}

export const getHistoricalTrends = (
  baseRate: number,
  days = 14
): { points: TrendPoint[]; min: number; max: number; avg: number; changePct: number } => {
  const points: TrendPoint[] = [];
  const now = new Date();
  
  // Slight deterministic variance curve
  let running = baseRate * 0.985;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Wave oscillation with micro daily fluctuation
    const dayFactor = Math.sin((d.getDate() + d.getMonth() * 3) * 0.7) * 0.012;
    const randomStep = ((i * 7 + 13) % 19 - 9) * 0.0015;
    
    // Move towards baseRate at day 0
    const pullFactor = (days - 1 - i) / (days - 1);
    const target = running + (baseRate - running) * pullFactor;
    const rateVal = i === 0 ? baseRate : Number((target * (1 + dayFactor + randomStep)).toFixed(4));
    
    points.push({
      date: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' }),
      rate: rateVal,
    });
  }

  const ratesArr = points.map((p) => p.rate);
  const min = Math.min(...ratesArr);
  const max = Math.max(...ratesArr);
  const avg = ratesArr.reduce((a, b) => a + b, 0) / ratesArr.length;
  const firstRate = points[0].rate;
  const lastRate = points[points.length - 1].rate;
  const changePct = ((lastRate - firstRate) / firstRate) * 100;

  return { points, min, max, avg, changePct };
};
