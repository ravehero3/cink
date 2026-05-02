import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Přístup zamítnut' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'ufosport/products';

    if (!file) {
      return NextResponse.json({ error: 'Žádný soubor nebyl odeslán' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Nepodporovaný formát "${file.type}". Použijte JPG, PNG nebo WebP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        { error: `Soubor je příliš velký (${mb} MB). Maximum je 15 MB.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: 'image' }, (error, res) => {
          if (error) reject(error);
          else resolve(res);
        })
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    const msg =
      error?.error?.message ||
      error?.message ||
      JSON.stringify(error?.error) ||
      'Neznámá chyba serveru';
    console.error('Upload error:', error);
    return NextResponse.json({ error: `Upload selhal: ${msg}` }, { status: 500 });
  }
}

export async function GET() {
  const missing: string[] = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, missing }, { status: 500 });
  }

  try {
    const result = await cloudinary.api.ping();
    return NextResponse.json({
      ok: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping: result,
    });
  } catch (error: any) {
    const msg =
      error?.error?.message ||
      error?.message ||
      'Cloudinary API nedostupné';
    return NextResponse.json({
      ok: false,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      error: msg,
      note: 'Signed API nedostupné, unsigned preset (ufosport_unsigned) může stále fungovat pro přímé uploady.',
    });
  }
}
