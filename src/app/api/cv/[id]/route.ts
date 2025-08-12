import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cv/[id] - Spesifik CV-ni əldə et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: decoded.userId
      }
    });

    if (!cv) {
      return NextResponse.json(
        { error: 'CV tapılmadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cv });

  } catch (error) {
    console.error('CV fetch error:', error);
    return NextResponse.json(
      { error: 'CV yüklənərkən xəta baş verdi' },
      { status: 500 }
    );
  }
}

// PUT /api/cv/[id] - CV-ni yenilə
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    const { title, cv_data, templateId } = await request.json();

    // CV-nin mövcudluğunu və sahibliyini yoxla
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: decoded.userId
      }
    });

    if (!existingCV) {
      return NextResponse.json(
        { error: 'CV tapılmadı və ya sizə məxsus deyil' },
        { status: 404 }
      );
    }

    const updatedCV = await prisma.cV.update({
      where: { id: id },
      data: {
        title: title || existingCV.title,
        cv_data: cv_data ? {
          // Merge existing CV data with new data to preserve additional sections
          ...existingCV.cv_data as any,
          ...cv_data,
          // Specially handle additional sections to ensure they're preserved
          additionalSections: {
            ...(existingCV.cv_data as any)?.additionalSections,
            ...cv_data.additionalSections
          }
        } : existingCV.cv_data,
        templateId: templateId || existingCV.templateId,
        updatedAt: new Date()
      }
    });

    console.log('✅ CV updated successfully:', {
      cvId: id,
      title: updatedCV.title,
      hasAdditionalSections: !!(updatedCV.cv_data as any)?.additionalSections && Object.keys((updatedCV.cv_data as any).additionalSections).length > 0
    });

    return NextResponse.json({
      success: true,
      cv: updatedCV,
      message: 'CV uğurla yeniləndi'
    });

  } catch (error) {
    console.error('CV update error:', error);
    return NextResponse.json(
      { error: 'CV yenilənərkən xəta baş verdi' },
      { status: 500 }
    );
  }
}

// DELETE /api/cv/[id] - CV-ni sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    // CV-nin mövcudluğunu və sahibliyini yoxla
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: decoded.userId
      }
    });

    if (!existingCV) {
      return NextResponse.json(
        { error: 'CV tapılmadı və ya sizə məxsus deyil' },
        { status: 404 }
      );
    }

    await prisma.cV.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'CV uğurla silindi'
    });

  } catch (error) {
    console.error('CV delete error:', error);
    return NextResponse.json(
      { error: 'CV silinərkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
