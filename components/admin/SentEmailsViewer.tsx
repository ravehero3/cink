'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Smartphone,
  Monitor,
  Send,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  SlidersVertical,
} from 'lucide-react';
import EmailPreviewModal, { type EmailLogMeta } from './EmailPreviewModal';

const EMAIL_TYPE_GROUPS: { label: string; types: string[] }[] = [
  {
    label: 'Objednávky a platby',
    types: ['ORDER_CONFIRMATION', 'PAYMENT_SUCCESS', 'SHIPPING_NOTIFICATION', 'ADMIN_ORDER_NOTIFICATION', 'PAYMENT_REMINDER'],
  },
  {
    label: 'Zákazníci a účet',
    types: ['NEWSLETTER_WELCOME', 'ACCOUNT_WELCOME', 'PASSWORD_RESET'],
  },
  {
    label: 'Marketing a cesty',
    types: [
      'ABANDONED_CART',
      'CART_REMINDER_DISCOUNT',
      'POST_PURCHASE_DISCOUNT',
      'REVIEW_REQUEST',
      'WINBACK',
      'NEWSLETTER_COLLECTION',
      'NEWSLETTER_FIRST_ORDER',
      'CROSS_SELL',
      'CAMPAIGN',
      'CAMPAIGN_TEST',
    ],
  },
];

const TYPE_NAMES: Record<string, string> = {
  ORDER_CONFIRMATION: 'Potvrzení objednávky',
  PAYMENT_SUCCESS: 'Platba přijata',
  SHIPPING_NOTIFICATION: 'Expedice zásilky',
  NEWSLETTER_WELCOME: 'Uvítání v newsletteru',
  PASSWORD_RESET: 'Obnova hesla',
  ABANDONED_CART: 'Opuštěný košík',
  ADMIN_ORDER_NOTIFICATION: 'Notifikace správce',
  POST_PURCHASE_DISCOUNT: 'Sleva po nákupu',
  REVIEW_REQUEST: 'Žádost o recenzi',
  WINBACK: 'Reaktivace zákazníka',
  CART_REMINDER_DISCOUNT: 'Sleva na košík',
  NEWSLETTER_COLLECTION: 'Kolekce pro odběratele',
  NEWSLETTER_FIRST_ORDER: 'Sleva na 1. nákup',
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
  });
}

// Extract order number like UFO26030 from text
function extractOrderNumber(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/UFO\d{4,6}/i);
  return match ? match[0].toUpperCase() : null;
}

interface SentEmailsViewerProps {
  initialLogId?: string | null;
  filterCustomerEmail?: string;
}

