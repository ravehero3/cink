'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSearchShortcutsStore } from '@/store/searchShortcutsStore';

interface EditSearchShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSearchShortcutsModal({
  isOpen,
  onClose
}: EditSearchShortcutsModalProps) {
  const { shortcuts, updateShortcuts } = useSearchShortcutsStore();
  const [formData, setFormData] = useState(shortcuts);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShortcuts(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full">
        <div className="bg-white border-b border-black p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase">Edit Search Shortcuts</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formData.map((shortcut, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Text {index + 1}</label>
                <input
                  type="text"
                  value={shortcut.text}
                  onChange={(e) => {
                    const newData = [...formData];
                    newData[index] = { ...newData[index], text: e.target.value };
                    setFormData(newData);
                  }}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="dárek pro ní"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Link {index + 1}</label>
                <input
                  type="text"
                  value={shortcut.link}
                  onChange={(e) => {
                    const newData = [...formData];
                    newData[index] = { ...newData[index], link: e.target.value };
                    setFormData(newData);
                  }}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="/kategorie/space-love"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4 pt-4 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 border-2 border-black hover:bg-gray-100 font-bold uppercase"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 bg-black text-white hover:bg-gray-800 font-bold uppercase"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
