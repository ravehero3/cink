'use client';

export default function BlockPalette({ onDragStart }) {
  const blocks = [
    { type: 'header', label: 'Nadpis', icon: '📝', color: '#e8f4f8' },
    { type: 'text', label: 'Text', icon: '📄', color: '#f0f0f0' },
    { type: 'image', label: 'Obrázek', icon: '🖼️', color: '#fff3e0' },
    { type: 'offer', label: 'Limitovaná nabídka', icon: '🎁', color: '#fce4ec' },
    { type: 'code', label: 'Promo kód', icon: '🔐', color: '#e0f2f1' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {blocks.map((block) => (
        <div
          key={block.type}
          draggable
          onDragStart={(e) => onDragStart(e, block.type)}
          style={{
            padding: '12px',
            backgroundColor: block.color,
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'grab',
            textAlign: 'center',
            transition: 'all 0.2s',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            e.currentTarget.style.cursor = 'grab';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{block.icon}</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{block.label}</div>
        </div>
      ))}
    </div>
  );
}
