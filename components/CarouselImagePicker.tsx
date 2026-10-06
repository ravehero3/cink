'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload, Loader2, Check } from 'lucide-react';

interface CarouselImage {
  id: string;
  image: string;
  link: string;
}

interface CarouselImagePickerProps {
  onSelect: (image: string) => void;
  onClose: () => void;
}

export default function CarouselImagePicker({ onSelect, onClose }: CarouselImagePickerProps) {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/carousel?_t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setImages(data.slides || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);
      const res = await fetch('/api/carousel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadProgress(`Uploaded ${file.name}`);
        setTimeout(() => {
          fetchImages();
          setUploadProgress(null);
        }, 500);
      } else {
        setUploadProgress(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    onSelect(imageUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">
              Select Carousel Image
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Choose from uploaded images or upload a new one
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 text-center">
              <Upload size={36} />
              <p className="text-sm font-medium text-gray-600">
                No carousel images yet
              </p>
              <p className="text-xs text-gray-400">Upload your first carousel image below</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.image && handleSelectImage(item.image)}
                  disabled={!item.image}
                  className={`relative group flex flex-col rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                    item.image
                      ? 'border-gray-100 hover:border-gray-400 hover:ring-2 hover:ring-gray-400 hover:ring-offset-1'
                      : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-full bg-gray-50" style={{ paddingBottom: '62.5%', position: 'relative' }}>
                    <div className="absolute inset-0">
                      {item.image && (
                        <img src={item.image} alt="Carousel slide" className="w-full h-full object-cover" />
                      )}
                    </div>
                    {item.image && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    )}
                    {item.image && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check size={14} strokeWidth={3} className="text-gray-900" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-2 bg-white border-t border-gray-100">
                    <p className="text-[11px] font-medium text-gray-500 truncate">
                      {item.image ? 'Image loaded' : 'Empty slot'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1">
            {uploadProgress && (
              <p className="text-xs text-gray-500">{uploadProgress}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Upload New Image
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
