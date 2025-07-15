import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

// POST /api/payments/demo-success - Handle demo payment success
export async function POST(req: NextRequest) {
  try {
    const { transactionId, orderId } = await req.json();

    if (!transactionId || !orderId) {
      return NextResponse.json(
        { message: 'Transaction ID və Order ID tələb olunur' },
        { status: 400 }
      );
    }

    // Find payment by transaction ID or order ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId: transactionId },
          { orderId: orderId }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status to completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        updatedAt: new Date()
      }
    });

    // Cancel any existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        userId: payment.userId,
        status: 'active'
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    // Create new subscription
    await prisma.subscription.create({
      data: {
        userId: payment.userId,
        tier: payment.planType,
        status: 'active',
        provider: 'epoint',
        providerRef: transactionId,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    console.log(`✅ Demo payment completed and subscription activated: ${payment.user.email} -> ${payment.planType}`);

    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully',
      tier: payment.planType
    });

  } catch (error) {
    console.error('Demo payment success error:', error);
    return NextResponse.json(
      { message: 'Daxili server xətası' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
