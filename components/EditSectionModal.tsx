'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: 'video' | 'product';
  currentData: any;
  onSave: (data: any) => void;
}

export default function EditSectionModal({
  isOpen,
  onClose,
  sectionType,
  currentData,
  onSave
}: EditSectionModalProps) {
  const [formData, setFormData] = useState(currentData);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase">
            Edit {sectionType === 'video' ? 'Video' : 'Product Showcase'} Section
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {sectionType === 'video' ? (
            <>
              <div>
                <label className="block text-sm font-bold mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter the URL of your video file (MP4 format recommended)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Header Text (Optional)</label>
                <input
                  type="text"
                  value={formData.headerText || ''}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="NOVÝ MERCH"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Button 1 Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.button1Text || ''}
                    onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Button 1 Link (Optional)</label>
                  <input
                    type="text"
                    value={formData.button1Link || ''}
                    onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="/kategorie/new"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Button 2 Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.button2Text || ''}
                    onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Button 2 Link (Optional)</label>
                  <input
                    type="text"
                    value={formData.button2Link || ''}
                    onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="/kategorie/featured"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold mb-2">Product Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Header Text</label>
                <input
                  type="text"
                  value={formData.headerText || ''}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black"
                  placeholder="NOVÝ MERCH"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Button 1 Text</label>
                  <input
                    type="text"
                    value={formData.button1Text || ''}
                    onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Button 1 Link</label>
                  <input
                    type="text"
                    value={formData.button1Link || ''}
                    onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="/kategorie/new"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Button 2 Text</label>
                  <input
                    type="text"
                    value={formData.button2Text || ''}
                    onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Button 2 Link</label>
                  <input
                    type="text"
                    value={formData.button2Link || ''}
                    onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-black"
                    placeholder="/kategorie/featured"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-black hover:bg-gray-100 font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 font-bold uppercase"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
