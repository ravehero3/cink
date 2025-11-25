import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token, email, newPassword } = await request.json();

    console.log('🔵 RESET PASSWORD - Received:', { token: token?.substring(0, 10) + '...', email, newPasswordLength: newPassword?.length });

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Heslo musí obsahovat alespoň 6 znaků' },
        { status: 400 }
      );
    }

    console.log('🔵 RESET PASSWORD - Looking for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('🔵 RESET PASSWORD - User found:', user ? `${user.email}` : 'NOT FOUND');

    if (!user) {
      console.error('🔴 RESET PASSWORD - User not found for email:', email);
      return NextResponse.json(
        { error: 'Uživatel nebyl nalezen' },
        { status: 404 }
      );
    }

    // Check if token matches and is not expired
    console.log('🔵 RESET PASSWORD - Checking token validity');
    console.log('🔵 RESET PASSWORD - Token from URL:', token?.substring(0, 20) + '...');
    console.log('🔵 RESET PASSWORD - Token from DB:', user.resetToken?.substring(0, 20) + '...');
    console.log('🔵 RESET PASSWORD - Token matches:', user.resetToken === token);
    
    if (user.resetToken !== token) {
      return NextResponse.json(
        { error: 'Neplatný odkaz pro obnovení hesla' },
        { status: 400 }
      );
    }

    console.log('🔵 RESET PASSWORD - Token expiry:', user.resetTokenExpiry);
    console.log('🔵 RESET PASSWORD - Current time:', new Date());
    
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Odkaz pro obnovení hesla vypršel. Požádejte o nový.' },
        { status: 400 }
      );
    }

    // Hash new password
    console.log('🔵 RESET PASSWORD - Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    console.log('🔵 RESET PASSWORD - Updating user in database...');
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log('✅ RESET PASSWORD - Successfully updated password for:', email);
    return NextResponse.json(
      { message: 'Heslo bylo úspěšně obnoveno' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě při obnovení hesla' },
      { status: 500 }
    );
  }
}
