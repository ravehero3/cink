'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, ImageIcon } from 'lucide-react';
import MediaSelector from './MediaSelector';

/* ─── Layout-type SVG icons ─── */
function VideoTypeIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : 'rgba(0,0,0,0.38)';
  return (
    <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
      <rect x="1" y="1" width="42" height="28" rx="4" stroke={c} strokeWidth="1.6" />
      <polygon points="17,10 17,20 28,15" fill={c} />
    </svg>
  );
}

function ImageTypeIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : 'rgba(0,0,0,0.38)';
  return (
    <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
      <rect x="1" y="1" width="42" height="28" rx="4" stroke={c} strokeWidth="1.6" />
      <circle cx="13" cy="11" r="3" fill={c} />
      <polyline points="1,22 13,14 21,19 30,11 43,22" stroke={c} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function QuadTypeIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : 'rgba(0,0,0,0.38)';
  return (
    <svg width="44" height="30" viewBox="0 0 44 30" fill="none">
      {[0, 11, 22, 33].map((x) => (
        <rect key={x} x={x + 1} y="1" width="9" height="28" rx="2.5" stroke={c} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─── Move handle icon ─── */
function MoveHandleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="9" y1="2" x2="9" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="7,4 9,2 11,4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7,14 9,16 11,14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="4,7 2,9 4,11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14,7 16,9 14,11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Shared media-picker field ─── */
function MediaPickerField({
  label,
  value,
  onChange,
  placeholder,
  mediaType = 'IMAGE',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'URL nebo vyberte ze složky'}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={ghostBtnStyle}
          title="Vybrat ze složky"
        >
          <ImageIcon size={14} />
        </button>
      </div>
      {open && (
        <MediaSelector
          type={mediaType}
          onSelect={(media: any) => {
            onChange(media.url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Quad image slot card ─── */
interface QuadSlot { image: string; hoverImage: string; text: string; link: string; }

function QuadSlotCard({
  slot,
  index,
  onChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  slot: QuadSlot;
  index: number;
  onChange: (i: number, field: keyof QuadSlot, v: string) => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
  isDragOver: boolean;
}) {
  const [imgOpen, setImgOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);

  return (
    <div
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      style={{
        background: isDragOver
          ? 'rgba(255,255,255,0.55)'
          : 'rgba(255,255,255,0.45)',
        borderRadius: 16,
        border: isDragOver
          ? '2px dashed rgba(0,0,0,0.25)'
          : '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: isDragOver
          ? '0 0 0 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.07)'
          : '0 2px 14px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        padding: '14px 14px 16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
        transition: 'all 0.18s ease',
        position: 'relative' as const,
      }}
    >
      {/* Drag handle */}
      <div
        draggable
        onDragStart={() => onDragStart(index)}
        title="Přetáhněte pro přeřazení"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          color: 'rgba(0,0,0,0.4)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.12)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.06)'; }}
      >
        <MoveHandleIcon />
      </div>

      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
        Obrázek {index + 1}
      </p>

      {/* Image preview */}
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: 10,
          background: 'rgba(0,0,0,0.04)',
          border: '1px dashed rgba(0,0,0,0.12)',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => setImgOpen(true)}
        title="Klikněte pro výběr obrázku"
      >
        {slot.image ? (
          <img src={slot.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ImageIcon size={22} style={{ color: 'rgba(0,0,0,0.18)' }} />
            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.25)' }}>Klikněte pro výběr</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.12)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'; }}
        />
      </div>
      {imgOpen && (
        <MediaSelector type="IMAGE" onSelect={(m: any) => { onChange(index, 'image', m.url); setImgOpen(false); }} onClose={() => setImgOpen(false)} />
      )}

      {/* Hover image (compact) */}
      <div>
        <label style={labelStyle}>Hover obrázek</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {slot.hoverImage && (
            <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
              <img src={slot.hoverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <input
            type="text"
            value={slot.hoverImage}
            onChange={(e) => onChange(index, 'hoverImage', e.target.value)}
            placeholder="URL hover obrázku"
            style={{ ...inputStyle, fontSize: 11 }}
          />
          <button type="button" onClick={() => setHoverOpen(true)} style={ghostBtnStyle} title="Vybrat">
            <ImageIcon size={12} />
          </button>
        </div>
        {hoverOpen && (
          <MediaSelector type="IMAGE" onSelect={(m: any) => { onChange(index, 'hoverImage', m.url); setHoverOpen(false); }} onClose={() => setHoverOpen(false)} />
        )}
      </div>

      <div>
        <label style={labelStyle}>Text pod obrázkem</label>
        <input
          type="text"
          value={slot.text}
          onChange={(e) => onChange(index, 'text', e.target.value)}
          placeholder="Popis"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Odkaz (URL)</label>
        <input
          type="text"
          value={slot.link}
          onChange={(e) => onChange(index, 'link', e.target.value)}
          placeholder="/kategorie"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

/* ─── Shared styles ─── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.38)',
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  borderRadius: 8,
  border: '1.5px solid rgba(0,0,0,0.10)',
  background: 'rgba(255,255,255,0.7)',
  fontSize: 12.5,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const ghostBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 34,
  height: 34,
  borderRadius: 8,
  border: '1.5px solid rgba(0,0,0,0.10)',
  background: 'rgba(255,255,255,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'rgba(0,0,0,0.45)',
};

/* ─── Main component ─── */
export type SectionLayoutType = 'VIDEO' | 'IMAGE' | 'QUAD_IMAGE';

interface InlineSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: SectionLayoutType, data: Record<string, any>) => void;
}

export default function InlineSectionEditor({ isOpen, onClose, onSave }: InlineSectionEditorProps) {
  const [layoutType, setLayoutType] = useState<SectionLayoutType>('VIDEO');
  const [visible, setVisible] = useState(false);

  // Form state – shared
  const [videoUrl, setVideoUrl] = useState('');
  const [mobileVideoUrl, setMobileVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [button1Text, setButton1Text] = useState('NAKUPOVAT');
  const [button2Text, setButton2Text] = useState('ZOBRAZIT VŠE');
  const [button1Link, setButton1Link] = useState('/');
  const [button2Link, setButton2Link] = useState('/');
  const [textColor, setTextColor] = useState<'black' | 'white'>('black');

  const [quadSlots, setQuadSlots] = useState<QuadSlot[]>([
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
    { image: '', hoverImage: '', text: '', link: '' },
  ]);

  // Drag state for quad reordering
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // reset
      setLayoutType('VIDEO');
      setVideoUrl(''); setMobileVideoUrl(''); setImageUrl(''); setMobileImageUrl('');
      setHeaderText(''); setButton1Text('NAKUPOVAT'); setButton2Text('ZOBRAZIT VŠE');
      setButton1Link('/'); setButton2Link('/'); setTextColor('black');
      setQuadSlots([
        { image: '', hoverImage: '', text: '', link: '' },
        { image: '', hoverImage: '', text: '', link: '' },
        { image: '', hoverImage: '', text: '', link: '' },
        { image: '', hoverImage: '', text: '', link: '' },
      ]);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSlot = (i: number, field: keyof QuadSlot, value: string) => {
    setQuadSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };
  const handleDrop = (i: number) => {
    if (dragIndex.current === null || dragIndex.current === i) { setDragOverIndex(null); return; }
    const next = [...quadSlots];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, moved);
    setQuadSlots(next);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleSave = () => {
    if (layoutType === 'QUAD_IMAGE') {
      onSave('QUAD_IMAGE', {
        quadImage1: quadSlots[0].image, quadImage1Hover: quadSlots[0].hoverImage, quadImage1Text: quadSlots[0].text, quadImage1Link: quadSlots[0].link,
        quadImage2: quadSlots[1].image, quadImage2Hover: quadSlots[1].hoverImage, quadImage2Text: quadSlots[1].text, quadImage2Link: quadSlots[1].link,
        quadImage3: quadSlots[2].image, quadImage3Hover: quadSlots[2].hoverImage, quadImage3Text: quadSlots[2].text, quadImage3Link: quadSlots[2].link,
        quadImage4: quadSlots[3].image, quadImage4Hover: quadSlots[3].hoverImage, quadImage4Text: quadSlots[3].text, quadImage4Link: quadSlots[3].link,
      });
    } else {
      onSave(layoutType, {
        videoUrl, mobileVideoUrl, imageUrl, mobileImageUrl,
        headerText, button1Text, button2Text, button1Link, button2Link, textColor,
      });
    }
  };

  const typeOptions: { type: SectionLayoutType; label: string; icon: React.ReactNode }[] = [
    { type: 'VIDEO', label: 'Video', icon: <VideoTypeIcon active={layoutType === 'VIDEO'} /> },
    { type: 'IMAGE', label: 'Obrázek', icon: <ImageTypeIcon active={layoutType === 'IMAGE'} /> },
    { type: 'QUAD_IMAGE', label: '4 obrázky', icon: <QuadTypeIcon active={layoutType === 'QUAD_IMAGE'} /> },
  ];

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-18px)',
        transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        margin: '0 24px 32px',
      }}
    >
      {/* Clay card */}
      <div
        style={{
          background: 'rgba(245,245,247,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1.5px solid rgba(255,255,255,0.75)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.09), 0 6px 24px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95)',
          padding: '24px 28px 28px',
          position: 'relative',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)' }}>
            Nová sekce
          </span>

          {/* Layout type picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {typeOptions.map(({ type, label, icon }) => {
              const active = layoutType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLayoutType(type)}
                  title={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    background: active
                      ? 'rgba(0,0,0,0.82)'
                      : 'rgba(0,0,0,0.06)',
                    color: active ? '#fff' : 'rgba(0,0,0,0.45)',
                    transition: 'all 0.18s ease',
                    boxShadow: active ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  {icon}
                </button>
              );
            })}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              style={{
                marginLeft: 8,
                width: 34,
                height: 34,
                borderRadius: 10,
                border: '1.5px solid rgba(0,0,0,0.10)',
                background: 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.38)',
              }}
              aria-label="Zrušit"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* ─── VIDEO form ─── */}
        {layoutType === 'VIDEO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MediaPickerField label="Video URL" value={videoUrl} onChange={setVideoUrl} placeholder="https://…/video.mp4" mediaType="VIDEO" />
            <div>
              <label style={labelStyle}>Mobilní video URL (volitelné)</label>
              <input style={inputStyle} type="text" value={mobileVideoUrl} onChange={(e) => setMobileVideoUrl(e.target.value)} placeholder="https://…/video-mobile.mp4" />
            </div>
            <div>
              <label style={labelStyle}>Nadpis (volitelné)</label>
              <input style={inputStyle} type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="NOVÝ MERCH" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Tlačítko 1 – text</label><input style={inputStyle} type="text" value={button1Text} onChange={(e) => setButton1Text(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 1 – odkaz</label><input style={inputStyle} type="text" value={button1Link} onChange={(e) => setButton1Link(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 2 – text</label><input style={inputStyle} type="text" value={button2Text} onChange={(e) => setButton2Text(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 2 – odkaz</label><input style={inputStyle} type="text" value={button2Link} onChange={(e) => setButton2Link(e.target.value)} /></div>
            </div>
            <div>
              <label style={labelStyle}>Barva textu</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['black', 'white'] as const).map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12 }}>
                    <input type="radio" name="inlineTextColor" value={c} checked={textColor === c} onChange={() => setTextColor(c)} />
                    <span style={{ width: 18, height: 18, borderRadius: 5, background: c === 'black' ? '#111' : '#fff', border: '1.5px solid rgba(0,0,0,0.18)', display: 'inline-block' }} />
                    {c === 'black' ? 'Černá' : 'Bílá'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── IMAGE form ─── */}
        {layoutType === 'IMAGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MediaPickerField label="Obrázek URL" value={imageUrl} onChange={setImageUrl} placeholder="https://…/image.jpg" mediaType="IMAGE" />
            <div>
              <label style={labelStyle}>Mobilní obrázek URL (volitelné)</label>
              <input style={inputStyle} type="text" value={mobileImageUrl} onChange={(e) => setMobileImageUrl(e.target.value)} placeholder="https://…/image-mobile.jpg" />
            </div>
            <div>
              <label style={labelStyle}>Nadpis</label>
              <input style={inputStyle} type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="NOVÝ MERCH" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Tlačítko 1 – text</label><input style={inputStyle} type="text" value={button1Text} onChange={(e) => setButton1Text(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 1 – odkaz</label><input style={inputStyle} type="text" value={button1Link} onChange={(e) => setButton1Link(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 2 – text</label><input style={inputStyle} type="text" value={button2Text} onChange={(e) => setButton2Text(e.target.value)} /></div>
              <div><label style={labelStyle}>Tlačítko 2 – odkaz</label><input style={inputStyle} type="text" value={button2Link} onChange={(e) => setButton2Link(e.target.value)} /></div>
            </div>
            <div>
              <label style={labelStyle}>Barva textu</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['black', 'white'] as const).map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12 }}>
                    <input type="radio" name="inlineTextColor2" value={c} checked={textColor === c} onChange={() => setTextColor(c)} />
                    <span style={{ width: 18, height: 18, borderRadius: 5, background: c === 'black' ? '#111' : '#fff', border: '1.5px solid rgba(0,0,0,0.18)', display: 'inline-block' }} />
                    {c === 'black' ? 'Černá' : 'Bílá'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── QUAD IMAGE form ─── */}
        {layoutType === 'QUAD_IMAGE' && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 11.5, color: 'rgba(0,0,0,0.38)', lineHeight: 1.5 }}>
              Klikněte na náhled obrázku pro výběr. Přetáhněte kartičku za ikonu ⊕ pro přeřazení.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {quadSlots.map((slot, i) => (
                <QuadSlotCard
                  key={i}
                  slot={slot}
                  index={i}
                  onChange={updateSlot}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragOver={dragOverIndex === i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: '1.5px solid rgba(0,0,0,0.12)',
              background: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.5)',
            }}
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 26px',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            }}
          >
            <Check size={14} strokeWidth={2.2} />
            Uložit sekci
          </button>
        </div>
      </div>
    </div>
  );
}
