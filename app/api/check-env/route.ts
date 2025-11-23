import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    database: !!process.env.DATABASE_URL,
    nextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  };

  const allConfigured = Object.values(checks).every(Boolean);

  const details = {
    database: checks.database ? '✅ Configured' : '❌ Missing DATABASE_URL',
    nextAuthUrl: checks.nextAuthUrl 
      ? `✅ Configured: ${process.env.NEXTAUTH_URL}` 
      : '❌ Missing NEXTAUTH_URL',
    nextAuthSecret: checks.nextAuthSecret ? '✅ Configured' : '❌ Missing NEXTAUTH_SECRET',
    googleOAuth: checks.googleClientId && checks.googleClientSecret 
      ? '✅ Both Client ID and Secret configured' 
      : `❌ Missing: ${!checks.googleClientId ? 'GOOGLE_CLIENT_ID ' : ''}${!checks.googleClientSecret ? 'GOOGLE_CLIENT_SECRET' : ''}`,
  };

  return NextResponse.json({
    status: allConfigured ? 'ready' : 'incomplete',
    message: allConfigured 
      ? 'All environment variables are configured!' 
      : 'Some environment variables are missing',
    checks: details,
    timestamp: new Date().toISOString(),
  });
}
