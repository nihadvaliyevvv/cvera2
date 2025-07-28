import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Initialize Gemini AI
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

// Extract LinkedIn ID from various URL formats
function extractLinkedInId(input: string): string | null {
  if (!input) return null;

  // Clean the input
  const cleanInput = input.trim();

  // If it's already just a username/ID (no URL), return it
  if (!cleanInput.includes('/') && !cleanInput.includes('linkedin.com')) {
    return cleanInput;
  }

  // Handle various LinkedIn URL formats - improved regex to handle hyphens and special characters
  const patterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9\-_.]+)/i,
    /linkedin\.com\/pub\/([a-zA-Z0-9\-_.]+)/i,
    /linkedin\.com\/profile\/view\?id=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      // Remove trailing slash and clean the ID
      let extractedId = match[1].replace(/\/$/, '');
      // Remove any query parameters or fragments
      extractedId = extractedId.split('?')[0].split('#')[0];
      return extractedId;
    }
  }

  return null;
}

// Scrape LinkedIn profile using ScrapingDog
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

    let data: ScrapingDogResponse = response.data;

    // Handle array response format from ScrapingDog
    if (Array.isArray(response.data) && response.data.length > 0) {
      data = response.data[0];
      console.log('✅ Extracted profile data from array format');
    } else if (response.data['0']) {
      // Handle object with "0" key format
      data = response.data['0'];
      console.log('✅ Extracted profile data from "0" key format');
    }

    console.log('✅ ScrapingDog cavabı alındı:', Object.keys(data));

    // Debug: Skills məlumatlarını detallı yoxla
    console.log('🔍 Skills debugging:');
    console.log('  - data.skills:', data.skills);
    console.log('  - data.skillsArray:', data.skillsArray);
    console.log('  - data.skill:', data.skill);
    console.log('  - data.endorsements:', data.endorsements);
    console.log('  - data.competencies:', data.competencies);
    console.log('  - All response keys:', Object.keys(data));

    // Transform ScrapingDog response to our format
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
      // Enhanced skills extraction - multiple possible field names
      skills: await extractSkillsFromResponse(data),
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

