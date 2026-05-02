import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.UPLOADTHING_TOKEN;

  const results: Record<string, any> = {
    config: {
      tokenSet: !!token,
    },
    tests: {},
  };

  if (!token) {
    results.tests.uploadthingApi = {
      ok: false,
      message: 'UPLOADTHING_TOKEN není nastaven.',
    };
    return NextResponse.json({ ...results, allOk: false }, { status: 207 });
  }

  try {
    const res = await fetch('https://api.uploadthing.com/v6/listFiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Uploadthing-Api-Key': token.startsWith('sk_') ? token : `Bearer ${token}`,
      },
      body: JSON.stringify({ limit: 1 }),
    });

    if (res.ok || res.status === 200) {
      results.tests.uploadthingApi = {
        ok: true,
        message: 'UploadThing API funguje správně. Upload obrázků je aktivní.',
      };
    } else {
      const body = await res.json().catch(() => ({}));
      results.tests.uploadthingApi = {
        ok: false,
        error: body?.message || body?.error || `HTTP ${res.status}`,
        message: 'UploadThing API vrátilo chybu.',
      };
    }
  } catch (e: any) {
    results.tests.uploadthingApi = {
      ok: false,
      error: e.message,
      message: 'Chyba sítě při testu UploadThing API.',
    };
  }

  const allOk = Object.values(results.tests).every((t: any) => t.ok);
  return NextResponse.json({ ...results, allOk }, { status: allOk ? 200 : 207 });
}
