import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 LinkedIn import API çağırıldı');

    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded?.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get LinkedIn URL from request
    const { linkedinUrl } = await request.json();
    if (!linkedinUrl?.trim()) {
      return NextResponse.json(
        { error: 'LinkedIn URL tələb olunur' },
        { status: 400 }
      );
    }

    // Extract LinkedIn username from URL
    const extractLinkedInUsername = (url: string): string => {
      // Remove trailing slash and extract username
      const cleanUrl = url.replace(/\/$/, '');
      const match = cleanUrl.match(/\/in\/([^\/]+)/);
      return match ? match[1] : url;
    };

    const linkedinUsername = extractLinkedInUsername(linkedinUrl.trim());

    console.log('📝 LinkedIn username:', linkedinUsername);

    // Call Scrapingdog API
    const api_key = '6882894b855f5678d36484c8';
    const scrapingdogUrl = 'https://api.scrapingdog.com/linkedin';

    const params = {
      api_key: api_key,
      type: 'profile',
      linkId: linkedinUsername,
      premium: 'false',
    };

    console.log('📡 Scrapingdog API çağırılır...');

    const apiResponse = await axios.get(scrapingdogUrl, {
      params: params,
      timeout: 30000 // 30 second timeout
    });

    if (apiResponse.status !== 200) {
      throw new Error(`API xətası: ${apiResponse.status}`);
    }

    const linkedinData = apiResponse.data;
    console.log('✅ LinkedIn məlumatları alındı');

    // Create CV from LinkedIn data
    const cvData = {
      userId: decoded.userId,
      title: `${linkedinData.name || 'LinkedIn İmport'} - CV`,
      personalInfo: {
        firstName: linkedinData.name?.split(' ')[0] || '',
        lastName: linkedinData.name?.split(' ').slice(1).join(' ') || '',
        email: linkedinData.email || '',
        phone: linkedinData.phone || '',
        location: linkedinData.location || '',
        profilePicture: linkedinData.profilePicture || '',
        summary: linkedinData.summary || linkedinData.headline || ''
      },
      experience: (linkedinData.experiences || []).map((exp: any) => ({
        company: exp.company || '',
        position: exp.title || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || 'Hazırda',
        description: exp.description || '',
        location: exp.location || ''
      })),
      education: (linkedinData.education || []).map((edu: any) => ({
        institution: edu.school || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        description: edu.description || ''
      })),
      skills: (linkedinData.skills || []).map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name || '',
        level: 'Intermediate'
      })),
      languages: [
        { name: 'Azərbaycan dili', level: 'Ana dili' }
      ],
      template: 'modern'
    };

    // Save CV to database
    const newCV = await prisma.cV.create({
      data: {
        userId: decoded.userId,
        title: cvData.title,
        cv_data: cvData,
        templateId: 'modern'
      }
    });

    console.log('💾 CV yaradıldı:', newCV.id);

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profili uğurla import edildi və CV yaradıldı',
      cvId: newCV.id,
      profileData: {
        name: linkedinData.name,
        headline: linkedinData.headline,
        location: linkedinData.location,
        experienceCount: linkedinData.experiences?.length || 0,
        educationCount: linkedinData.education?.length || 0,
        skillsCount: linkedinData.skills?.length || 0
      }
    });

  } catch (error: any) {
    console.error('❌ LinkedIn import xətası:', error);

    let errorMessage = 'LinkedIn import zamanı xəta baş verdi';

    if (error.response?.status === 429) {
      errorMessage = 'API limit aşıldı. Zəhmət olmasa bir az sonra yenidən cəhd edin';
    } else if (error.response?.status === 404) {
      errorMessage = 'LinkedIn profili tapılmadı. URL-i yoxlayın';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Sorğu vaxtı bitdi. Yenidən cəhd edin';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
