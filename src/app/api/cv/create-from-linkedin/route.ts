import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ScrapingDog API configuration
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
  languages?: string[];
}

// Scrape LinkedIn profile using authenticated user's username
async function scrapeLinkedInProfile(linkedinId: string): Promise<LinkedInProfile | null> {
  try {
    console.log(`🔍 LinkedIn profilini scraping edirik: ${linkedinId}`);

    const params = {
      api_key: SCRAPINGDOG_CONFIG.api_key,
      type: 'profile',
      linkId: linkedinId,
      premium: SCRAPINGDOG_CONFIG.premium,
    };

    const response = await axios.get(SCRAPINGDOG_CONFIG.url, {
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'CVERA-LinkedIn-Scraper/1.0'
      }
    });

    if (response.status !== 200) {
      console.error(`❌ ScrapingDog API xətası: Status ${response.status}`);
      return null;
    }

    let data = response.data;

    // Handle array response format from ScrapingDog
    if (Array.isArray(response.data) && response.data.length > 0) {
      data = response.data[0];
    } else if (response.data['0']) {
      data = response.data['0'];
    }

    // Generate skills using AI if no skills found directly
    const skills = await generateSkillsWithAI(data);

    // Transform to our format
    const profile: LinkedInProfile = {
      name: data.fullName || data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
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
      skills: skills,
      languages: Array.isArray(data.languages) ? data.languages : []
    };

    return profile;
  } catch (error) {
    console.error('💥 LinkedIn scraping xətası:', error);
    return null;
  }
}

// Generate skills using Gemini AI
async function generateSkillsWithAI(profileData: any): Promise<string[]> {
  try {
    let profileText = '';

    if (profileData.fullName || profileData.name) {
      profileText += `Ad: ${profileData.fullName || profileData.name}\n`;
    }
    if (profileData.headline) {
      profileText += `Başlıq: ${profileData.headline}\n`;
    }
    if (profileData.about) {
      profileText += `Haqqında: ${profileData.about}\n`;
    }

    const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
LinkedIn profil məlumatlarına əsasən bu şəxsin əsas professional skills/bacarıqlarını müəyyən et. 

Profil məlumatları:
${profileText}

Qaydalar:
1. Yalnız 5-10 arası skill seç
2. Technical və professional bacarıqları prioritet ver
3. JSON array formatında cavab ver
4. Real və praktik skills olsun

Nümunə: ["JavaScript", "React", "Project Management", "SQL", "Leadership"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let aiSkills: string[] = [];
    try {
      if (text.includes('[') && text.includes(']')) {
        const jsonMatch = text.match(/\[.*?\]/);
        if (jsonMatch) {
          aiSkills = JSON.parse(jsonMatch[0]);
        }
      }

      aiSkills = aiSkills
        .filter(skill => skill && typeof skill === 'string' && skill.length > 2)
        .slice(0, 10);

      return aiSkills;
    } catch (parseError) {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 LinkedIn CV creation API çağırıldı');

    // Get authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'LinkedIn ilə giriş tələb olunur. Əvvəlcə LinkedIn hesabınızla daxil olun.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Keçərsiz authentication token. Yenidən daxil olun.' },
        { status: 401 }
      );
    }

    // Get user and verify LinkedIn login
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        loginMethod: true,
        linkedinId: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'İstifadəçi tapılmadı.' },
        { status: 404 }
      );
    }

    // Check if user logged in via LinkedIn
    if (user.loginMethod !== 'linkedin') {
      return NextResponse.json(
        { error: 'Bu xüsusiyyət yalnız LinkedIn ilə daxil olan istifadəçilər üçün mövcuddur.' },
        { status: 403 }
      );
    }

    // Use linkedinId as fallback if linkedinUsername is not available
    const linkedinIdentifier = user.linkedinId;
    if (!linkedinIdentifier) {
      return NextResponse.json(
        { error: 'LinkedIn identifikatorunuz tapılmadı. Yenidən LinkedIn ilə daxil olun.' },
        { status: 400 }
      );
    }

    console.log(`✅ LinkedIn istifadəçi: ${user.name} (ID: ${user.linkedinId})`);

    // Use the LinkedIn ID for scraping (this should work with ScrapingDog API)
    const profile = await scrapeLinkedInProfile(linkedinIdentifier);

    if (!profile) {
      return NextResponse.json(
        { error: 'LinkedIn profilinizi əldə etmək mümkün olmadı. Yenidən cəhd edin.' },
        { status: 500 }
      );
    }

    // Create CV data structure
    const cvData = {
      personalInfo: {
        fullName: profile.name || user.name || '',
        email: user.email || '',
        phone: '',
        location: profile.location || '',
        linkedin: user.linkedinId ? `https://linkedin.com/in/${user.linkedinId}` : '',
        website: ''
      },
      professionalSummary: profile.summary || profile.headline || '',
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      languages: profile.languages || [],
      projects: [],
      certifications: [],
      awards: []
    };

    // Save CV to database
    const cv = await prisma.cV.create({
      data: {
        userId: user.id,
        title: `${profile.name || user.name} - LinkedIn CV`,
        cv_data: cvData,
        templateId: 'professional' // Default template
      }
    });

    console.log('✅ LinkedIn CV uğurla yaradıldı');

    return NextResponse.json({
      success: true,
      message: 'LinkedIn məlumatlarınız əsasında CV uğurla yaradıldı',
      cv: {
        id: cv.id,
        title: cv.title,
        data: cvData
      },
      user: {
        name: user.name,
        linkedinId: user.linkedinId // Use linkedinId instead of linkedinUsername
      }
    });

  } catch (error) {
    console.error('💥 LinkedIn CV creation error:', error);
    return NextResponse.json(
      { error: 'Daxili server xətası' },
      { status: 500 }
    );
  }
}
