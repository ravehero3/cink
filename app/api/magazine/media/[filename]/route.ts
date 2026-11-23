import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';

/**
 * Serves magazine upload images
 * GET /api/magazine/media/{filename}
 * 
 * This route serves images that were uploaded to public/magazine-uploads/
 * It's needed because Next.js in production doesn't always serve public files directly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename as string;

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Construct file path
    const filepath = join(process.cwd(), 'public', 'magazine-uploads', filename);

    // Check if file exists
    try {
      await access(filepath, constants.R_OK);
    } catch (err) {
      console.log(`Magazine image not found: ${filename}`);
      return NextResponse.json(
        { error: 'Obrázek nenalezen' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filepath);

    // Determine content type based on extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'avif': 'image/avif',
    };
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    // Return image with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving magazine image:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání obrázku' },
      { status: 500 }
    );
  }
}
