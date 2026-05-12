import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { type: 'asc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const template = await prisma.emailTemplate.create({
      data: body,
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating email template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
