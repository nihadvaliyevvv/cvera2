import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import EpointService from '@/lib/epoint';

const prisma = new PrismaClient();

// POST /api/webhooks/epoint - epoint.az webhook handler
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('X-Epoint-Signature');
    const rawBody = await req.text();
    
    if (!signature || !EpointService.verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { transaction_id, order_id, status, amount, currency } = payload;

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId: transaction_id },
          { orderId: order_id }
        ]
      },
      include: {
        user: true
      }
    });

    if (!payment) {
      console.error('Payment not found for transaction:', transaction_id);
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    let newStatus = 'pending';
    if (status === 'completed' || status === 'success') {
      newStatus = 'completed';
    } else if (status === 'failed' || status === 'error') {
      newStatus = 'failed';
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // If payment is completed, create or update subscription
    if (newStatus === 'completed') {
      await prisma.subscription.create({
        data: {
          userId: payment.userId,
          tier: payment.planType,
          status: 'active',
          provider: 'epoint',
          providerRef: transaction_id,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      console.log(`✅ Subscription activated for user ${payment.user.email}: ${payment.planType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/webhooks/epoint - Test endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Epoint webhook endpoint is working',
    demoMode: process.env.EPOINT_DEMO_MODE === 'true'
  });
}
