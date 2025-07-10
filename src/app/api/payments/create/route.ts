import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

const createPaymentSchema = z.object({
  tier: z.enum(['free', 'medium', 'premium']),
  amount: z.number().min(0),
});

// epoint.az configuration
const EPOINT_MERCHANT_ID = process.env.EPOINT_MERCHANT_ID;
const EPOINT_SECRET_KEY = process.env.EPOINT_SECRET_KEY;
const EPOINT_BASE_URL = process.env.EPOINT_BASE_URL || 'https://epoint.az/api/v1';

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
    const { tier, amount } = createPaymentSchema.parse(body);

    // Check if free tier
    if (tier === 'free') {
      // Cancel existing subscription and set to free
      await prisma.subscription.updateMany({
        where: {
          userId: decoded.userId,
          status: 'active',
        },
        data: {
          status: 'cancelled',
        },
      });

      // Create free subscription
      await prisma.subscription.create({
        data: {
          userId: decoded.userId,
          tier: 'free',
          status: 'active',
          provider: 'system',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      return NextResponse.json({
        message: 'Pulsuz abunəlik aktivləşdirildi',
        subscription: { tier: 'free', status: 'active' },
      });
    }

    // Generate unique transaction ID
    const transactionId = crypto.randomUUID();
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: decoded.userId,
        tier,
        amount,
        status: 'pending',
        provider: 'epointaz',
        transactionId,
      },
    });

    // Prepare epoint.az payment data
    const paymentData = {
      merchant_id: EPOINT_MERCHANT_ID,
      transaction_id: transactionId,
      amount: amount * 100, // Convert to cents
      currency: 'AZN',
      description: `CVera ${tier} abunəlik`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/epointaz`,
      customer_email: decoded.email,
    };

    // Generate signature for epoint.az
    const signatureString = Object.keys(paymentData)
      .sort()
      .map(key => `${key}=${paymentData[key as keyof typeof paymentData]}`)
      .join('&');
    
    const signature = crypto
      .createHmac('sha256', EPOINT_SECRET_KEY!)
      .update(signatureString)
      .digest('hex');

    // Create payment URL
    const paymentUrl = `${EPOINT_BASE_URL}/payment/create?${Object.entries({
      ...paymentData,
      signature,
    }).map(([key, value]) => `${key}=${encodeURIComponent(value?.toString() || '')}`).join('&')}`;

    return NextResponse.json({
      paymentUrl,
      transactionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Payment creation error:', error);
    return NextResponse.json(
      { message: 'Ödəniş yaradılarkən xəta' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
