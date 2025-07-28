import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// ScrapingDog API configuration (same as your instructions)
const SCRAPINGDOG_CONFIG = {
  api_key: '6882894b855f5678d36484c8',
  url: 'https://api.scrapingdog.com/linkedin',
  premium: 'false'
};

interface LinkedInProfile {
  name?: string;
  headline?: string;
  summary?: string;
  location?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills?: string[];
}

// Auto-import LinkedIn profile for users who logged in via LinkedIn
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        loginMethod: true,
        linkedinUsername: true,
        linkedinId: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'İstifadəçi tapılmadı' },
        { status: 404 }
      );
    }

    // Check if user logged in via LinkedIn
    if (user.loginMethod !== 'linkedin') {
      return NextResponse.json(
        {
          error: 'Bu funksiya yalnız LinkedIn ilə giriş edən istifadəçilər üçündür',
          requiresLinkedInLogin: true
        },
        { status: 403 }
      );
    }

    // Get LinkedIn username/ID from user's stored data
    const linkedinUsername = user.linkedinUsername || user.linkedinId;
    if (!linkedinUsername) {
      return NextResponse.json(
        {
          error: 'LinkedIn istifadəçi adı tapılmadı. Zəhmət olmasa LinkedIn ilə yenidən giriş edin.',
          missingLinkedInData: true
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Auto-import LinkedIn profili: ${linkedinUsername} (User: ${user.email})`);

    // Scrape LinkedIn profile using stored username
    const params = {
      api_key: SCRAPINGDOG_CONFIG.api_key,
      type: 'profile',
      linkId: linkedinUsername,
      premium: SCRAPINGDOG_CONFIG.premium,
    };

    const response = await axios.get(SCRAPINGDOG_CONFIG.url, {
      params: params,
      timeout: 30000,
      headers: {
        'User-Agent': 'CVERA-LinkedIn-Auto-Import/1.0'
      }
    });

    if (response.status !== 200) {
      console.error(`❌ ScrapingDog API xətası: Status ${response.status}`);
      return NextResponse.json(
        { error: `LinkedIn profil məlumatları əldə edilə bilmədi: Status ${response.status}` },
        { status: response.status }
      );
    }

    let data = response.data;

    // Handle different response formats from ScrapingDog
    if (Array.isArray(response.data) && response.data.length > 0) {
      data = response.data[0];
    } else if (response.data['0']) {
      data = response.data['0'];
    }

    console.log('✅ LinkedIn profil məlumatları alındı:', data.name || data.fullName || 'Unknown');

    // Transform the data to standardized format
    const profile: LinkedInProfile = {
      name: data.fullName || data.name || data.first_name + ' ' + data.last_name || '',
      headline: data.headline || data.sub_title || '',
      summary: data.about || data.summary || '',
      location: data.location || data.geo_location || '',
      experience: Array.isArray(data.experience) ? data.experience.map((exp: any) => ({
        title: exp.title || exp.position || '',
        company: exp.company || exp.company_name || '',
        duration: exp.duration || exp.date_range || '',
        description: exp.description || exp.summary || ''
      })) : [],
      education: Array.isArray(data.education) ? data.education.map((edu: any) => ({
        school: edu.school || edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || edu.field_of_study || '',
        duration: edu.duration || edu.date_range || ''
      })) : [],
      skills: extractSkills(data)
    };

    // Update user's profile data in database (optional - store import timestamp)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profil məlumatları uğurla import edildi',
      profile: profile,
      importedAt: new Date().toISOString(),
      source: 'linkedin_auto_import'
    });

  } catch (error) {
    console.error('❌ LinkedIn auto-import xətası:', error);

    let errorMessage = 'LinkedIn profil import zamanı xəta baş verdi';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Extract skills from various possible fields in the response
function extractSkills(data: any): string[] {
  const skills: string[] = [];

  // Try different possible skill field names
  const skillFields = [
    'skills', 'skillsArray', 'skill', 'endorsements',
    'competencies', 'technologies', 'expertise'
  ];

  for (const field of skillFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        skills.push(...data[field].map((skill: any) =>
          typeof skill === 'string' ? skill : skill.name || skill.title || String(skill)
        ));
      } else if (typeof data[field] === 'string') {
        skills.push(...data[field].split(',').map((s: string) => s.trim()));
      }
    }
  }

  // Remove duplicates and empty values
  return [...new Set(skills.filter(skill => skill && skill.length > 0))];
}

// GET method for checking if auto-import is available for the user
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        loginMethod: true,
        linkedinUsername: true,
        linkedinId: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'İstifadəçi tapılmadı' },
        { status: 404 }
      );
    }

    const canAutoImport = user.loginMethod === 'linkedin' &&
                         (user.linkedinUsername || user.linkedinId);

    return NextResponse.json({
      canAutoImport,
      loginMethod: user.loginMethod,
      hasLinkedInData: !!(user.linkedinUsername || user.linkedinId),
      message: canAutoImport
        ? 'LinkedIn auto-import mövcuddur'
        : 'LinkedIn auto-import üçün LinkedIn ilə giriş tələb olunur'
    });

  } catch (error) {
    console.error('❌ Auto-import check xətası:', error);
    return NextResponse.json(
      { error: 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
