import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

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

interface ScrapingDogResponse {
  name?: string;
  headline?: string;
  about?: string;
  location?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
  [key: string]: any;
}

// ScrapingDog API configuration
const SCRAPINGDOG_CONFIG = {
  api_key: '6882894b855f5678d36484c8',
  url: 'https://api.scrapingdog.com/linkedin',
  premium: 'false'
};

// Get ScrapingDog API configuration
async function getScrapingDogConfig() {
  return {
    apiKey: SCRAPINGDOG_CONFIG.api_key,
    baseUrl: SCRAPINGDOG_CONFIG.url,
    premium: SCRAPINGDOG_CONFIG.premium
  };
}

// Extract LinkedIn ID from various URL formats
function extractLinkedInId(input: string): string | null {
  if (!input) return null;

  // Clean the input
  const cleanInput = input.trim();

  // If it's already just a username/ID (no URL), return it
  if (!cleanInput.includes('/') && !cleanInput.includes('linkedin.com')) {
    return cleanInput;
  }

  // Handle various LinkedIn URL formats
  const patterns = [
    /linkedin\.com\/in\/([^\/\?&#]+)/i,
    /linkedin\.com\/pub\/([^\/\?&#]+)/i,
    /linkedin\.com\/profile\/view\?id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Scrape LinkedIn profile using ScrapingDog
async function scrapeLinkedInProfile(linkedinId: string): Promise<LinkedInProfile | null> {
  try {
    const config = await getScrapingDogConfig();

    console.log(`🔍 LinkedIn profilini scraping edirik: ${linkedinId}`);

    const params = {
      api_key: config.apiKey,
      type: 'profile',
      linkId: linkedinId,
      premium: config.premium,
    };

    const response = await axios.get(config.baseUrl, {
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

    const data: ScrapingDogResponse = response.data;
    console.log('✅ ScrapingDog cavabı alındı:', Object.keys(data));

    // Transform ScrapingDog response to our format
    const profile: LinkedInProfile = {
      name: data.name || '',
      headline: data.headline || '',
      summary: data.about || '',
      location: data.location || '',
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
      skills: Array.isArray(data.skills) ? data.skills : [],
      languages: Array.isArray(data.languages) ? data.languages : []
    };

    return profile;
  } catch (error) {
    console.error('💥 LinkedIn scraping xətası:', error);
    return null;
  }
}

// Save import session to database
async function saveImportSession(userId: string, linkedinId: string, success: boolean, profileData?: any) {
  try {
    await prisma.importSession.create({
      data: {
        userId,
        type: success ? 'linkedin_success' : 'linkedin_failed',
        data: JSON.stringify({
          platform: 'linkedin',
          profileId: linkedinId,
          success,
          profileData: profileData || {},
          timestamp: new Date().toISOString()
        }),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('💥 Import session saxlama xətası:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 LinkedIn import API çağırıldı');

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { linkedinUrl } = body;

    if (!linkedinUrl) {
      return NextResponse.json({
        error: 'LinkedIn URL tələb olunur'
      }, { status: 400 });
    }

    // Extract LinkedIn ID from URL
    const linkedinId = extractLinkedInId(linkedinUrl);
    if (!linkedinId) {
      return NextResponse.json({
        error: 'Etibarsız LinkedIn URL formatı'
      }, { status: 400 });
    }

    console.log(`👤 İstifadəçi: ${payload.userId}, LinkedIn ID: ${linkedinId}`);

    // Check rate limiting (optional - can be implemented later)
    // await checkRateLimit(payload.userId);

    // Scrape LinkedIn profile
    const profile = await scrapeLinkedInProfile(linkedinId);

    if (!profile) {
      await saveImportSession(payload.userId, linkedinId, false);
      return NextResponse.json({
        error: 'LinkedIn profili əldə edilə bilmədi. Profilin ictimai olduğundan əmin olun.'
      }, { status: 400 });
    }

    // Save successful import session
    await saveImportSession(payload.userId, linkedinId, true, profile);

    console.log('✅ LinkedIn profili uğurla əldə edildi');

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'LinkedIn profili uğurla idxal edildi'
    });

  } catch (error) {
    console.error('💥 LinkedIn import API xətası:', error);

    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json({
      error: 'Daxili server xətası',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
