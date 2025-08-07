import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { promoCode } = await req.json();

    // Get user from token
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                  req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        message: "Giriş tələb olunur"
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    console.log(`🔍 Applying promo code: "${promoCode}" for user: ${userId}`);

    // Validate promo code
    if (!promoCode || typeof promoCode !== 'string') {
      return NextResponse.json({
        message: "Promokod daxil edin"
      }, { status: 400 });
    }

    // First try exact case match, then fallback to uppercase
    let foundPromoCode = await prisma.promoCode.findUnique({
      where: { code: promoCode.trim() },
      include: {
        usedBy: {
          where: { userId }
        }
      }
    });

    // If not found with exact case, try uppercase for backward compatibility
    if (!foundPromoCode) {
      foundPromoCode = await prisma.promoCode.findUnique({
        where: { code: promoCode.trim().toUpperCase() },
        include: {
          usedBy: {
            where: { userId }
          }
        }
      });
    }

    if (!foundPromoCode) {
      console.log(`❌ Promo code not found in database: "${promoCode}"`);
      return NextResponse.json({
        message: "Promokod tapılmadı"
      }, { status: 404 });
    }

    console.log(`✅ Found promo code: ${foundPromoCode.code} - ${foundPromoCode.tier}`);

    // Check if promo code is active
    if (!foundPromoCode.isActive) {
      return NextResponse.json({
        message: "Promokod aktiv deyil"
      }, { status: 400 });
    }

    // Check if promo code has expired
    if (foundPromoCode.expiresAt && foundPromoCode.expiresAt < new Date()) {
      return NextResponse.json({
        message: "Promokodin vaxtı bitib"
      }, { status: 400 });
    }

    // Check if user has already used this promo code
    if (foundPromoCode.usedBy.length > 0) {
      return NextResponse.json({
        message: "Bu promokodu artıq istifadə etmisiniz"
      }, { status: 400 });
    }

    // Check usage limit
    if (foundPromoCode.usageLimit && foundPromoCode.usedCount >= foundPromoCode.usageLimit) {
      return NextResponse.json({
        message: "Promokodin istifadə limiti bitib"
      }, { status: 400 });
    }

    // Apply the promo code - update user tier and create subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

    await prisma.$transaction(async (tx) => {
      // Update user tier
      await tx.user.update({
        where: { id: userId },
        data: { tier: foundPromoCode.tier }
      });

      // Create subscription with unique providerRef per user
      await tx.subscription.create({
        data: {
          userId,
          tier: foundPromoCode.tier,
          status: 'active',
          provider: 'promo_code',
          providerRef: `promo_${foundPromoCode.code}_${userId}_${Date.now()}`, // Make it unique per user
          expiresAt
        }
      });

      // Record promo code usage
      await tx.promoCodeUsage.create({
        data: {
          userId,
          promoCodeId: foundPromoCode.id
        }
      });

      // Update promo code usage count
      await tx.promoCode.update({
        where: { id: foundPromoCode.id },
        data: { usedCount: { increment: 1 } }
      });
    });

    return NextResponse.json({
      message: `Promokod uğurla tətbiq edildi! ${foundPromoCode.tier} paketiniz aktivləşdirildi.`,
      tier: foundPromoCode.tier,
      success: true
    });

  } catch (error) {
    console.error('Promo code error:', error);
    return NextResponse.json({
      message: "Promokod tətbiq edilərkən xəta baş verdi"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
