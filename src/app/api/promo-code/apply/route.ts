import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { promoCode } = await req.json();

    // Get user from token
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                  req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Giriş tələb olunur"
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const userId = decoded.userId;

    console.log(`🔍 Applying promo code: "${promoCode}" for user: ${userId}`);

    // Validate promo code input
    if (!promoCode || typeof promoCode !== 'string') {
      return NextResponse.json({
        success: false,
        message: "Promokod daxil edin"
      }, { status: 400 });
    }

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find promo code (try exact case first, then uppercase)
      let foundPromoCode = await tx.promoCode.findUnique({
        where: { code: promoCode.trim() },
        include: {
          usedBy: {
            where: { userId }
          }
        }
      });

      // If not found with exact case, try uppercase for backward compatibility
      if (!foundPromoCode) {
        foundPromoCode = await tx.promoCode.findUnique({
          where: { code: promoCode.trim().toUpperCase() },
          include: {
            usedBy: {
              where: { userId }
            }
          }
        });
      }

      if (!foundPromoCode) {
        throw new Error("Promokod tapılmadı");
      }

      // Check if promo code is active
      if (!foundPromoCode.isActive) {
        throw new Error("Bu promokod artıq aktiv deyil");
      }

      // Check if user already used this promo code
      if (foundPromoCode.usedBy.length > 0) {
        throw new Error("Bu promokodu artıq istifadə etmisiniz");
      }

      // Check usage limit
      if (foundPromoCode.usageLimit && foundPromoCode.usedCount >= foundPromoCode.usageLimit) {
        throw new Error("Bu promokoddun istifadə limiti bitib");
      }

      // Check expiration date
      if (foundPromoCode.expiresAt && foundPromoCode.expiresAt < new Date()) {
        throw new Error("Bu promokoddun vaxtı keçib");
      }

      // Get user info
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true } // Fixed: use 'subscriptions' not 'subscription'
      });

      if (!user) {
        throw new Error("İstifadəçi tapılmadı");
      }

      // Calculate subscription expiration (1 month from now for premium promo codes)
      let expiresAt;
      const premiumTiers = ['Medium', 'Pro', 'Populyar', 'Premium', 'Business'];

      if (premiumTiers.includes(foundPromoCode.tier)) {
        const now = new Date();
        expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        console.log(`🗓️ Setting 1 month expiration for ${foundPromoCode.tier} promo: ${expiresAt.toISOString()}`);
      } else {
        // For Free tier, set expiration to year 2099 (effectively unlimited)
        expiresAt = new Date('2099-12-31T23:59:59.999Z');
        console.log(`🗓️ Setting far future expiration for ${foundPromoCode.tier} promo: ${expiresAt.toISOString()}`);
      }

      // Delete existing subscriptions if exist (user can have multiple subscriptions)
      if (user.subscriptions && user.subscriptions.length > 0) {
        await tx.subscription.deleteMany({
          where: { userId: userId }
        });
        console.log(`🗑️ Deleted existing subscriptions for user ${userId}`);
      }

      // Update user tier to match the promo code tier
      await tx.user.update({
        where: { id: userId },
        data: { tier: foundPromoCode.tier }
      });

      // Create new subscription based on promo code tier
      const subscriptionData: any = {
        userId: userId,
        tier: foundPromoCode.tier,
        status: 'active',
        provider: 'promocode', // Use provider field for promo codes
        providerRef: `promo_${foundPromoCode.code}_${Date.now()}`, // Store promo reference
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Only add expiresAt if it's not null
      if (expiresAt) {
        subscriptionData.expiresAt = expiresAt;
      }

      const subscription = await tx.subscription.create({
        data: subscriptionData
      });

      // Mark promo code as used
      await tx.promoCodeUsage.create({
        data: {
          promoCodeId: foundPromoCode.id,
          userId: userId,
          usedAt: new Date()
        }
      });

      // Update promo code usage count
      await tx.promoCode.update({
        where: { id: foundPromoCode.id },
        data: {
          usedCount: foundPromoCode.usedCount + 1
        }
      });

      console.log(`✅ Successfully applied promo code ${foundPromoCode.code} for user ${userId}`);
      console.log(`📦 Created ${foundPromoCode.tier} subscription until ${expiresAt ? expiresAt.toISOString() : 'unlimited'}`);

      return {
        subscription,
        promoCode: foundPromoCode,
        expiresAt
      };
    });

    return NextResponse.json({
      success: true,
      message: `${result.promoCode.tier} abunəliyi uğurla aktivləşdirildi!`,
      subscription: {
        tier: result.subscription.tier,
        status: result.subscription.status,
        expiresAt: result.subscription.expiresAt,
        daysRemaining: result.expiresAt ? Math.ceil((result.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      }
    });

  } catch (error) {
    console.error('❌ Promo code application error:', error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Server xətası'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
