import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJWT } from "@/lib/jwt";

const prisma = new PrismaClient();

function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  
  const payload = verifyJWT(token);
  return payload?.userId || null;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tier } = await req.json();
    
    if (!tier || !['Free', 'Medium', 'Premium'].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          tier,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId,
          tier,
          status: 'active',
          provider: 'epointaz',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      });
    }

    // For paid tiers, you would typically redirect to payment
    // For now, we'll just return success for Free tier
    if (tier === 'Free') {
      return NextResponse.json({ success: true });
    }

    // For paid tiers, return payment URL (implement epoint.az integration)
    const paymentUrl = `/payments/create?tier=${tier}&amount=${tier === 'Medium' ? 999 : 1999}`;
    
    return NextResponse.json({ 
      success: true, 
      paymentUrl: paymentUrl,
      message: 'Ödəniş üçün yönləndirilirsiniz...' 
    });

  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
