'use client';

import { useEffect, useState } from 'react';

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
    <div className="flex items-start gap-3 border border-black p-4 bg-white">
      <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-[2px]">
        {result.ok ? '[ OK ]' : '[ CHYBA ]'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs uppercase tracking-wider text-[#666666] mt-[4px]">{result.message}</p>
        {result.error && (
          <p className="text-xs mt-2 font-mono border border-black px-3 py-2 break-all">
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
    <div className="space-y-[24px] max-w-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-black pb-4">
        <div>
          <h1 className="admin-title">Diagnostika uploadu</h1>
          <p className="admin-sub">Stav připojení k úložišti obrázků</p>
        </div>
        <button onClick={runDiagnostics} disabled={loading} className="admin-btn admin-btn-secondary">
          Znovu otestovat
        </button>
      </div>

      {loading && !data && (
        <div className="admin-card flex items-center gap-3 p-[24px]">
          <div className="admin-spinner shrink-0" />
          <p className="admin-sub" style={{ margin: 0 }}>Testuji připojení k úložišti…</p>
        </div>
      )}

      {error && (
        <div className="border border-black px-4 py-3 text-xs uppercase tracking-wider">
          <span className="font-bold">[ CHYBA ]</span> {error}
        </div>
      )}

      {data && (
        <div className="space-y-[16px]">
          <div className="admin-card px-[20px] py-[16px] flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest shrink-0">
              {data.allOk ? '[ OK ]' : '[ CHYBA ]'}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {data.allOk ? 'Upload obrázků funguje správně' : 'Problém s uploadem obrázků'}
              </p>
              {!data.allOk && (
                <p className="admin-sub">Zkontrolujte detaily níže a opravte konfiguraci.</p>
              )}
            </div>
          </div>

          <div className="admin-card p-[20px]">
            <p className="admin-label">Konfigurace</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#666666]">Služba</span>
                <span className="text-xs uppercase tracking-wider font-bold">UploadThing</span>
              </div>
              <div className="flex items-center justify-between border-t border-black pt-3">
                <span className="text-xs uppercase tracking-wider text-[#666666]">API Token</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-[4px] border border-black">
                  {data.config.tokenSet ? 'Nastaven' : 'Chybí UPLOADTHING_TOKEN'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="admin-label">Testy</p>
            <TestRow label="UploadThing API — připojení a autentizace" result={data.tests.uploadthingApi} />
          </div>

          {!data.allOk && (
            <div className="admin-card p-[20px]">
              <p className="admin-label">Jak opravit</p>
              <ol className="space-y-3">
                {[
                  <>Přihlaste se na <a href="https://uploadthing.com" target="_blank" rel="noopener noreferrer" className="underline">uploadthing.com</a> a vytvořte nový projekt.</>,
                  <>Jděte do Dashboard → API Keys a zkopírujte token.</>,
                  <>Nastavte proměnnou <code className="text-xs border border-black px-1.5 py-0.5 font-mono">UPLOADTHING_TOKEN</code> v Replit Secrets.</>,
                  <>Spusťte tuto diagnostiku znovu pro ověření.</>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 border border-black flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</span>
                    <span className="normal-case tracking-normal">{step}</span>
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
