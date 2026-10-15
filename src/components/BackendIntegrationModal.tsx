import React, { useState } from 'react';
import { X, CheckCircle2, Server, Key, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed: () => void;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  onRefreshFeed
}) => {
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem('sgbus_backend_url') || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (backendUrl.trim()) {
      localStorage.setItem('sgbus_backend_url', backendUrl.trim());
    } else {
      localStorage.removeItem('sgbus_backend_url');
    }
    setTestResult({
      success: true,
      message: backendUrl.trim() ? 'Custom backend proxy configured!' : 'Switched back to built-in Singapore simulation engine.'
    });
    onRefreshFeed();
  };

  const handleTestPing = async () => {
    if (!backendUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a backend URL first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${backendUrl.trim().replace(/\/$/, '')}/lta/BusArrivalv2?BusStopCode=09048`);
      if (res.ok) {
        const json = await res.json();
        setTestResult({
          success: true,
          message: `Connected! Received ${json.Services?.length || 0} services for stop 09048.`
        });
      } else {
        setTestResult({
          success: false,
          message: `HTTP ${res.status}: ${res.statusText}. Check server route.`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'CORS or Network Error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const sampleServerCode = `// api/busarrival.ts - Serverless function for LTA DataMall v3
// GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
// Headers: AccountKey: <LTA_ACCOUNT_KEY>, accept: application/json

export default async function handler(req: any, res?: any) {
  const busStopCode = req.query?.BusStopCode || '83139';
  const serviceNo = req.query?.ServiceNo || '';
  const ltaAccountKey = process.env.LTA_ACCOUNT_KEY || '';

  const url = \`https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=\${busStopCode}\${serviceNo ? \`&ServiceNo=\${serviceNo}\` : ''}\`;

  const response = await fetch(url, {
    headers: {
      'AccountKey': ltaAccountKey,
      'accept': 'application/json'
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleServerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Serverless LTA Datamall Connection</h3>
              <p className="text-xs text-slate-500">Configured in /api/busarrival.ts and /api/health.ts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Status Alert */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Serverless Endpoints Active in /api
              </div>
              <p className="mt-1 text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Your application now has dedicated serverless proxy endpoints in <code className="font-mono bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded text-[11px]">/api/busarrival.ts</code> and <code className="font-mono bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded text-[11px]">/api/health.ts</code> ready to stream live data directly from LTA DataMall v3.
              </p>
            </div>
          </div>

          {/* Backend URL Config */}
          <div>
            <label className="block font-semibold text-slate-900 dark:text-slate-100 mb-1.5 text-xs">
              Custom Backend API Proxy URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="e.g. http://localhost:3000 or https://api.mytransit.sg"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                <span>Ping</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
              >
                Save
              </button>
            </div>

            {testResult && (
              <div className={`mt-2 p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
              }`}>
                <span>{testResult.message}</span>
              </div>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Leave blank to keep using the realistic Singapore client telemetry simulation engine.
            </p>
          </div>

          {/* Quick Setup Blueprint */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                LTA DataMall Proxy Server Blueprint
              </span>
              <button
                onClick={copyCode}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Server Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {sampleServerCode}
            </pre>
          </div>

          {/* LTA Portal link */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Need an official Singapore LTA API Key?</span>
            </div>
            <a
              href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>LTA DataMall Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
