import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { checkCVCreationLimit, incrementCVUsage, getLimitMessage } from '@/lib/cvLimits';

// Use a singleton pattern for Prisma client to avoid connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Retry function for database operations
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Database operation failed (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// GET /api/cv - Bütün CV-ləri əldə et
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Dashboard API: CV sorğusu başladı');

    const authHeader = request.headers.get('authorization');
    console.log('🔍 Dashboard API: Authorization header:', authHeader ? 'Mövcuddur' : 'Yoxdur');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Dashboard API: Authorization header yoxdur və ya səhvdir');
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    console.log('🔍 Dashboard API: JWT decode nəticəsi:', decoded ? `User ID: ${decoded.userId}` : 'Decode xətası');

    if (!decoded) {
      console.log('❌ Dashboard API: JWT token etibarsız');
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    console.log(`🔍 Dashboard API: ${decoded.userId} user ID-si üçün CV-lər axtarılır...`);

    // Use retry logic for database query
    const cvs = await withRetry(async () => {
      return await prisma.cV.findMany({
        where: { userId: decoded.userId },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          templateId: true
        }
      });
    });

    console.log(`✅ Dashboard API: ${cvs.length} CV tapıldı`);
    console.log('📋 CV-lər:', cvs.slice(0, 3).map(cv => ({ id: cv.id, title: cv.title })));

    // Ensure proper response format
    const response = {
      success: true,
      cvs: cvs,
      count: cvs.length
    };

    console.log('📤 Dashboard API: Response hazırlandı:', { count: response.count });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Dashboard API xətası:', error);

    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('P1001')) {
      console.error('🔗 Database connection error - retrying...');
      return NextResponse.json(
        {
          error: 'Verilənlər bazasına qoşulma problemi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
          code: 'DB_CONNECTION_ERROR'
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        error: 'CV-lər yüklənərkən xəta baş verdi',
        details: error instanceof Error ? error.message : 'Naməlum xəta'
      },
      { status: 500 }
    );
  }
}

// POST /api/cv - Yeni CV yarat
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    // Check CV creation limits before proceeding
    const limits = await checkCVCreationLimit(decoded.userId);

    if (!limits.canCreate) {
      return NextResponse.json(
        {
          error: 'CV yaratma limiti dolmuşdur',
          message: getLimitMessage(limits),
          limits: {
            currentCount: limits.currentCount,
            limit: limits.limit,
            tierName: limits.tierName,
            resetTime: limits.resetTime
          }
        },
        { status: 403 }
      );
    }

    const { title, cv_data, templateId } = await request.json();

    if (!title || !cv_data) {
      return NextResponse.json(
        { error: 'CV başlığı və məlumatları tələb olunur' },
        { status: 400 }
      );
    }

    const cv = await prisma.cV.create({
      data: {
        userId: decoded.userId,
        title: title,
        cv_data: cv_data,
        templateId: templateId || 'professional'
      }
    });

    // Increment usage counter after successful CV creation
    await incrementCVUsage(decoded.userId);

    console.log('✅ CV yaradıldı:', cv.id);

    // Get updated limits for response
    const updatedLimits = await checkCVCreationLimit(decoded.userId);

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      cv: cv,
      message: 'CV uğurla yaradıldı',
      limits: {
        currentCount: updatedLimits.currentCount,
        limit: updatedLimits.limit,
        tierName: updatedLimits.tierName,
        canCreateMore: updatedLimits.canCreate,
        limitMessage: getLimitMessage(updatedLimits)
      }
    });

  } catch (error) {
    console.error('CV creation error:', error);
    return NextResponse.json(
      { error: 'CV yaradılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
