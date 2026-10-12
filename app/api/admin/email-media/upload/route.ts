import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Žádný soubor nebyl nahrán' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Neplatný typ obrázku. Přijímáme PNG, JPG, WebP, GIF, AVIF.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Soubor je příliš velký. Maximum je 10 MB.' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary for persistence
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ufosport_emails');
    cloudFormData.append('folder', 'ufosport/emails');

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json().catch(() => ({}));
      console.error('Cloudinary error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Nahrávání do Cloudinary selhalo' },
        { status: 500 }
      );
    }

    const data = await cloudinaryResponse.json();
    
    return NextResponse.json(
      { 
        url: data.secure_url,
        cloudinaryId: data.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Nahrávání selhalo' }, { status: 500 });
  }
}
