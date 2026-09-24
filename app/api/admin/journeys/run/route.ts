import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processDueJourneys, enrollWinbackCandidates, processAbandonedCartFallback } from '@/lib/journeys';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const abandoned = await processAbandonedCartFallback();
  const journeys = await processDueJourneys();
  const winback = await enrollWinbackCandidates();
  return NextResponse.json({ ok: true, abandoned, journeys, winback });
}
