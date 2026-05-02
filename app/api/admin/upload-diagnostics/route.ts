import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ufosport_unsigned';

  const results: Record<string, any> = {
    config: {
      cloudName: cloudName || '(chybí)',
      apiKeySet: !!apiKey,
      apiSecretSet: !!apiSecret,
      uploadPreset,
    },
    tests: {},
  };

  // Test unsigned upload with a minimal 1x1 pixel PNG
  if (cloudName) {
    try {
      const pixel =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const fd = new FormData();
      fd.append('file', pixel);
      fd.append('upload_preset', uploadPreset);
      fd.append('folder', 'ufosport/diagnostics');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: fd }
      );
      const data = await res.json();

      if (res.ok && data.secure_url) {
        results.tests.unsignedUpload = {
          ok: true,
          url: data.secure_url,
          message: 'Unsigned upload funguje správně.',
        };
      } else {
        results.tests.unsignedUpload = {
          ok: false,
          error: data.error?.message || `HTTP ${res.status}`,
          message: 'Unsigned upload NEFUNGUJE.',
        };
      }
    } catch (e: any) {
      results.tests.unsignedUpload = {
        ok: false,
        error: e.message,
        message: 'Chyba sítě při testu unsigned uploadu.',
      };
    }
  } else {
    results.tests.unsignedUpload = {
      ok: false,
      message: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME není nastaven.',
    };
  }

  // Test signed API if credentials exist
  if (cloudName && apiKey && apiSecret) {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      const ping = await cloudinary.api.ping();
      results.tests.signedApi = { ok: true, ping, message: 'Signed API funguje.' };
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || String(e);
      results.tests.signedApi = {
        ok: false,
        error: msg,
        message: 'Signed API NEFUNGUJE.',
      };
    }
  } else {
    results.tests.signedApi = { ok: false, message: 'Chybí API klíče pro signed API.' };
  }

  const allOk = Object.values(results.tests).every((t: any) => t.ok);
  return NextResponse.json({ ...results, allOk }, { status: allOk ? 200 : 207 });
}
