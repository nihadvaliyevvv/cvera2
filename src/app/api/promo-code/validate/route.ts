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

    console.log(`🔍 Validating promo code: "${promoCode}" for user: ${userId}`);

    // Validate promo code input
    if (!promoCode || typeof promoCode !== 'string') {
      return NextResponse.json({
        success: false,
        message: "Promokod daxil edin"
      }, { status: 400 });
    }

    // Find promo code (try exact case first, then uppercase)
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
      return NextResponse.json({
        success: false,
        message: "Promokod tapılmadı"
      }, { status: 404 });
    }

    // Check if promo code is active
    if (!foundPromoCode.isActive) {
      return NextResponse.json({
        success: false,
        message: "Bu promokod artıq aktiv deyil"
      }, { status: 400 });
    }

    // Check if user already used this promo code
    if (foundPromoCode.usedBy.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Bu promokodu artıq istifadə etmisiniz"
      }, { status: 400 });
    }

    // Check usage limit
    if (foundPromoCode.usageLimit && foundPromoCode.usedCount >= foundPromoCode.usageLimit) {
      return NextResponse.json({
        success: false,
        message: "Bu promokoddun istifadə limiti bitib"
      }, { status: 400 });
    }

    // Check expiration date
    if (foundPromoCode.expiresAt && foundPromoCode.expiresAt < new Date()) {
      return NextResponse.json({
        success: false,
        message: "Bu promokoddun vaxtı keçib"
      }, { status: 400 });
    }

    // Calculate subscription duration for premium tiers
    let subscriptionDuration = null;
    const premiumTiers = ['Medium', 'Pro', 'Populyar', 'Premium', 'Business'];

    if (premiumTiers.includes(foundPromoCode.tier)) {
      subscriptionDuration = "1 ay";
    }

    console.log(`✅ Valid promo code: ${foundPromoCode.code} - ${foundPromoCode.tier}`);

    return NextResponse.json({
      success: true,
      message: "Promokod keçərlidir",
      promoCode: {
        code: foundPromoCode.code,
        tier: foundPromoCode.tier,
        description: foundPromoCode.description,
        subscriptionDuration,
        usageRemaining: foundPromoCode.usageLimit ? foundPromoCode.usageLimit - foundPromoCode.usedCount : "Limitsiz",
        expiresAt: foundPromoCode.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Promo code validation error:', error);

    return NextResponse.json({
      success: false,
      message: "Server xətası"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
