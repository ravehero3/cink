'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface DiagResult {
  ok: boolean;
  message: string;
  error?: string;
  url?: string;
}

interface Diagnostics {
  allOk: boolean;
  config: {
    cloudName: string;
    apiKeySet: boolean;
    apiSecretSet: boolean;
    uploadPreset: string;
  };
  tests: {
    unsignedUpload?: DiagResult;
    signedApi?: DiagResult;
  };
}

function TestRow({ label, result }: { label: string; result?: DiagResult }) {
  if (!result) return null;
  return (
    <div className={`flex items-start gap-3 p-4 border ${result.ok ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
      {result.ok ? (
        <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium text-sm uppercase">{label}</p>
        <p className={`text-sm mt-0.5 ${result.ok ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </p>
        {result.error && (
          <p className="text-xs text-red-500 mt-1 font-mono bg-red-100 px-2 py-1 border border-red-200">
            {result.error}
          </p>
        )}
        {result.url && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-700 underline mt-1 inline-block"
          >
            Zobrazit testovací obrázek →
          </a>
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
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-title font-bold">DIAGNOSTIKA UPLOADU OBRÁZKŮ</h1>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-black text-sm uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Znovu otestovat
        </button>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-3 p-6 border border-black">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-body">Testuji připojení k Cloudinary…</p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-400 bg-red-50 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div
            className={`p-4 border-2 text-center font-bold uppercase text-sm ${
              data.allOk
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-red-500 bg-red-50 text-red-800'
            }`}
          >
            {data.allOk
              ? '✓ Upload obrázků funguje správně'
              : '✗ Problém s uploadem obrázků — viz detaily níže'}
          </div>

          <div className="border border-black p-4 space-y-2">
            <h2 className="font-bold text-sm uppercase mb-3">Konfigurace</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Cloud Name</span>
              <span className="font-mono">{data.config.cloudName}</span>
              <span className="text-gray-600">API Key</span>
              <span className={data.config.apiKeySet ? 'text-green-600' : 'text-red-600'}>
                {data.config.apiKeySet ? '✓ Nastaven' : '✗ Chybí'}
              </span>
              <span className="text-gray-600">API Secret</span>
              <span className={data.config.apiSecretSet ? 'text-green-600' : 'text-red-600'}>
                {data.config.apiSecretSet ? '✓ Nastaven' : '✗ Chybí'}
              </span>
              <span className="text-gray-600">Upload Preset</span>
              <span className="font-mono">{data.config.uploadPreset}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-bold text-sm uppercase">Testy</h2>
            <TestRow label="Unsigned upload (přímý upload bez autentizace)" result={data.tests.unsignedUpload} />
            <TestRow label="Signed API (server-side upload)" result={data.tests.signedApi} />
          </div>

          {!data.allOk && (
            <div className="border border-black p-5 bg-gray-50">
              <h3 className="font-bold text-sm uppercase mb-3">Jak opravit</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside text-gray-700">
                <li>
                  Vytvořte si <strong>bezplatný účet na Cloudinary</strong>:{' '}
                  <a href="https://cloudinary.com/users/register/free" target="_blank" rel="noopener noreferrer" className="underline">
                    cloudinary.com/users/register/free
                  </a>
                </li>
                <li>
                  V Cloudinary dashboardu jděte do <strong>Settings → Upload → Upload presets</strong> a vytvořte preset
                  s názvem <code className="bg-gray-200 px-1">ufosport_unsigned</code> (Signing Mode: Unsigned)
                </li>
                <li>
                  Zkopírujte <strong>Cloud Name, API Key a API Secret</strong> z Dashboard → API Keys
                </li>
                <li>
                  Nastavte tyto hodnoty jako environment variables:{' '}
                  <code className="bg-gray-200 px-1">CLOUDINARY_CLOUD_NAME</code>,{' '}
                  <code className="bg-gray-200 px-1">CLOUDINARY_API_KEY</code>,{' '}
                  <code className="bg-gray-200 px-1">CLOUDINARY_API_SECRET</code>,{' '}
                  <code className="bg-gray-200 px-1">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>
                </li>
                <li>Spusťte tuto diagnostiku znovu pro ověření.</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
