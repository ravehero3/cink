'use client';

import { useState } from 'react';

export default function DraggableBlock({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: any;
  onUpdate: any;
  onDelete: any;
  onMoveUp: any;
  onMoveDown: any;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const renderBlockPreview = (block: any) => {
    switch (block.type) {
      case 'header':
        return (
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {block.content.text || 'Nadpis'}
          </div>
        );
      case 'text':
        return (
          <div style={{ fontSize: '14px', color: '#666', whiteSpace: 'pre-wrap' }}>
            {block.content.text || 'Text'}
          </div>
        );
      case 'image':
        return block.content.url ? (
          <img
            src={block.content.url}
            alt={block.content.alt}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f0f0' }}>
            [Obrázek]
          </div>
        );
      case 'offer':
        return (
          <div
            style={{
              backgroundColor: '#ffe0e6',
              padding: '15px',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {block.content.text}
            </div>
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>{block.content.subtitle}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d61b5e' }}>
              Kód: {block.content.code || 'CODE'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>{block.content.discount} sleva</div>
          </div>
        );
      case 'code':
        return (
          <div
            style={{
              backgroundColor: '#e8f5e9',
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {block.content.code || 'UNIQUE-CODE'}
          </div>
        );
      default:
        return <div>Neznámý blok</div>;
    }
  };

  const renderEditor = (block: any) => {
    switch (block.type) {
      case 'header':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
              Text nadpisu
            </label>
            <input
              type="text"
              value={block.content.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, text: e.target.value })}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
          </div>
        );
      case 'text':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
              Text
            </label>
            <textarea
              value={block.content.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(block.id, { ...block.content, text: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                minHeight: '80px',
                fontFamily: 'monospace',
              }}
            />
          </div>
        );
      case 'image':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
              URL obrázku
            </label>
            <input
              type="url"
              value={block.content.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, url: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', marginBottom: '8px' }}
            />
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
              Alt text
            </label>
            <input
              type="text"
              value={block.content.alt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, alt: e.target.value })}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
          </div>
        );
      case 'offer':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Nadpis
              </label>
              <input
                type="text"
                value={block.content.text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, text: e.target.value })}
                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Podnadpis
              </label>
              <input
                type="text"
                value={block.content.subtitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, subtitle: e.target.value })}
                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Kód
              </label>
              <input
                type="text"
                value={block.content.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, code: e.target.value })}
                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Sleva
              </label>
              <input
                type="text"
                value={block.content.discount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, discount: e.target.value })}
                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
          </div>
        );
      case 'code':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
              Promo kód (můžete editovat ručně)
            </label>
            <input
              type="text"
              value={block.content.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(block.id, { ...block.content, code: e.target.value })}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Block Type Header */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '10px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
          {block.type.toUpperCase()}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onMoveUp()}
            disabled={!canMoveUp}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              backgroundColor: canMoveUp ? '#e8e8e8' : '#f5f5f5',
              border: 'none',
              borderRadius: '3px',
              cursor: canMoveUp ? 'pointer' : 'not-allowed',
              opacity: canMoveUp ? 1 : 0.5,
            }}
          >
            ↑
          </button>
          <button
            onClick={() => onMoveDown()}
            disabled={!canMoveDown}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              backgroundColor: canMoveDown ? '#e8e8e8' : '#f5f5f5',
              border: 'none',
              borderRadius: '3px',
              cursor: canMoveDown ? 'pointer' : 'not-allowed',
              opacity: canMoveDown ? 1 : 0.5,
            }}
          >
            ↓
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              backgroundColor: isEditing ? '#007bff' : '#e8e8e8',
              color: isEditing ? '#fff' : '#000',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            {isEditing ? '✓' : 'Editovat'}
          </button>
          <button
            onClick={() => onDelete()}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Block Preview or Editor */}
      <div style={{ padding: '12px' }}>
        {isEditing ? renderEditor(block) : renderBlockPreview(block)}
      </div>
    </div>
  );
}
