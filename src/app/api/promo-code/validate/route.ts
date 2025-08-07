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

    if (!promoCode || typeof promoCode !== 'string') {
      return NextResponse.json({
        valid: false,
        message: "Promokod daxil edin"
      }, { status: 400 });
    }

    console.log(`🔍 Validating promo code: "${promoCode}" for user: ${userId}`);

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
        valid: false,
        message: "Promokod tapılmadı"
      });
    }

    console.log(`✅ Found promo code: ${foundPromoCode.code} - ${foundPromoCode.tier}`);

    if (!foundPromoCode.isActive) {
      return NextResponse.json({
        valid: false,
        message: "Promokod aktiv deyil"
      });
    }

    if (foundPromoCode.expiresAt && foundPromoCode.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        message: "Promokodin vaxtı bitib"
      });
    }

    if (foundPromoCode.usedBy.length > 0) {
      return NextResponse.json({
        valid: false,
        message: "Bu promokodu artıq istifadə etmisiniz"
      });
    }

    if (foundPromoCode.usageLimit && foundPromoCode.usedCount >= foundPromoCode.usageLimit) {
      return NextResponse.json({
        valid: false,
        message: "Promokodin istifadə limiti bitib"
      });
    }

    console.log(`✅ Promo code validation successful: ${foundPromoCode.code}`);

    return NextResponse.json({
      valid: true,
      tier: foundPromoCode.tier,
      description: foundPromoCode.description,
      message: `Bu promokod sizə ${foundPromoCode.tier} paketini verəcək`
    });

  } catch (error) {
    console.error('Promo code validation error:', error);
    return NextResponse.json({
      valid: false,
      message: "Promokod yoxlanılarkən xəta baş verdi"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
