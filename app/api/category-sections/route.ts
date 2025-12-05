import { NextResponse } from 'next/server';
import { PrismaClient, CategorySection } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sections = await prisma.categorySection.findMany();
    
    const sectionsMap: Record<string, any> = {};
    sections.forEach((section: CategorySection) => {
      sectionsMap[section.sectionKey] = {
        title: section.title || '',
        button1Text: section.button1Text || '',
        button2Text: section.button2Text || '',
        button1Link: section.button1Link || '',
        button2Link: section.button2Link || '',
      };
    });
    
    return NextResponse.json(sectionsMap);
  } catch (error) {
    console.error('Error fetching category sections:', error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionKey, ...data } = body;
    
    if (!sectionKey) {
      return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
    }
    
    const section = await prisma.categorySection.upsert({
      where: { sectionKey },
      update: {
        title: data.title || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
      },
      create: {
        sectionKey,
        title: data.title || null,
        button1Text: data.button1Text || null,
        button2Text: data.button2Text || null,
        button1Link: data.button1Link || null,
        button2Link: data.button2Link || null,
      },
    });
    
    return NextResponse.json(section);
  } catch (error) {
    console.error('Error saving category section:', error);
    return NextResponse.json({ error: 'Failed to save section' }, { status: 500 });
  }
}
