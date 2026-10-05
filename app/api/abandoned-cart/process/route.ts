import { NextResponse } from 'next/server';
import { processAbandonedCartFallback, processDueJourneys, isCronAuthorized } from '@/lib/journeys';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const abandoned = await processAbandonedCartFallback();
    const result = await processDueJourneys();
    const { processed: journeysProcessed, ...journeyStats } = result;
    return NextResponse.json({ processed: abandoned.carts, journeysProcessed, ...journeyStats });
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