// Generate skills using Gemini AI if no skills found
async function generateSkillsWithAI(profileData: any): Promise<string[]> {
  try {
    console.log('🤖 Gemini AI ilə skills generate edilir...');

    // Prepare profile text for AI analysis
    let profileText = '';

    if (profileData.name) {
      profileText += `Ad: ${profileData.name}\n`;
    }

    if (profileData.headline) {
      profileText += `Başlıq: ${profileData.headline}\n`;
    }

    if (profileData.about) {
      profileText += `Haqqında: ${profileData.about}\n`;
    }

    if (profileData.experience && Array.isArray(profileData.experience)) {
      profileText += '\nİş təcrübəsi:\n';
      profileData.experience.forEach((exp: any, index: number) => {
        profileText += `${index + 1}. ${exp.title || exp.position} - ${exp.company} (${exp.duration || exp.date_range})\n`;
        if (exp.description) {
          profileText += `   ${exp.description}\n`;
        }
      });
    }

    if (profileData.education && Array.isArray(profileData.education)) {
      profileText += '\nTəhsil:\n';
      profileData.education.forEach((edu: any, index: number) => {
        profileText += `${index + 1}. ${edu.degree} - ${edu.school || edu.institution} (${edu.duration || edu.date_range})\n`;
      });
    }

    const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
LinkedIn profil məlumatlarına əsasən bu şəxsin əsas professional skills/bacarıqlarını müəyyən et. 

Profil məlumatları:
${profileText}

Qaydalar:
1. Yalnız 5-10 arası skill seç
2. Technical və professional bacarıqları prioritet ver
3. Profilin iş təcrübəsi və təhsilinə uyğun olsun
4. JSON array formatında cavab ver
5. Hər skill 1-3 kelimə olsun
6. Real və praktik skills olsun

Nümunə format: ["JavaScript", "React", "Node.js", "SQL", "Project Management"]

Skills array:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse AI response to extract skills array
    let aiSkills: string[] = [];
    try {
      // Try to parse as JSON
      if (text.includes('[') && text.includes(']')) {
        const jsonMatch = text.match(/\[.*?\]/);
        if (jsonMatch) {
          aiSkills = JSON.parse(jsonMatch[0]);
        }
      }

      // If JSON parsing fails, try to extract skills from text
      if (aiSkills.length === 0) {
        const skillMatches = text.match(/"([^"]+)"/g);
        if (skillMatches) {
          aiSkills = skillMatches.map(match => match.replace(/"/g, ''));
        }
      }

      // Filter and clean skills
      aiSkills = aiSkills
        .filter(skill => skill && typeof skill === 'string' && skill.length > 2 && skill.length < 30)
        .slice(0, 10); // Max 10 skills

      console.log(`✅ Gemini AI ${aiSkills.length} skills generate etdi:`, aiSkills);
      return aiSkills;

    } catch (parseError) {
      console.error('❌ AI response parse xətası:', parseError);
      return [];
    }

  } catch (error) {
    console.error('❌ Gemini AI skills generation xətası:', error);
    return [];
  }
}

// Enhanced skills extraction from ScrapingDog response with AI fallback
async function extractSkillsFromResponse(data: any): Promise<string[]> {
  console.log('🎯 Skills extraction başlayır...');

  // Try multiple possible field names for skills
  const possibleSkillsFields = [
    'skills',
    'skillsArray',
    'skill',
    'endorsements',
    'competencies',
    'technologies',
    'expertise'
  ];

  let extractedSkills: string[] = [];

  // Check each possible field
  for (const fieldName of possibleSkillsFields) {
    if (data[fieldName]) {
      console.log(`📋 ${fieldName} field tapıldı:`, data[fieldName]);

      if (Array.isArray(data[fieldName])) {
        // If it's an array of strings
        if (data[fieldName].every((item: any) => typeof item === 'string')) {
          extractedSkills = data[fieldName];
          break;
        }
        // If it's an array of objects with name property
        else if (data[fieldName].every((item: any) => typeof item === 'object' && item.name)) {
          extractedSkills = data[fieldName].map((item: any) => item.name);
          break;
        }
        // If it's an array of objects with skill property
        else if (data[fieldName].every((item: any) => typeof item === 'object' && item.skill)) {
          extractedSkills = data[fieldName].map((item: any) => item.skill);
          break;
        }
      }
      // If it's a string, split by comma or pipe
      else if (typeof data[fieldName] === 'string') {
        extractedSkills = data[fieldName].split(/[,|;]/).map((s: string) => s.trim()).filter(Boolean);
        break;
      }
    }
  }

  // If no skills found in dedicated fields, try to extract from other fields
  if (extractedSkills.length === 0) {
    console.log('🔍 Dedicated skills field tapılmadı, digər field-lərdən çıxarmağa çalışırıq...');

    // Try to extract from headline
    if (data.headline) {
      const headlineSkills = extractSkillsFromText(data.headline);
      extractedSkills = extractedSkills.concat(headlineSkills);
    }

    // Try to extract from about/summary
    if (data.about) {
      const aboutSkills = extractSkillsFromText(data.about);
      extractedSkills = extractedSkills.concat(aboutSkills);
    }

    // Try to extract from experience descriptions
    if (Array.isArray(data.experience)) {
      data.experience.forEach((exp: any) => {
        if (exp.description) {
          const expSkills = extractSkillsFromText(exp.description);
          extractedSkills = extractedSkills.concat(expSkills);
        }
      });
    }
  }

  // Remove duplicates and clean up
  let uniqueSkills = [...new Set(extractedSkills)]
    .filter(skill => skill && skill.length > 2 && skill.length < 50)
    .slice(0, 20); // Limit to 20 skills

  // If still no skills found, use AI to generate them
  if (uniqueSkills.length === 0) {
    console.log('🤖 Heç skills tapılmadı, Gemini AI ilə generate edilir...');
    const aiSkills = await generateSkillsWithAI(data);
    uniqueSkills = aiSkills;
  }

  console.log(`✅ ${uniqueSkills.length} skills əldə edildi:`, uniqueSkills);
  return uniqueSkills;
}

// Extract skills from text using common patterns
function extractSkillsFromText(text: string): string[] {
  if (!text) return [];

  // Common technical skills patterns
  const skillPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|React|Angular|Vue|Node\.js|PHP|C\+\+|C#|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(HTML|CSS|SCSS|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes)\b/gi,
    /\b(AWS|Azure|GCP|Git|Jenkins|CI\/CD|DevOps|Agile|Scrum|Kanban)\b/gi,
    /\b(Machine Learning|AI|Data Science|Analytics|Blockchain|IoT)\b/gi,
    /\b(Project Management|Leadership|Team Lead|Management|Strategy)\b/gi
  ];

  const foundSkills: string[] = [];

  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundSkills.push(...matches);
    }
  });

  return foundSkills;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 LinkedIn import API çağırıldı');

    // STRICT REQUIREMENT: User must be authenticated with LinkedIn
    let userId = '';
    let linkedinUsername = '';

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required. Please login with LinkedIn first.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token. Please login again.' },
        { status: 401 }
      );
    }

    userId = payload.userId;

    // Verify user exists and has LinkedIn login
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginMethod: true,
        linkedinUsername: true,
        linkedinId: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please login again.' },
        { status: 404 }
      );
    }

    // STRICT CHECK: User must have logged in with LinkedIn
    if (user.loginMethod !== 'linkedin' || !user.linkedinUsername) {
      return NextResponse.json(
        {
          error: 'LinkedIn login required. You must login with your LinkedIn account to import your profile.',
          requiresLinkedInLogin: true
        },
        { status: 403 }
      );
    }

    linkedinUsername = user.linkedinUsername;
    console.log(`✅ LinkedIn authenticated user: ${user.name} (${linkedinUsername})`);

    // Parse request body - linkedinUrl is now optional since we use authenticated user's username
    const body = await request.json();
    const { linkedinUrl } = body;

    let linkedinId = linkedinUsername; // Default to authenticated user's username

    // If a different LinkedIn URL is provided, validate it belongs to the same user
    if (linkedinUrl) {
      const extractedId = extractLinkedInId(linkedinUrl);
      if (!extractedId) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL format' },
          { status: 400 }
        );
      }

      // Security check: Only allow importing the authenticated user's own profile
      if (extractedId !== linkedinUsername) {
        return NextResponse.json(
          {
            error: 'You can only import your own LinkedIn profile. Please use your authenticated LinkedIn account.',
            authenticatedUsername: linkedinUsername,
            providedUsername: extractedId
          },
          { status: 403 }
        );
      }

      linkedinId = extractedId;
    }

    console.log(`📋 Importing LinkedIn profile for authenticated user: ${linkedinId}`);

    // Scrape LinkedIn profile using the authenticated user's username
    const profile = await scrapeLinkedInProfile(linkedinId);

    if (!profile) {
      await saveImportSession(userId, linkedinId, false);
      return NextResponse.json(
        { error: 'Failed to scrape LinkedIn profile. Please try again.' },
        { status: 500 }
      );
    }

    // Save successful import session
    await saveImportSession(userId, linkedinId, true, profile);

    console.log('✅ LinkedIn profile successfully imported for authenticated user');
    return NextResponse.json({
      success: true,
      profile: profile,
      message: 'LinkedIn profile imported successfully',
      authenticatedUser: {
        name: user.name,
        linkedinUsername: user.linkedinUsername
      }
    });

  } catch (error) {
    console.error('💥 LinkedIn import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
