import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const prisma = new PrismaClient();

const refundSchema = z.object({
  transactionId: z.string(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { message: 'Yanlış token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, amount, reason } = refundSchema.parse(body);

    // Check if payment exists and belongs to user
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: transactionId,
        userId: decoded.userId,
        status: 'completed'
      }
    });

    if (!payment) {
      return NextResponse.json(
        { message: 'Ödəniş tapılmadı və ya artıq qaytarılıb' },
        { status: 404 }
      );
    }

    const refundResult = await epointService.refundPayment({
      transactionId,
      amount: amount || payment.amount,
      reason: reason || 'Müştəri tələbi'
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { message: refundResult.message || 'Refund əməliyyatı uğursuz' },
        { status: 400 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'refunded'
      }
    });

    // Cancel associated subscription
    await prisma.subscription.updateMany({
      where: {
        userId: decoded.userId,
        status: 'active'
      },
      data: {
        status: 'cancelled'
      }
    });

    return NextResponse.json({
      success: true,
      refundId: refundResult.refundId,
      message: 'Refund uğurla tamamlandı'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Refund error:', error);
    return NextResponse.json(
      { message: 'Refund əməliyyatı zamanı xəta' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
