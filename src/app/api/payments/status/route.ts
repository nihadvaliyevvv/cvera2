import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const paymentStatusSchema = z.object({
  transactionId: z.string(),
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
    const { transactionId } = paymentStatusSchema.parse(body);

    const paymentStatus = await epointService.getPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      orderId: paymentStatus.orderId,
      paymentMethod: paymentStatus.paymentMethod,
      cardMask: paymentStatus.cardMask,
      processingTime: paymentStatus.processingTime,
      responseCode: paymentStatus.responseCode,
      responseMessage: paymentStatus.responseMessage,
      bankMessage: epointService.getBankResponseMessage(paymentStatus.responseCode || '000')
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Payment status error:', error);
    return NextResponse.json(
      { message: 'Ödəniş statusu yoxlanarkən xəta' },
      { status: 500 }
    );
  }
}
