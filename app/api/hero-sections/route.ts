import { NextResponse } from 'next/server';
import { PrismaClient, HeroSection } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sections = await prisma.heroSection.findMany();
    
    const sectionsMap: Record<string, any> = {};
    sections.forEach((section: HeroSection) => {
      sectionsMap[section.sectionKey] = {
        videoUrl: section.videoUrl || '',
        mobileVideoUrl: section.mobileVideoUrl || '',
        imageUrl: section.imageUrl || '',
        mobileImageUrl: section.mobileImageUrl || '',
        headerText: section.headerText || '',
        button1Text: section.button1Text || '',
        button2Text: section.button2Text || '',
        button1Link: section.button1Link || '',
        button2Link: section.button2Link || '',
      };
    });
    
    return NextResponse.json(sectionsMap, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
    
    const body = await request.json();
    const { sectionKey, ...data } = body;
    
    console.log('Saving hero section:', { sectionKey, data });
    
    if (!sectionKey) {
      return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
    }
    
    const section = await prisma.heroSection.upsert({
      where: { sectionKey },
      update: {
        videoUrl: data.videoUrl || null,
        mobileVideoUrl: data.mobileVideoUrl || null,
        imageUrl: data.imageUrl || null,
        mobileImageUrl: data.mobileImageUrl || null,
        headerText: data.headerText || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
      },
      create: {
        sectionKey,
        videoUrl: data.videoUrl || null,
        mobileVideoUrl: data.mobileVideoUrl || null,
        imageUrl: data.imageUrl || null,
        mobileImageUrl: data.mobileImageUrl || null,
        headerText: data.headerText || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
      },
    });
    
    console.log('Hero section saved successfully:', section);
    
    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Error saving hero section:', error);
    return NextResponse.json({ error: 'Failed to save section', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
