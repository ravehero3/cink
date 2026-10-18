'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  ExternalLink,
  Smartphone,
  Monitor,
  Code,
  Eye,
  Send,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

export interface EmailLogMeta {
  id: string;
  toEmail: string;
  type: string;
  subject: string;
  status: string;
  error?: string | null;
  journeyId?: string | null;
  sentAt?: string | Date;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: EmailLogMeta | null;
  onResent?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  ORDER_CONFIRMATION: 'Potvrzení objednávky',
  PAYMENT_SUCCESS: 'Platba přijata',
  SHIPPING_NOTIFICATION: 'Expedice zásilky',
  NEWSLETTER_WELCOME: 'Uvítání v newsletteru',
  PASSWORD_RESET: 'Obnova hesla',
  ABANDONED_CART: 'Opuštěný košík',
  ADMIN_ORDER_NOTIFICATION: 'Notifikace správce (Objednávka)',
  POST_PURCHASE_DISCOUNT: 'Sleva po nákupu',
  REVIEW_REQUEST: 'Žádost o recenzi',
  WINBACK: 'Reaktivace zákazníka',
  CART_REMINDER_DISCOUNT: 'Sleva na košík',
  NEWSLETTER_COLLECTION: 'Kolekce pro odběratele',
  NEWSLETTER_FIRST_ORDER: 'Sleva na první nákup',
  ACCOUNT_WELCOME: 'Nový zákaznický účet',
  PAYMENT_REMINDER: 'Připomenutí platby',
  CROSS_SELL: 'Doporučené produkty',
  CAMPAIGN: 'Hromadná kampaň',
  CAMPAIGN_TEST: 'Testovací kampaň',
};

