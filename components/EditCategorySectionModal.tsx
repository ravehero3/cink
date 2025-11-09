'use client';

import { useState, useEffect } from 'react';

interface EditCategorySectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    title: string;
    button1Text: string;
    button2Text: string;
    button1Link: string;
    button2Link: string;
  };
  onSave: (data: any) => void;
}

export default function EditCategorySectionModal({
  isOpen,
  onClose,
  currentData,
  onSave
}: EditCategorySectionModalProps) {
  const [formData, setFormData] = useState(currentData);

  useEffect(() => {
    setFormData(currentData);
  }, [currentData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-black p-4">
          <h2 className="text-xl font-bold uppercase">Edit Category Section</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm uppercase mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-black p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm uppercase mb-2">Button 1 Text</label>
            <input
              type="text"
              value={formData.button1Text}
              onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })}
              className="w-full border border-black p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm uppercase mb-2">Button 1 Link</label>
            <input
              type="text"
              value={formData.button1Link}
              onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })}
              className="w-full border border-black p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm uppercase mb-2">Button 2 Text</label>
            <input
              type="text"
              value={formData.button2Text}
              onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })}
              className="w-full border border-black p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm uppercase mb-2">Button 2 Link</label>
            <input
              type="text"
              value={formData.button2Link}
              onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })}
              className="w-full border border-black p-2 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-black">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 px-4 text-sm uppercase hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-black py-2 px-4 text-sm uppercase hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
