import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'magazine-uploads');
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
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
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert to buffer and save
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(bytes));

    const url = `/magazine-uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
