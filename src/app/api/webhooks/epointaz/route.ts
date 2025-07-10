import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function verifyEpointWebhook(payload: string, signature: string): boolean {
  const secret = process.env.EPOINT_WEBHOOK_SECRET || "";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// POST /api/webhooks/epointaz - Handle epoint.az webhook events
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-epoint-signature");
    const payload = await req.text();

    if (!signature || !verifyEpointWebhook(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    
    switch (event.type) {
      case "payment.success":
        await handlePaymentSuccess(event.data);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.data);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.data);
        break;
      case "subscription.expired":
        await handleSubscriptionExpired(event.data);
        break;
      default:
        console.log("Unhandled webhook event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(data: {
  subscription_id: string;
  [key: string]: unknown;
}) {
  // Update subscription status based on successful payment
  await prisma.subscription.updateMany({
    where: { providerRef: data.subscription_id },
    data: { status: "active" },
  });
}

async function handlePaymentFailed(data: {
  subscription_id: string;
  [key: string]: unknown;
}) {
  // Handle failed payment
  await prisma.subscription.updateMany({
    where: { providerRef: data.subscription_id },
    data: { status: "payment_failed" },
  });
}

async function handleSubscriptionCreated(data: {
  customer_email: string;
  tier: string;
  subscription_id: string;
  expires_at: string;
  [key: string]: unknown;
}) {
  // Create new subscription record
  const user = await prisma.user.findUnique({
    where: { email: data.customer_email },
  });

  if (user) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: data.tier,
        status: "active",
        provider: "epointaz",
        providerRef: data.subscription_id,
        expiresAt: new Date(data.expires_at),
      },
    });
  }
}

async function handleSubscriptionCancelled(data: {
  subscription_id: string;
  [key: string]: unknown;
}) {
  await prisma.subscription.updateMany({
    where: { providerRef: data.subscription_id },
    data: { status: "cancelled" },
  });
}

async function handleSubscriptionExpired(data: {
  subscription_id: string;
  [key: string]: unknown;
}) {
  await prisma.subscription.updateMany({
    where: { providerRef: data.subscription_id },
    data: { status: "expired" },
  });
}
