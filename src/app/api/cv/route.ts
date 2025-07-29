import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Force fresh database connection
    await prisma.$connect();

    const cvs = await prisma.cV.findMany({
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
    return NextResponse.json(
      {
        error: 'CV-lər yüklənərkən xəta baş verdi',
        details: error instanceof Error ? error.message : 'Naməlum xəta'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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

    return NextResponse.json({
      success: true,
      cv: cv,
      message: 'CV uğurla yaradıldı'
    });

  } catch (error) {
    console.error('CV creation error:', error);
    return NextResponse.json(
      { error: 'CV yaradılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
