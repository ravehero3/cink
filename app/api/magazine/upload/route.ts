import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/jpg'];

/**
 * Magazine image upload endpoint
 * Uploads images to local public/magazine-uploads directory
 * Images are accessible at /api/magazine/media/{filename}
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('[Magazine Upload] Žádný soubor nebyl odeslán');
      return NextResponse.json({ error: 'Soubor není přiložen.' }, { status: 400 });
    }

    console.log(`[Magazine Upload] Přijat soubor: ${file.name}, Typ: ${file.type}, Velikost: ${file.size} bytes`);

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.warn(`[Magazine Upload] Nepodporovaný formát: ${file.type}`);
      return NextResponse.json(
        { error: 'Nepodporovaný formát obrázku. Povoleny: PNG, JPG, WEBP, GIF, AVIF.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      console.warn(`[Magazine Upload] Soubor příliš velký: ${file.size} > ${MAX_SIZE}`);
      return NextResponse.json(
        { error: `Soubor je příliš velký (max ${MAX_SIZE / 1024 / 1024}MB).` },
        { status: 400 }
      );
    }

    // Generate filename with timestamp and random hash
    const ext = file.type.replace('image/', '').replace('image/jpg', 'jpg').replace('image/jpeg', 'jpg');
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const filename = `magazine-${timestamp}-${randomHash}.${ext}`;
    
    console.log(`[Magazine Upload] Generovaný filename: ${filename}`);

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      console.log(`[Magazine Upload] Buffer vytvořen: ${buffer.length} bytes`);

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'magazine-uploads');
      console.log(`[Magazine Upload] Target dir: ${uploadsDir}`);
      
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log(`[Magazine Upload] Adresář vytvořen/ověřen`);
      } catch (mkdirError) {
        console.error('[Magazine Upload] Chyba při vytváření adresáře:', mkdirError);
        // Continue anyway, directory might already exist
      }

      // Write file to disk
      const filepath = join(uploadsDir, filename);
      console.log(`[Magazine Upload] Zápis na cestu: ${filepath}`);
      
      await writeFile(filepath, buffer);
      console.log(`[Magazine Upload] ✓ Soubor úspěšně zapsán: ${filename}`);

      // Construct the public URL via API route for reliable serving
      const url = `/api/magazine/media/${filename}`;

      console.log(`[Magazine Upload] Vrácená URL: ${url}`);

      return NextResponse.json({
        url,
        filename,
        size: file.size,
        type: file.type,
      });
    } catch (writeError) {
      console.error('[Magazine Upload] Chyba při zápisu souboru:', writeError);
      return NextResponse.json(
        { error: 'Nahrávání obrázku selhalo - chyba při zápisu na disk.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Magazine Upload] Chyba nahrávání obrázku:', error);
    return NextResponse.json(
      { error: 'Nahrávání souboru selhalo. ' + (error instanceof Error ? error.message : '') },
      { status: 500 }
    );
  }
}
