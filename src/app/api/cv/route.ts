import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cv - Bütün CV-ləri əldə et
export async function GET(request: NextRequest) {
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

    return NextResponse.json({ cvs });

  } catch (error) {
    console.error('CVs fetch error:', error);
    return NextResponse.json(
      { error: 'CV-lər yüklənərkən xəta baş verdi' },
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
