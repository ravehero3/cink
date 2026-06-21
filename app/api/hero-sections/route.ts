import { NextResponse } from 'next/server';
import { PrismaClient, HeroSection, SectionType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sections = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    });
    
    const sectionsArray = sections.map((section: HeroSection) => ({
      id: section.id,
      sectionKey: section.sectionKey,
      sectionType: section.sectionType,
      order: section.order,
      videoUrl: section.videoUrl || '',
      mobileVideoUrl: section.mobileVideoUrl || '',
      imageUrl: section.imageUrl || '',
      mobileImageUrl: section.mobileImageUrl || '',
      headerText: section.headerText || '',
      button1Text: section.button1Text || '',
      button2Text: section.button2Text || '',
      button1Link: section.button1Link || '',
      button2Link: section.button2Link || '',
      textColor: section.textColor || 'black',
      quadImage1: (section as any).quadImage1 || '',
      quadImage1Hover: (section as any).quadImage1Hover || '',
      quadImage1Text: (section as any).quadImage1Text || '',
      quadImage1Link: (section as any).quadImage1Link || '',
      quadImage2: (section as any).quadImage2 || '',
      quadImage2Hover: (section as any).quadImage2Hover || '',
      quadImage2Text: (section as any).quadImage2Text || '',
      quadImage2Link: (section as any).quadImage2Link || '',
      quadImage3: (section as any).quadImage3 || '',
      quadImage3Hover: (section as any).quadImage3Hover || '',
      quadImage3Text: (section as any).quadImage3Text || '',
      quadImage3Link: (section as any).quadImage3Link || '',
      quadImage4: (section as any).quadImage4 || '',
      quadImage4Hover: (section as any).quadImage4Hover || '',
      quadImage4Text: (section as any).quadImage4Text || '',
      quadImage4Link: (section as any).quadImage4Link || '',
    }));
    
    return NextResponse.json(sectionsArray, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
    
    const body = await request.json();
    const { sectionKey, sectionType, order, ...data } = body;
    
    console.log('Saving hero section:', { sectionKey, sectionType, order, data });
    
    if (!sectionKey) {
      return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
    }
    
    const quadFields = {
      quadImage1: data.quadImage1 || null,
      quadImage1Hover: data.quadImage1Hover || null,
      quadImage1Text: data.quadImage1Text || null,
      quadImage1Link: data.quadImage1Link || null,
      quadImage2: data.quadImage2 || null,
      quadImage2Hover: data.quadImage2Hover || null,
      quadImage2Text: data.quadImage2Text || null,
      quadImage2Link: data.quadImage2Link || null,
      quadImage3: data.quadImage3 || null,
      quadImage3Hover: data.quadImage3Hover || null,
      quadImage3Text: data.quadImage3Text || null,
      quadImage3Link: data.quadImage3Link || null,
      quadImage4: data.quadImage4 || null,
      quadImage4Hover: data.quadImage4Hover || null,
      quadImage4Text: data.quadImage4Text || null,
      quadImage4Link: data.quadImage4Link || null,
    };

    const section = await prisma.heroSection.upsert({
      where: { sectionKey },
      update: {
        sectionType: sectionType || undefined,
        order: order !== undefined ? order : undefined,
        videoUrl: data.videoUrl || null,
        mobileVideoUrl: data.mobileVideoUrl || null,
        imageUrl: data.imageUrl || null,
        mobileImageUrl: data.mobileImageUrl || null,
        headerText: data.headerText || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
        textColor: data.textColor || 'black',
        ...quadFields,
      },
      create: {
        sectionKey,
        sectionType: sectionType || 'VIDEO',
        order: order !== undefined ? order : 0,
        videoUrl: data.videoUrl || null,
        mobileVideoUrl: data.mobileVideoUrl || null,
        imageUrl: data.imageUrl || null,
        mobileImageUrl: data.mobileImageUrl || null,
        headerText: data.headerText || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
        textColor: data.textColor || 'black',
        ...quadFields,
      },
    });
    
    console.log('Hero section saved successfully:', section);
    
    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Error saving hero section:', error);
    return NextResponse.json({ error: 'Failed to save section', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('sectionKey');
    
    if (!sectionKey) {
      return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
    }
    
    const deletedSection = await prisma.heroSection.delete({
      where: { sectionKey },
    });
    
    const remainingSections = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    });
    
    for (let i = 0; i < remainingSections.length; i++) {
      await prisma.heroSection.update({
        where: { id: remainingSections[i].id },
        data: { order: i },
      });
    }
    
    console.log('Hero section deleted successfully:', sectionKey);
    
    return NextResponse.json({ success: true, deletedSection });
  } catch (error) {
    console.error('Error deleting hero section:', error);
    return NextResponse.json({ error: 'Failed to delete section', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