export default function SentEmailsViewer({
  initialLogId,
  filterCustomerEmail,
}: SentEmailsViewerProps) {
  const [logs, setLogs] = useState<EmailLogMeta[]>([]);
  const [stats, setStats] = useState<{ total: number; sent: number; failed: number; today: number }>({
    total: 0,
    sent: 0,
    failed: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(initialLogId || null);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Preview settings
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [autoHeight, setAutoHeight] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(900);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Resend state inside panel
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ take: '150', withStats: '1' });
      if (query.trim()) params.set('q', query.trim());
      if (selectedType) params.set('type', selectedType);
      if (selectedStatus) params.set('status', selectedStatus);
      if (filterCustomerEmail) params.set('toEmail', filterCustomerEmail);

      const res = await fetch(`/api/admin/email-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
          if (data.stats) setStats(data.stats);
          if (data.logs.length > 0) {
            setSelectedLogId((current) => {
              if (current && data.logs.some((l: EmailLogMeta) => l.id === current)) {
                return current;
              }
              return data.logs[0].id;
            });
          } else {
            setSelectedLogId(null);
          }
        } else if (Array.isArray(data)) {
          setLogs(data);
          if (data.length > 0 && !selectedLogId) setSelectedLogId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedType, selectedStatus, filterCustomerEmail, selectedLogId]);

  useEffect(() => {
    // Check URL search params for initial selection on client mount
    if (typeof window !== 'undefined') {
      const urlLogId = new URLSearchParams(window.location.search).get('logId');
      if (urlLogId && !initialLogId) {
        setSelectedLogId(urlLogId);
      }
    }
    fetchLogs();
  }, [fetchLogs, initialLogId]);

  const selectedLog = useMemo(() => {
    return logs.find((l) => l.id === selectedLogId) || null;
  }, [logs, selectedLogId]);

  const handleSelectLog = (id: string) => {
    setSelectedLogId(id);
    setPreviewLoading(true);
    setResendResult(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('logId', id);
      window.history.replaceState(null, '', url.toString());
    }
  };

  const handleIframeLoad = () => {
    setPreviewLoading(false);
    if (!autoHeight) return;
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        const height = Math.max(
          doc.body.scrollHeight || 0,
          doc.documentElement.scrollHeight || 0,
          750
        );
        if (height > 100) {
          setIframeHeight(height + 20);
        }
      }
    } catch {
      setIframeHeight(1000);
    }
  };

  const handleResend = async () => {
    if (!selectedLog) return;
    setResending(true);
    setResendResult(null);
    try {
      const res = await fetch('/api/admin/email-logs/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: selectedLog.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendResult({ ok: true, message: data.message || 'E-mail byl znovu odeslán.' });
        fetchLogs();
      } else {
        setResendResult({ ok: false, message: data.error || 'Odeslání selhalo.' });
      }
    } catch (err: any) {
      setResendResult({ ok: false, message: err.message || 'Chyba sítě.' });
    } finally {
      setResending(false);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const detectedOrderNumber = selectedLog ? extractOrderNumber(selectedLog.subject) : null;
  const previewSrc = selectedLog ? `/api/admin/email-preview?logId=${selectedLog.id}` : '';

  return (
    <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-black p-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Celkem odesláno</p>
          <p className="text-2xl font-bold uppercase tracking-tight text-black mt-1">{stats.total}</p>
          <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">Historie e-mailů</p>
        </div>
        <div className="bg-white border border-black p-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Doručeno (sent)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold uppercase tracking-tight text-emerald-600">{stats.sent}</p>
            {stats.total > 0 && (
              <span className="text-xs font-mono text-emerald-700">
                {Math.round((stats.sent / stats.total) * 100)}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">Bez chyb</p>
        </div>
        <div className="bg-white border border-black p-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Chyba odeslání</p>
          <p className={`text-2xl font-bold uppercase tracking-tight mt-1 ${stats.failed > 0 ? 'text-red-600' : 'text-black'}`}>
            {stats.failed}
          </p>
          <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">Selhalo</p>
        </div>
        <div className="bg-white border border-black p-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Za posledních 24h</p>
          <p className="text-2xl font-bold uppercase tracking-tight text-black mt-1">{stats.today}</p>
          <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">Aktivita dnes</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white border border-black p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat e-mail zákazníka, předmět nebo UFO číslo…"
              className="w-full text-xs pl-9 pr-3 py-2 border border-black bg-white focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-2 border border-black bg-white focus:outline-none uppercase tracking-wider font-medium"
          >
            <option value="">Všechny typy e-mailů</option>
            {EMAIL_TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.types.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_NAMES[type] || type}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 border border-black bg-white focus:outline-none uppercase tracking-wider font-medium"
          >
            <option value="">Všechny stavy</option>
            <option value="sent">Pouze odeslané (OK)</option>
            <option value="failed">Pouze s chybou (Failed)</option>
          </select>
        </div>

        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs uppercase tracking-wider font-medium"
          title="Obnovit seznam"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Obnovit</span>
        </button>
      </div>

      {/* 3. Main Split View: Left List + Right Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: List of sent emails */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-white border border-black p-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span>Seznam odeslaných e-mailů</span>
            <span className="text-[#888888] font-mono text-[11px]">
              {logs.length} z {stats.total}
            </span>
          </div>

          <div className="bg-white border border-black divide-y divide-black/10 max-h-[820px] overflow-y-auto">
            {loading && logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888888] uppercase tracking-wider">
                <RefreshCw size={16} className="animate-spin mx-auto mb-2" />
                Načítám odeslané e-maily…
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888888] uppercase tracking-wider">
                Nebyly nalezeny žádné e-maily odpovídající filtrům.
              </div>
            ) : (
              logs.map((log) => {
                const isSelected = selectedLogId === log.id;
                const orderNum = extractOrderNumber(log.subject);
                return (
                  <button
                    key={log.id}
                    onClick={() => handleSelectLog(log.id)}
                    className={`w-full text-left p-3.5 transition-colors relative flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    {/* Top line: Type and status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                          isSelected
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-black'
                        }`}
                      >
                        {TYPE_NAMES[log.type] || log.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {orderNum && (
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-1 border ${
                              isSelected
                                ? 'border-neutral-500 text-neutral-300'
                                : 'border-black/30 text-black/70'
                            }`}
                          >
                            #{orderNum}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                            log.status === 'sent'
                              ? isSelected
                                ? 'bg-emerald-400 text-black'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isSelected
                              ? 'bg-red-400 text-black'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {log.status === 'sent' ? 'Doručeno' : 'Chyba'}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p
                      className={`text-xs font-bold uppercase tracking-wider truncate mt-0.5 ${
                        isSelected ? 'text-white' : 'text-black'
                      }`}
                    >
                      {log.subject}
                    </p>

                    {/* Recipient & timestamp */}
                    <div
                      className={`flex items-center justify-between text-[11px] font-mono ${
                        isSelected ? 'text-neutral-400' : 'text-[#666666]'
                      }`}
                    >
                      <span className="truncate max-w-[210px]">{log.toEmail}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-wider">
                        {formatDateTime(log.sentAt)}
                      </span>
                    </div>

                    {log.error && (
                      <p
                        className={`text-[10px] truncate uppercase font-bold mt-1 ${
                          isSelected ? 'text-red-300' : 'text-red-600'
                        }`}
                      >
                        ⚠ {log.error}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Visual Preview Pane */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {selectedLog ? (
            <>
              {/* Selected Email Details Card */}
              <div className="bg-white border border-black p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black text-white">
                        {TYPE_NAMES[selectedLog.type] || selectedLog.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                          selectedLog.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        {selectedLog.status === 'sent' ? 'Odesláno úspěšně' : 'Chyba odeslání'}
                      </span>
                      <span className="text-xs text-[#888888] font-mono">
                        {formatDateTime(selectedLog.sentAt)}
                      </span>
                    </div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-black">
                      {selectedLog.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[#555555] font-mono">
                      <span>Příjemce:</span>
                      <button
                        onClick={() => copyEmail(selectedLog.toEmail)}
                        className="font-bold text-black hover:underline flex items-center gap-1 group"
                        title="Kliknutím zkopírovat"
                      >
                        <span>{selectedLog.toEmail}</span>
                        {copiedEmail ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {detectedOrderNumber && (
                      <Link
                        href={`/admin/objednavky?q=${detectedOrderNumber}`}
                        className="flex items-center gap-1 px-3 py-1.5 border border-black bg-white hover:bg-black hover:text-white transition-colors text-xs uppercase tracking-wider font-medium"
                      >
                        <span>Objednávka #{detectedOrderNumber}</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 border border-black transition-colors text-xs uppercase tracking-wider font-medium disabled:opacity-50"
                      title="Znovu odeslat tento e-mail přes Resend"
                    >
                      {resending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                      <span>{resending ? 'Odesílám…' : 'Znovu odeslat'}</span>
                    </button>
                  </div>
                </div>

                {resendResult && (
                  <div
                    className={`p-2.5 border text-xs uppercase tracking-wider flex items-center justify-between ${
                      resendResult.ok
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-red-50 border-red-500 text-red-900'
                    }`}
                  >
                    <span>{resendResult.message}</span>
                    <button onClick={() => setResendResult(null)} className="underline text-[10px]">
                      Zavřít
                    </button>
                  </div>
                )}

                {selectedLog.error && (
                  <div className="p-3 border border-red-500 bg-red-50 text-red-900 text-xs uppercase tracking-wider flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <strong>Popis chyby od Resend:</strong>
                      <p className="normal-case font-mono mt-1 text-[11px]">{selectedLog.error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Preview Frame Card */}
              <div className="bg-white border border-black flex flex-col overflow-hidden">
                {/* Frame Controls Bar */}
                <div className="bg-neutral-100 border-b border-black p-3 flex items-center justify-between gap-3 flex-wrap text-xs">
                  {/* Left: Device & Height toggles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Device Switcher */}
                    <div className="flex bg-white border border-black p-0.5">
                      <button
                        onClick={() => setViewMode('desktop')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          viewMode === 'desktop' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
                        }`}
                      >
                        <Monitor size={12} />
                        <span>Desktop</span>
                      </button>
                      <button
                        onClick={() => setViewMode('mobile')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          viewMode === 'mobile' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
                        }`}
                      >
                        <Smartphone size={12} />
                        <span>Mobil</span>
                      </button>
                    </div>

                    {/* Full Height vs Fixed Height */}
                    <button
                      onClick={() => setAutoHeight((v) => !v)}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                        autoHeight
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black hover:bg-neutral-100'
                      }`}
                      title="Zobrazit celou délku e-mailu bez vnitřního posuvníku"
                    >
                      {autoHeight ? 'Celá výška: ZAP' : 'Pevná výška (680 px)'}
                    </button>
                  </div>

                  {/* Right: Maximize & Open in Tab */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFullscreenOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-black hover:text-white border border-black transition-colors text-[11px] font-bold uppercase tracking-wider"
                      title="Otevřít náhled na celou obrazovku s lupou"
                    >
                      <Maximize2 size={12} />
                      <span>Zvětšit náhled</span>
                    </button>
                    <a
                      href={previewSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-black hover:text-white border border-black transition-colors text-[11px] font-bold uppercase tracking-wider"
                      title="Otevřít čisté HTML v nové záložce prohlížeče"
                    >
                      <ExternalLink size={12} />
                      <span>Nové okno</span>
                    </a>
                  </div>
                </div>

                {/* Iframe Presentation Canvas */}
                <div
                  className={`bg-[#0a0a0a] p-4 flex justify-center items-start transition-all ${
                    autoHeight ? '' : 'overflow-y-auto max-h-[700px]'
                  }`}
                >
                  <div
                    className="mx-auto transition-all"
                    style={{
                      width: viewMode === 'mobile' ? 390 : '100%',
                      maxWidth: viewMode === 'mobile' ? 390 : '100%',
                    }}
                  >
                    {previewLoading && (
                      <div className="flex items-center justify-center gap-3 py-32 text-neutral-400">
                        <RefreshCw size={16} className="animate-spin text-white" />
                        <span className="text-xs uppercase tracking-widest">Generuji vizuální náhled…</span>
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      key={`${selectedLog.id}-${viewMode}`}
                      src={previewSrc}
                      onLoad={handleIframeLoad}
                      title={`Náhled e-mailu ${selectedLog.subject}`}
                      className={`w-full border-0 transition-opacity duration-200 ${
                        previewLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{
                        height: autoHeight ? `${iframeHeight}px` : '680px',
                        display: 'block',
                        border: viewMode === 'mobile' ? '2px solid #333333' : 'none',
                        background: '#000000',
                      }}
                    />
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-white border-t border-black px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#666666]">
                  <span>Vizuální náhled přesně tak, jak byl odeslán zákazníkovi</span>
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-black hover:underline flex items-center gap-1"
                  >
                    <span>Otevřít samostatně</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-black p-16 text-center text-xs uppercase tracking-wider text-[#666666]">
              Vyberte e-mail v seznamu vlevo pro zobrazení jeho celého vizuálního náhledu.
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Inspector Modal with Zoom */}
      <EmailPreviewModal
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        log={selectedLog}
        onResent={() => fetchLogs()}
      />
    </div>
  );
}
