'use client';

import { useState, useEffect, useRef } from 'react';

interface PreorderBadgeProps {
  deadline: Date | string;
  /** 'card' = small badge overlaid on product image grid; 'pdp' = full countdown block on product detail page */
  variant?: 'card' | 'pdp';
  deliveryEstimate?: string; // e.g. "18.–23. 12."
}

function useCountdown(deadline: Date | string) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(deadline));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

function calcTimeLeft(deadline: Date | string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDeadline(deadline: Date | string) {
  const d = new Date(deadline);
  return d.toLocaleString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Prague',
  });
}

// ─── Card badge (overlaid on product image) ──────────────────────────────────
export function PreorderCardBadge({ deadline, deliveryEstimate }: PreorderBadgeProps) {
  const timeLeft = useCountdown(deadline);
  const [showTooltip, setShowTooltip] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isClosed = !timeLeft;

  // Close tooltip on outside click (mobile tap outside)
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showTooltip]);

  return (
    <div
      ref={wrapRef}
      className="preorder-wrap preorder-badge-on-image"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowTooltip((v) => !v);
      }}
    >
      {/* Badge */}
      <span
        className={`preorder-badge${isClosed ? ' is-closed' : ''}`}
        style={{
          fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontStretch: 'condensed',
          padding: '3px 7px',
          borderRadius: '2px',
          cursor: 'default',
        }}
      >
        {isClosed ? 'Ukončeno' : 'Předobjednávka'}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="preorder-popup"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            borderRadius: '2px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid #000',
            minWidth: '220px',
          }}
        >
          {isClosed ? (
            <p className="preorder-closed-text" style={{ margin: 0, padding: '4px 0' }}>
              Předobjednávky jsou ukončeny.
            </p>
          ) : (
            <>
              <p className="preorder-deadline">
                Objednávky otevřeny do{' '}
                <strong>{formatDeadline(deadline)}</strong>
              </p>

              {/* Mini countdown */}
              <div className="preorder-timer">
                {[
                  { val: timeLeft!.days, label: 'DNŮ' },
                  { val: timeLeft!.hours, label: 'HOD' },
                  { val: timeLeft!.minutes, label: 'MIN' },
                  { val: timeLeft!.seconds, label: 'SEK' },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="preorder-timer__cell"
                    style={{ borderRadius: '2px', background: '#f6f6f6', border: '1px solid rgba(0,0,0,0.1)' }}
                  >
                    <span
                      className="preorder-timer__num"
                      style={{
                        fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontStretch: 'condensed',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      {pad(val)}
                    </span>
                    <span
                      className="preorder-timer__unit"
                      style={{
                        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        color: '#666',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {deliveryEstimate && (
                <p className="preorder-popup__text" style={{ marginTop: '6px', fontSize: '12px' }}>
                  Odhadovaná doručení: <strong>{deliveryEstimate}</strong>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Czech plural helper ───────────────────────────────────────────────────────
function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

// ─── Full countdown block for Product Detail Page ─────────────────────────────
export function PreorderCountdownBlock({
  deadline,
  deliveryEstimate,
}: PreorderBadgeProps) {
  const timeLeft = useCountdown(deadline);
  const isClosed = !timeLeft;

  // Format deadline as "pátek 1. ledna v 00:59"
  function formatDeadlineLong(dl: Date | string) {
    const d = new Date(dl);
    const day = d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Prague' });
    const time = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Prague' });
    return `${day} v ${time}`;
  }

  const cells = isClosed
    ? [
        { val: 0, label: 'dnů' },
        { val: 0, label: 'hodin' },
        { val: 0, label: 'minut' },
        { val: 0, label: 'sekund' },
      ]
    : [
        { val: timeLeft!.days,    label: plural(timeLeft!.days,    'den',     'dny',    'dnů')     },
        { val: timeLeft!.hours,   label: plural(timeLeft!.hours,   'hodina',  'hodiny', 'hodin')   },
        { val: timeLeft!.minutes, label: plural(timeLeft!.minutes, 'minuta',  'minuty', 'minut')   },
        { val: timeLeft!.seconds, label: plural(timeLeft!.seconds, 'sekunda', 'sekundy','sekund')  },
      ];

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid #000',
        background: '#fff',
        color: '#000',
        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '21px',
        fontWeight: 400,
        WebkitFontSmoothing: 'antialiased',
        boxSizing: 'border-box',
        marginBottom: '0',
      }}
    >
      {/* ── Header: title + status ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          borderBottom: '1px solid #000',
        }}
      >
        <span
          style={{
            fontFamily: 'BB-CondBold, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '21px',
            textTransform: 'uppercase',
            letterSpacing: 0,
          }}
        >
          Předobjednávka
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'BB-CondBold, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '21px',
            textTransform: 'uppercase',
            letterSpacing: 0,
          }}
        >
          {!isClosed && (
            <span
              style={{
                width: '6px',
                height: '6px',
                background: 'currentColor',
                display: 'inline-block',
                animation: 'po-blink 1.4s steps(1,end) infinite',
              }}
            />
          )}
          {isClosed ? 'Ukončena' : 'Probíhá'}
        </span>
      </div>

      {/* ── Deadline row ── */}
      {!isClosed && (
        <p
          style={{
            margin: 0,
            padding: '12px 16px',
            borderBottom: '1px solid #000',
            fontSize: '14px',
            lineHeight: '21px',
          }}
        >
          Objednávky otevřeny do:{' '}
          <span style={{ fontFamily: 'BB-CondBold, "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>
            {formatDeadlineLong(deadline)}
          </span>
        </p>
      )}

      {/* ── 4-column countdown grid ── */}
      <div
        role="timer"
        aria-live="off"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid #000',
        }}
      >
        {cells.map(({ val, label }, i) => (
          <div
            key={label}
            style={{
              padding: '12px 16px 10px',
              borderRight: i < 3 ? '1px solid #000' : 'none',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'BB-CondBold, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                fontSize: '21px',
                lineHeight: '21px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {pad(val)}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: '6px',
                fontFamily: 'BB-CondBold, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                lineHeight: '16px',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Delivery row ── */}
      {deliveryEstimate && (
        <p
          style={{
            margin: 0,
            padding: '12px 16px',
            borderBottom: '1px solid #000',
            fontSize: '14px',
            lineHeight: '21px',
          }}
        >
          📦 Odhadovaná doručení: {deliveryEstimate}
        </p>
      )}

      {/* ── Note row ── */}
      {!isClosed && (
        <p
          style={{
            margin: 0,
            padding: '12px 16px',
            fontSize: '12px',
            lineHeight: '18px',
            color: '#444',
          }}
        >
          Toto je předobjednávka. Zboží bude vyrobeno a odesláno po uzavření objednávek.
        </p>
      )}

      {isClosed && (
        <p
          style={{
            margin: 0,
            padding: '12px 16px',
            fontSize: '12px',
            lineHeight: '18px',
            color: '#444',
          }}
        >
          Předobjednávky byly ukončeny. Tento produkt již není dostupný.
        </p>
      )}

      <style>{`
        @keyframes po-blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
