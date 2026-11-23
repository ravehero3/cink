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

// ─── Full countdown block for Product Detail Page ─────────────────────────────
export function PreorderCountdownBlock({
  deadline,
  deliveryEstimate,
}: PreorderBadgeProps) {
  const timeLeft = useCountdown(deadline);
  const isClosed = !timeLeft;

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid #000',
        padding: '16px',
        marginBottom: '12px',
        fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontStretch: 'condensed',
          }}
        >
          Předobjednávka
        </span>
        <span
          className={`preorder-badge${isClosed ? ' is-closed' : ''}`}
          style={{
            fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontStretch: 'condensed',
            padding: '2px 7px',
            borderRadius: '2px',
          }}
        >
          {isClosed ? 'Ukončeno' : 'Probíhá'}
        </span>
      </div>

      {isClosed ? (
        <p
          className="preorder-closed-text"
          style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}
        >
          Předobjednávky byly ukončeny. Tento produkt již není dostupný.
        </p>
      ) : (
        <>
          <p
            className="preorder-deadline"
            style={{ fontSize: '12px', color: '#666', margin: '0 0 10px' }}
          >
            Objednávky otevřeny do: <strong style={{ color: '#000' }}>{formatDeadline(deadline)}</strong>
          </p>

          {/* Countdown boxes */}
          <div className="preorder-timer" style={{ marginBottom: '10px' }}>
            {[
              { val: timeLeft!.days, label: 'DNŮ' },
              { val: timeLeft!.hours, label: 'HODIN' },
              { val: timeLeft!.minutes, label: 'MINUT' },
              { val: timeLeft!.seconds, label: 'SEKUND' },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="preorder-timer__cell"
                style={{
                  borderRadius: '2px',
                  background: '#f6f6f6',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '10px 0',
                }}
              >
                <span
                  className="preorder-timer__num"
                  style={{
                    fontFamily: '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontStretch: 'condensed',
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {pad(val)}
                </span>
                <span
                  className="preorder-timer__unit"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginTop: '4px',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {deliveryEstimate && (
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              📦 Odhadovaná doručení:{' '}
              <strong style={{ color: '#000' }}>{deliveryEstimate}</strong>
            </p>
          )}

          <p
            style={{
              fontSize: '11px',
              color: '#888',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}
          >
            Toto je předobjednávka. Zboží bude vyrobeno a odesláno po uzavření objednávek.
          </p>
        </>
      )}
    </div>
  );
}
