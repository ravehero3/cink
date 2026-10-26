import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';

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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generate random filename
    const ext = file.type.replace('image/', '');
    const filename = crypto.randomBytes(12).toString('hex') + '.' + ext;
    
    // Save to local storage
    const uploadsDir = join(process.cwd(), 'public', 'magazine-uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filepath = join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/magazine-uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
