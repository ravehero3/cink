import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import { uploadToOracleVPS } from '@/lib/oracle-vps';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/jpg'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Soubor není přiložen.' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nepodporovaný formát obrázku. Povoleny: PNG, JPG, WEBP, GIF, AVIF.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Soubor je příliš velký (max ${MAX_SIZE / 1024 / 1024}MB).` },
        { status: 400 }
      );
    }

    // Generate filename
    const ext = file.type.replace('image/', '');
    const filename = crypto.randomBytes(12).toString('hex') + '.' + ext;
    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string = '';
    let vpsPath: string | null = null;
    let storageType = 'LOCAL';

    // Try Oracle VPS first
    try {
      const vpsResult = await uploadToOracleVPS(buffer, filename);
      url = vpsResult.url;
      vpsPath = vpsResult.vpsPath;
      storageType = 'ORACLE_VPS';
      console.log(`[Magazine] Image uploaded to Oracle VPS: ${filename}`);
    } catch (vpsError) {
      console.warn(`[Magazine] Oracle VPS upload failed, falling back to local:`, vpsError);
      // Fallback to local storage
      try {
        const uploadsDir = join(process.cwd(), 'public', 'magazine-uploads');
        await mkdir(uploadsDir, { recursive: true });
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        url = `/magazine-uploads/${filename}`;
        storageType = 'LOCAL';
        console.log(`[Magazine] Image saved locally: ${filename}`);
      } catch (localError) {
        console.error('Local filesystem write failed:', localError);
        return NextResponse.json(
          { error: 'Nahrávání obrázku selhalo. Zkuste to znovu.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      url,
      filename,
      storageType,
      vpsPath,
      message: storageType === 'ORACLE_VPS' 
        ? '✓ Obrázek je bezpečně uložen na Oracle VPS'
        : '⚠️ Obrázek je uložen lokálně',
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Nahrávání souboru selhalo.' },
      { status: 500 }
    );
  }
}
