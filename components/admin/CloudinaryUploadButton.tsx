'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  buttonText?: string;
  folderPath?: string;
  resourceType?: 'image' | 'video' | 'auto';
  maxFileSize?: number;
}

export default function CloudinaryUploadButton({
  onUploadSuccess,
  buttonText = 'Nahrát soubor',
  folderPath = 'ufosport/products',
  resourceType = 'auto',
  maxFileSize = 100000000,
}: CloudinaryUploadButtonProps) {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkCloudinary = () => {
      if ((window as any).cloudinary) {
        cloudinaryRef.current = (window as any).cloudinary;
        setIsLoading(false);
        return true;
      }
      return false;
    };

    if (checkCloudinary()) return;

    const existingScript = document.querySelector('script[src*="cloudinary-upload-widget"]');
    if (existingScript) {
      const checkLoad = setInterval(() => {
        if (checkCloudinary()) {
          clearInterval(checkLoad);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkLoad);
        if (!cloudinaryRef.current) setIsLoading(false);
      }, 10000);
      return () => clearInterval(checkLoad);
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/latest/global/cloudinary-upload-widget.global.js';
    script.async = true;
    
    script.onload = () => {
      if ((window as any).cloudinary) {
        cloudinaryRef.current = (window as any).cloudinary;
        setIsLoading(false);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Cloudinary widget script');
      setIsLoading(false);
    };
    
    document.body.appendChild(script);
  }, []);

  const openUploadWidget = () => {
    if (!cloudinaryRef.current) {
      alert('Cloudinary widget se nepodařilo načíst. Zkuste obnovit stránku.');
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
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 border border-black uppercase text-sm font-medium transition-colors ${
        isLoading 
          ? 'bg-gray-100 text-gray-400 cursor-wait' 
          : 'bg-white text-black hover:bg-black hover:text-white'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Načítání...
        </>
      ) : (
        <>
          <Upload size={16} />
          {buttonText}
        </>
      )}
    </button>
  );
}
