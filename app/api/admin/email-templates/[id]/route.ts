import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating email template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.emailTemplate.delete({
      where: { id: params.id },
    });
    return new NextResponse('OK');
  } catch (error) {
    console.error('Error deleting email template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
