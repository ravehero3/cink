'use client';

import { useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  buttonText?: string;
  folderPath?: string;
  resourceType?: 'image' | 'video' | 'auto';
  maxFileSize?: number;
}

// Global script loading state to prevent race conditions
let cloudinaryScriptLoading = false;
let cloudinaryScriptLoaded = false;

export default function CloudinaryUploadButton({
  onUploadSuccess,
  buttonText = 'Nahrát soubor',
  folderPath = 'ufosport/products',
  resourceType = 'auto',
  maxFileSize = 100000000,
}: CloudinaryUploadButtonProps) {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // If already loaded, use it
    if ((window as any).cloudinary) {
      cloudinaryRef.current = (window as any).cloudinary;
      cloudinaryScriptLoaded = true;
      return;
    }

    // If already loading, wait for it to complete
    if (cloudinaryScriptLoading) {
      const checkInterval = setInterval(() => {
        if ((window as any).cloudinary) {
          cloudinaryRef.current = (window as any).cloudinary;
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Mark as loading to prevent other components from loading it again
    cloudinaryScriptLoading = true;

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/latest/global/cloudinary-upload-widget.global.js';
    script.async = true;
    
    script.onload = () => {
      try {
        if ((window as any).cloudinary) {
          cloudinaryRef.current = (window as any).cloudinary;
          cloudinaryScriptLoading = false;
          cloudinaryScriptLoaded = true;
        }
      } catch (error) {
        console.error('Failed to initialize Cloudinary:', error);
        cloudinaryScriptLoading = false;
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget script');
      cloudinaryScriptLoading = false;
    };
    
    document.body.appendChild(script);
    
    // NOTE: Not removing script on unmount - it's shared resource used by multiple components
  }, []);

  const openUploadWidget = () => {
    if (!cloudinaryRef.current) {
      console.warn('Cloudinary widget not yet loaded');
      alert('Cloudinary widget se právě načítá, zkuste znovu za chvíli');
      return;
    }

    try {
      if (!widgetRef.current) {
        widgetRef.current = cloudinaryRef.current.createUploadWidget(
          {
            cloudName: 'dq0qvtbst',
            uploadPreset: 'ufosport_unsigned',
            folder: folderPath,
            resourceType: resourceType,
            multiple: false,
            maxFileSize: maxFileSize,
            clientAllowedFormats: resourceType === 'video' ? ['mp4', 'webm'] : ['jpg', 'jpeg', 'png', 'webp'],
            showAdvancedOptions: false,
            cropping: resourceType === 'image',
            defaultSource: 'local',
            styles: {
              palette: {
                window: '#ffffff',
                windowBorder: '#000000',
                tabIcon: '#000000',
                menuIcons: '#5a616a',
                textDark: '#000000',
                textLight: '#ffffff',
                link: '#000000',
                action: '#000000',
                inactiveTabIcon: '#cccccc',
                error: '#f44235',
                inProgress: '#01579b',
                complete: '#228b22',
                sourceBg: '#f5f5f5',
              },
              fonts: {
                default: null,
                "'Helvetica Neue', 'Helvetica', sans-serif": {
                  url: null,
                  active: true,
                },
              },
            },
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              alert(`Chyba: ${error.statusText || error.message}`);
              return;
            }

            if (result && result.event === 'success') {
              try {
                const secureUrl = result.info.secure_url;
                const publicId = result.info.public_id;
                onUploadSuccess(secureUrl, publicId);
              } catch (err) {
                console.error('Error processing upload result:', err);
              }
            }
          }
        );
      }

      if (widgetRef.current && typeof widgetRef.current.open === 'function') {
        widgetRef.current.open();
      }
    } catch (error) {
      console.error('Error opening Cloudinary widget:', error);
      alert('Chyba při otevírání upload widgetu. Zkuste obnovit stránku.');
    }
  };

  return (
    <button
      onClick={openUploadWidget}
      type="button"
      className="flex items-center gap-2 px-4 py-2 bg-white border border-black text-black uppercase text-sm font-medium hover:bg-black hover:text-white transition-colors"
    >
      <Upload size={16} />
      {buttonText}
    </button>
  );
}
