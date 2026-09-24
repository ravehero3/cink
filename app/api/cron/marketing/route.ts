import { NextResponse } from 'next/server';
import { isCronAuthorized, processDueJourneys, enrollWinbackCandidates, processAbandonedCartFallback } from '@/lib/journeys';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const abandoned = await processAbandonedCartFallback();
    const journeys = await processDueJourneys();
    const winback = await enrollWinbackCandidates();
    return NextResponse.json({ ok: true, abandoned, journeys, winback });
  } catch (error) {
    console.error('Marketing cron failed:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