function formatDateTime(d?: string | Date) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  log,
  onResent,
}: EmailPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState<number>(1);
  const [viewSource, setViewSource] = useState(false);
  const [rawHtml, setRawHtml] = useState<string | null>(null);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState<number>(1000);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Resend state
  const [showResendBox, setShowResendBox] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen || !log) return;
    setDevice('desktop');
    setZoom(1);
    setViewSource(false);
    setRawHtml(null);
    setIframeLoading(true);
    setShowResendBox(false);
    setResendStatus(null);
    setResendEmail(log.toEmail);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, log, onClose]);

  // Load raw HTML when viewSource is toggled
  useEffect(() => {
    if (!viewSource || rawHtml !== null || !log) return;
    setLoadingHtml(true);
    fetch(`/api/admin/email-preview?logId=${log.id}`)
      .then((r) => r.text())
      .then((html) => setRawHtml(html))
      .catch((err) => setRawHtml(`Nepodařilo se načíst kód: ${err.message}`))
      .finally(() => setLoadingHtml(false));
  }, [viewSource, rawHtml, log]);

  const handleIframeLoad = () => {
    setIframeLoading(false);
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        const height = Math.max(
          doc.body.scrollHeight || 0,
          doc.documentElement.scrollHeight || 0,
          800
        );
        if (height > 100) {
          setIframeHeight(height + 40);
        }
      }
    } catch {
      setIframeHeight(1200);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'html') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResend = async () => {
    if (!log) return;
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/admin/email-logs/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: log.id,
          overrideEmail: resendEmail.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus({ ok: true, message: data.message || 'E-mail byl úspěšně přeposlán.' });
        if (onResent) onResent();
      } else {
        setResendStatus({ ok: false, message: data.error || 'Přeposlání selhalo.' });
      }
    } catch (err: any) {
      setResendStatus({ ok: false, message: err.message || 'Chyba sítě při odesílání.' });
    } finally {
      setResending(false);
    }
  };

  if (!isOpen || !log) return null;

  const typeLabel = TYPE_LABELS[log.type] || log.type;
  const previewUrl = `/api/admin/email-preview?logId=${log.id}`;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="bg-black text-white border-b border-[#222222] px-4 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
        {/* Left: Email info */}
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-white text-black shrink-0">
                {typeLabel}
              </span>
              <span
                className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 shrink-0 ${
                  log.status === 'sent'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {log.status === 'sent' ? 'Doručeno' : 'Chyba'}
              </span>
              <span className="text-xs text-[#888888] font-mono shrink-0">
                {formatDateTime(log.sentAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 min-w-0">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate max-w-[380px] sm:max-w-[500px]">
                {log.subject}
              </h2>
              <span className="text-[#666666]">·</span>
              <button
                onClick={() => copyToClipboard(log.toEmail, 'email')}
                title="Zkopírovat e-mail příjemce"
                className="text-xs text-[#aaaaaa] hover:text-white flex items-center gap-1 font-mono group truncate max-w-[240px]"
              >
                <span className="truncate">{log.toEmail}</span>
                {copiedEmail ? (
                  <Check size={12} className="text-emerald-400 shrink-0" />
                ) : (
                  <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#181818] border border-[#333333] px-1 py-0.5 text-xs">
            <button
              onClick={() => setZoom(0.5)}
              className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                zoom === 0.5 ? 'bg-white text-black' : 'text-[#aaaaaa] hover:text-white'
              }`}
              title="Ptačí perspektiva (50% zoom - vidět celý e-mail naráz)"
            >
              50%
            </button>
            <button
              onClick={() => setZoom(0.75)}
              className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                zoom === 0.75 ? 'bg-white text-black' : 'text-[#aaaaaa] hover:text-white'
              }`}
              title="75% zoom"
            >
              75%
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                zoom === 1 ? 'bg-white text-black' : 'text-[#aaaaaa] hover:text-white'
              }`}
              title="100% zoom (plná velikost)"
            >
              100%
            </button>
          </div>

          {/* Device switch */}
          <div className="flex items-center bg-[#181818] border border-[#333333] p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                device === 'desktop' ? 'bg-white text-black' : 'text-[#aaaaaa] hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                device === 'mobile' ? 'bg-white text-black' : 'text-[#aaaaaa] hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>Mobil</span>
            </button>
          </div>

          {/* HTML source toggle */}
          <button
            onClick={() => setViewSource((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
              viewSource
                ? 'bg-white text-black border-white'
                : 'bg-[#181818] text-white border-[#333333] hover:border-white'
            }`}
          >
            {viewSource ? <Eye size={13} /> : <Code size={13} />}
            <span>{viewSource ? 'Náhled' : 'HTML kód'}</span>
          </button>

          {/* Resend toggle */}
          <button
            onClick={() => setShowResendBox((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
              showResendBox
                ? 'bg-amber-400 text-black border-amber-400'
                : 'bg-[#181818] text-white border-[#333333] hover:border-white'
            }`}
          >
            <Send size={13} />
            <span>Znovu odeslat</span>
          </button>

          {/* External link */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Otevřít čistý e-mail v novém okně"
            className="flex items-center justify-center p-2 text-[#aaaaaa] hover:text-white hover:bg-[#222222] border border-[#333333] transition-colors"
          >
            <ExternalLink size={14} />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Zavřít náhled (Esc)"
            className="flex items-center justify-center p-2 text-white bg-[#222222] hover:bg-white hover:text-black transition-colors border border-[#333333]"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Resend Dropdown Panel */}
      {showResendBox && (
        <div className="bg-[#121212] border-b border-[#333333] p-4 text-white animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                Přeposlat tento e-mail zákazníkovi nebo na testovací adresu
              </p>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Odešle se přesný HTML obsah tohoto e-mailu přes Resend.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="prijemce@email.cz"
                className="text-xs font-mono px-3 py-1.5 bg-black border border-[#444444] text-white focus:outline-none focus:border-white w-full sm:w-72"
              />
              <button
                onClick={handleResend}
                disabled={resending || !resendEmail}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {resending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                <span>{resending ? 'Odesílám…' : 'Odeslat'}</span>
              </button>
            </div>
          </div>
          {resendStatus && (
            <div
              className={`max-w-3xl mx-auto mt-2 text-xs p-2.5 border uppercase tracking-wider flex items-center justify-between ${
                resendStatus.ok
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-red-950/60 border-red-500 text-red-300'
              }`}
            >
              <span>{resendStatus.message}</span>
              <button onClick={() => setResendStatus(null)} className="underline text-[10px] ml-3">
                Zavřít
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Callout if Log had an error */}
      {log.error && (
        <div className="bg-red-950/80 border-b border-red-500/50 px-4 py-2 text-xs text-red-200 uppercase tracking-wider flex items-center justify-between shrink-0">
          <span>
            <strong>Záznam chyby při odesílání:</strong> {log.error}
          </span>
          <span className="text-[10px] text-red-400 font-mono">STATUS: FAILED</span>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto bg-[#070707] p-4 sm:p-8 flex justify-center items-start">
        {viewSource ? (
          <div className="w-full max-w-5xl bg-[#0e0e0e] border border-[#2a2a2a] p-4 text-white">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
              <span className="text-xs uppercase font-bold tracking-wider text-[#888888]">
                HTML zdrojový kód ({rawHtml?.length || 0} znaků)
              </span>
              <button
                onClick={() => rawHtml && copyToClipboard(rawHtml, 'html')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#222222] text-white hover:bg-white hover:text-black border border-[#444444] transition-colors"
              >
                {copiedHtml ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedHtml ? 'Zkopírováno' : 'Kopírovat HTML'}</span>
              </button>
            </div>
            {loadingHtml ? (
              <div className="py-20 text-center text-xs text-[#888888] uppercase tracking-wider">
                Načítám HTML kód…
              </div>
            ) : (
              <pre className="text-xs font-mono text-[#dcdcdc] overflow-x-auto whitespace-pre-wrap break-all p-3 bg-black border border-[#222222] max-h-[70vh] overflow-y-auto leading-relaxed">
                {rawHtml}
              </pre>
            )}
          </div>
        ) : (
          <div
            className="transition-all duration-200 mx-auto"
            style={{
              width: device === 'mobile' ? 390 : '100%',
              maxWidth: device === 'mobile' ? 390 : 660,
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top center',
              marginBottom: zoom !== 1 ? `-${Math.round((1 - zoom) * iframeHeight)}px` : 0,
            }}
          >
            {/* Visual device casing for mobile */}
            {device === 'mobile' && (
              <div className="text-center text-[10px] text-[#666666] uppercase tracking-widest pb-2 font-mono">
                Náhled z mobilního telefonu (390 px šířka)
              </div>
            )}

            <div
              className={`relative bg-black transition-all ${
                device === 'mobile'
                  ? 'border-[6px] border-[#252525] rounded-[32px] overflow-hidden shadow-2xl p-0'
                  : 'border border-[#262626] shadow-2xl'
              }`}
            >
              {iframeLoading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 z-10"
                  style={{ minHeight: 400 }}
                >
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs uppercase tracking-widest text-[#aaaaaa]">
                    Vykresluji e-mail…
                  </span>
                </div>
              )}

              <iframe
                ref={iframeRef}
                key={`${log.id}-${device}`}
                src={previewUrl}
                onLoad={handleIframeLoad}
                title={`Náhled e-mailu: ${log.subject}`}
                style={{
                  width: '100%',
                  height: `${iframeHeight}px`,
                  minHeight: '600px',
                  display: 'block',
                  border: 'none',
                  background: '#000000',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom status footer */}
      <footer className="bg-black text-[#777777] border-t border-[#222222] px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider shrink-0">
        <div>
          <span>Zobrazení: {device === 'desktop' ? 'Desktop (plná šířka)' : 'Mobil (390 px)'}</span>
          <span className="mx-2">·</span>
          <span>Měřítko: {Math.round(zoom * 100)}%</span>
        </div>
        <div>
          <span>Všechny e-maily UFO SPORT jsou stylovány s černým pozadím #000000</span>
        </div>
      </footer>
    </div>
  );
}
