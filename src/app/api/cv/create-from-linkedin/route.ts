import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
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

    const { profileData } = await request.json();

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profil məlumatları tələb olunur' },
        { status: 400 }
      );
    }

    console.log('🔄 Creating CV from LinkedIn profile data...');

    // Create new CV with LinkedIn data
    const cv = await prisma.cV.create({
      data: {
        userId: decoded.userId,
        title: `${profileData.profile?.name || 'LinkedIn Import'} - CV`,
        cv_data: {
          personalInfo: {
            name: profileData.profile?.name || '',
            email: '', // Will be filled in editor
            phone: '', // Will be filled in editor
            location: profileData.profile?.location || '',
            linkedin: '', // Will be filled in editor
            summary: profileData.profile?.summary || profileData.profile?.headline || ''
          },
          experience: profileData.profile?.experience || [],
          education: profileData.profile?.education || [],
          skills: profileData.profile?.skills || [],
          languages: [],
          certifications: [],
          projects: [],
          references: []
        },
        templateId: 'classic' // Default template
      }
    });

    console.log('✅ CV created successfully with ID:', cv.id);

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      message: 'CV uğurla yaradıldı və LinkedIn məlumatları import edildi'
    });

  } catch (error) {
    console.error('❌ CV yaratma xətası:', error);

    return NextResponse.json(
      {
        error: 'CV yaradılarkən xəta baş verdi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
