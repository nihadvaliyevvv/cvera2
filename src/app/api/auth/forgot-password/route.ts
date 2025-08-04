import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const forgotPasswordSchema = z.object({
  email: z.string().email('Email düzgün formatda deyil'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'Əgər hesab mövcuddursa, parol sıfırlama linki göndəriləcək.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset token
    // For now, we'll just return success
    // In production, you would integrate with an email service like SendGrid, AWS SES, etc.
    
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    return NextResponse.json({
      message: 'Əgər hesab mövcuddursa, parol sıfırlama linki göndəriləcək.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Daxili server xətası' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
