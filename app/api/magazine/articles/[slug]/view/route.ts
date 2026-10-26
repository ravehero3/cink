import { NextRequest, NextResponse } from 'next/server';
import { recordArticleView } from '@/lib/magazine-analytics-views';

/**
 * POST /api/magazine/articles/[slug]/view
 * Records a view for an article
 * Public endpoint - no auth required (it's just view tracking)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug as string;

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    await recordArticleView(slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error recording view:', error);
    // Return success anyway - tracking is optional
    return NextResponse.json({ ok: true });
  }
}
