'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface DiagResult {
  ok: boolean;
  message: string;
  error?: string;
  url?: string;
}

interface Diagnostics {
  allOk: boolean;
  config: {
    tokenSet: boolean;
  };
  tests: {
    uploadthingApi?: DiagResult;
  };
}

function TestRow({ label, result }: { label: string; result?: DiagResult }) {
  if (!result) return null;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${result.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      {result.ok ? (
        <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${result.ok ? 'text-emerald-800' : 'text-red-800'}`}>{label}</p>
        <p className={`text-sm mt-0.5 ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>{result.message}</p>
        {result.error && (
          <p className="text-xs text-red-500 mt-2 font-mono bg-red-100 border border-red-200 rounded-lg px-3 py-2 break-all">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function UploadDiagnosticsPage() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/upload-diagnostics');
      if (!res.ok && res.status !== 207) {
        setError('Chyba při načítání diagnostiky');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runDiagnostics(); }, []);

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Diagnostika uploadu</h1>
          <p className="mt-1 text-sm text-gray-400">Stav připojení k úložišti obrázků</p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Znovu otestovat
        </button>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center gap-3 p-6">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin shrink-0" />
          <p className="text-sm text-gray-500">Testuji připojení k úložišti…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">

          {/* Overall status banner */}
          <div className={`rounded-2xl border px-5 py-4 flex items-center gap-3 ${data.allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${data.allOk ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {data.allOk ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-bold ${data.allOk ? 'text-emerald-800' : 'text-red-800'}`}>
                {data.allOk ? 'Upload obrázků funguje správně' : 'Problém s uploadem obrázků'}
              </p>
              {!data.allOk && (
                <p className="text-xs text-red-600 mt-0.5">Zkontrolujte detaily níže a opravte konfiguraci.</p>
              )}
            </div>
          </div>

          {/* Config card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Konfigurace</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Služba</span>
                <span className="text-sm font-semibold text-gray-800">UploadThing</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-sm text-gray-500">API Token</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  data.config.tokenSet
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {data.config.tokenSet ? 'Nastaven' : 'Chybí UPLOADTHING_TOKEN'}
                </span>
              </div>
            </div>
          </div>

          {/* Test results */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Testy</p>
            <TestRow label="UploadThing API — připojení a autentizace" result={data.tests.uploadthingApi} />
          </div>

          {/* Fix instructions */}
          {!data.allOk && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Jak opravit</p>
              <ol className="space-y-3">
                {[
                  <>Přihlaste se na <a href="https://uploadthing.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline underline-offset-2">uploadthing.com</a> a vytvořte nový projekt.</>,
                  <>Jděte do <strong className="font-semibold">Dashboard → API Keys</strong> a zkopírujte token.</>,
                  <>Nastavte proměnnou <code className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">UPLOADTHING_TOKEN</code> v Replit Secrets.</>,
                  <>Spusťte tuto diagnostiku znovu pro ověření.</>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-500 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
