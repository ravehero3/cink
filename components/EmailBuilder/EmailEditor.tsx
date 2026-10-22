'use client';

import { useState } from 'react';
import DraggableBlock from './DraggableBlock';
import EmailPreview from './EmailPreview';
import BlockPalette from './BlockPalette';

export default function EmailEditor({ campaign, onSave }: { campaign?: any; onSave: any }) {
  const [blocks, setBlocks] = useState(campaign?.blocks || []);
  const [name, setName] = useState(campaign?.name || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    setDraggedBlock(blockType);
    e.dataTransfer!.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const newBlock = {
      id: `block_${Date.now()}`,
      type: draggedBlock,
      content: getDefaultContent(draggedBlock),
    };

    setBlocks([...blocks, newBlock]);
    setDraggedBlock(null);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Napište váš text zde...' };
      case 'header':
        return { text: 'Nadpis', level: 'h1' };
      case 'image':
        return { url: '', alt: 'Email image', width: '600px' };
      case 'offer':
        return { text: 'Limitovaná nabídka!', subtitle: 'Kód: ', code: '', discount: '10%' };
      case 'code':
        return { code: 'UNIQUE-CODE-' + Math.random().toString(36).substr(2, 9) };
      default:
        return {};
    }
  };

  const handleUpdateBlock = (blockId: string, updatedContent: any) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, content: updatedContent } : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const handleMoveBlock = (blockId: string, direction: string) => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      setBlocks(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      alert('Vyplňte název a předmět emailu');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        subject,
        blocks,
        content: JSON.stringify(blocks),
        targetAudience: 'all',
      };

      const method = campaign?.id ? 'PUT' : 'POST';
      const url = campaign?.id ? `/api/email-campaigns/${campaign.id}` : '/api/email-campaigns';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save campaign');
      const saved = await res.json();
      onSave(saved);
      alert('Kampaň uložena!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Chyba při ukládání kampaně');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      {/* Left Panel - Block Palette */}
      <div style={{ width: '200px', borderRight: '1px solid #ddd', paddingRight: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Dostupné bloky</h3>
        <BlockPalette onDragStart={handleDragStart} />
      </div>

      {/* Center - Editor Canvas */}
      <div style={{ flex: 1, maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Název kampaně
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Např. Podzimní sleva 2024"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              marginBottom: '15px',
            }}
          />

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Předmět emailu
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Předmět, který uvidí příjemce"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              marginBottom: '15px',
            }}
          />
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            minHeight: '400px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fafafa',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Editor emailu</h3>
          {blocks.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
              Přetáhněte bloky sem nebo klikněte na ně
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blocks.map((block, index) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                  onMoveUp={() => handleMoveBlock(block.id, 'up')}
                  onMoveDown={() => handleMoveBlock(block.id, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < blocks.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Ukládání...' : 'Uložit kampaň'}
        </button>
      </div>

      {/* Right Panel - Preview */}
      <div style={{ width: '320px', borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
        <EmailPreview blocks={blocks} subject={subject} />
      </div>
    </div>
  );
}
