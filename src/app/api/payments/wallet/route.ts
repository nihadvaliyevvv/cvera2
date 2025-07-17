import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const walletSchema = z.object({
  walletId: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
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

    const walletStatus = await epointService.getWalletStatus();

    return NextResponse.json({
      success: walletStatus.success,
      wallets: walletStatus.wallets,
      message: walletStatus.message
    });

  } catch (error) {
    console.error('Wallet status error:', error);
    return NextResponse.json(
      { message: 'Cüzdan statusu yoxlanarkən xəta' },
      { status: 500 }
    );
  }
}

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
    const { walletId, amount, currency, orderId, description } = walletSchema.parse(body);

    if (!walletId || !amount || !currency || !orderId || !description) {
      return NextResponse.json(
        { message: 'Bütün məlumatlar tələb olunur' },
        { status: 400 }
      );
    }

    const paymentResult = await epointService.payWithWallet(
      walletId,
      amount,
      currency,
      orderId,
      description
    );

    return NextResponse.json({
      success: paymentResult.success,
      transactionId: paymentResult.transactionId,
      message: paymentResult.message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Wallet payment error:', error);
    return NextResponse.json(
      { message: 'Cüzdan ödənişi zamanı xəta' },
      { status: 500 }
    );
  }
}
