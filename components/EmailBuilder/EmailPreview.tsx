'use client';

export default function EmailPreview({ blocks, subject }: { blocks: any[]; subject: string }) {
  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'header':
        return (
          <h2 key={block.id} style={{ margin: '16px 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
            {block.content.text}
          </h2>
        );
      case 'text':
        return (
          <p key={block.id} style={{ margin: '12px 0', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {block.content.text}
          </p>
        );
      case 'image':
        return block.content.url ? (
          <div key={block.id} style={{ margin: '12px 0', textAlign: 'center' }}>
            <img
              src={block.content.url}
              alt={block.content.alt}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
            />
          </div>
        ) : null;
      case 'offer':
        return (
          <div
            key={block.id}
            style={{
              margin: '12px 0',
              backgroundColor: '#ffe0e6',
              padding: '16px',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {block.content.text}
            </div>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>{block.content.subtitle}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d61b5e', marginBottom: '8px' }}>
              {block.content.code}
            </div>
            <div style={{ fontSize: '13px' }}>{block.content.discount} sleva</div>
          </div>
        );
      case 'code':
        return (
          <div
            key={block.id}
            style={{
              margin: '12px 0',
              backgroundColor: '#e8f5e9',
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            {block.content.code}
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
        borderRadius: '8px',
        padding: '16px',
        maxHeight: '600px',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
        Náhled emailu
      </h3>

      {/* Email Header */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          borderLeft: '3px solid #000',
        }}
      >
        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
          Předmět: <span style={{ fontWeight: 'normal' }}>{subject || '(Bez předmětu)'}</span>
        </div>
        <div style={{ color: '#666' }}>Od: objednavky@ufosport.cz</div>
      </div>

      {/* Email Content */}
      <div
        style={{
          lineHeight: '1.6',
          color: '#333',
          fontSize: '14px',
        }}
      >
        {blocks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            Náhled bude zobrazen po přidání bloků
          </div>
        ) : (
          blocks.map((block) => renderBlock(block))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid #ddd',
          fontSize: '11px',
          color: '#999',
          textAlign: 'center',
        }}
      >
        UFOsport.cz | © 2024
      </div>
    </div>
  );
}
