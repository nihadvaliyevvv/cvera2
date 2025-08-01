import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "";

function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

// Extract LinkedIn username from URL
function extractLinkedInUsername(url: string): string | null {
  try {
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_.]+)/,
      /linkedin\.com\/pub\/([a-zA-Z0-9\-_.]+)/,
      /linkedin\.com\/profile\/view\?id=([a-zA-Z0-9\-_.]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

// Get active API keys from database
async function getActiveApiKeys() {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        service: 'linkedin'
      },
      orderBy: [
        { priority: 'asc' },
        { usageCount: 'asc' },
        { lastUsed: 'asc' }
      ]
    });

    console.log(`📊 Database-də aktiv API key-lər: ${apiKeys.length}`);
    return apiKeys;
  } catch (error) {
    console.error("💥 Database API key xətası:", error);
    return [];
  }
}

// Update API key usage statistics
async function updateApiKeyUsage(keyId: string, success: boolean, result?: string) {
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
        lastResult: result || (success ? "success" : "failed")
      }
    });
  } catch (error) {
    console.error("💥 API key usage update xətası:", error);
  }
}

// Real LinkedIn profile scraping using RapidAPI - NO MOCK DATA
async function scrapeLinkedInProfile(profileUrl: string): Promise<any> {
  const username = extractLinkedInUsername(profileUrl);
  if (!username) {
    throw new Error("LinkedIn URL-dən istifadəçi adı çıxarıla bilmədi");
  }

  console.log(`🔍 REAL LinkedIn profili çəkilir: ${username}`);
  console.log(`🌐 Profile URL: ${profileUrl}`);

  // Get API keys from database
  const apiKeys = await getActiveApiKeys();
  
  if (apiKeys.length === 0) {
    throw new Error("Aktiv LinkedIn API key tapılmadı. Admin panelindən API key əlavə edin.");
  }

  // Try each API key with different service configurations
  for (const apiKey of apiKeys) {
    console.log(`🔑 API Key sınaqdan keçirilir: ${apiKey.service} (ID: ${apiKey.id})`);

    // Different LinkedIn API services to try
    const apiServices = [
      {
        host: 'fresh-linkedin-profile-data.p.rapidapi.com',
        endpoints: [
          { path: '/get-profile', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/profile', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/scrape', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/get-linkedin-profile', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/profile', method: 'POST', bodyKey: 'url' },
          { path: '/linkedin', method: 'POST', bodyKey: 'url' }
        ]
      },
      {
        host: 'linkedin-profiles1.p.rapidapi.com',
        endpoints: [
          { path: '/profile', method: 'GET', urlParam: 'url' },
          { path: '/get-profile', method: 'GET', urlParam: 'linkedin_url' },
          { path: '/scrape', method: 'POST', bodyKey: 'linkedin_url' }
        ]
      },
      {
        host: 'linkedin-api8.p.rapidapi.com',
        endpoints: [
          { path: '/get-profile-data', method: 'POST', bodyKey: 'linkedin_url' },
          { path: '/profile-data', method: 'POST', bodyKey: 'url' }
        ]
      }
    ];

    // Try each service
    for (const service of apiServices) {
      console.log(`🏢 Service test edilir: ${service.host}`);
      
      for (const endpoint of service.endpoints) {
        console.log(`🔗 Endpoint: ${endpoint.method} ${service.host}${endpoint.path}`);
        
        try {
          let response;
          
          if (endpoint.method === 'GET' && endpoint.urlParam) {
            // GET request with URL parameter
            const url = `https://${service.host}${endpoint.path}?${endpoint.urlParam}=${encodeURIComponent(profileUrl)}`;
            response = await fetch(url, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': apiKey.apiKey,
                'X-RapidAPI-Host': service.host,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
          } else if (endpoint.method === 'POST' && endpoint.bodyKey) {
            // POST request with JSON body
            const body = { [endpoint.bodyKey]: profileUrl };
            response = await fetch(`https://${service.host}${endpoint.path}`, {
              method: 'POST',
              headers: {
                'X-RapidAPI-Key': apiKey.apiKey,
                'X-RapidAPI-Host': service.host,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: JSON.stringify(body)
            });
          } else {
            continue; // Skip unknown configurations
          }

          console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Error Response: ${errorText.substring(0, 200)}`);
            
            // Update failed usage
            await updateApiKeyUsage(apiKey.id, false, `HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            
            // If rate limited, try next key
            if (response.status === 429) {
              console.log(`⏭️  Rate limit - növbəti key-ə keçid`);
              break; // Break from endpoints, try next service/key
            }
            continue;
          }

          const responseText = await response.text();
          console.log(`📄 Response Body (first 500 chars): ${responseText.substring(0, 500)}...`);

          // Try to parse JSON
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.log(`💥 JSON parse xətası: ${parseError}`);
            continue;
          }

          // Check if response contains valid profile data
          if (data && isValidLinkedInData(data)) {
            console.log(`✅ REAL LinkedIn data tapıldı!`);
            console.log(`📊 Data structure:`, Object.keys(data));
            
            // Update successful usage
            await updateApiKeyUsage(apiKey.id, true, `Success from ${service.host}${endpoint.path}`);
            
            // Transform and return real data
            return transformLinkedInData(data, profileUrl, username);
          } else {
            console.log(`⚠️  Response mövcuddur amma LinkedIn data deyil`);
            console.log(`📋 Response keys:`, Object.keys(data || {}));
          }

        } catch (error: any) {
          console.error(`❌ ${service.host}${endpoint.path} xətası:`, error.message);
          continue;
        }
      }
    }
  }

  // If we get here, all APIs failed
  throw new Error("Bütün LinkedIn API servislər uğursuz oldu. Real məlumat əldə edilə bilmədi.");
}

// Check if response contains valid LinkedIn profile data
function isValidLinkedInData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check for common LinkedIn data fields
  const hasProfileData = !!(
    data.name || data.full_name || data.firstName || data.lastName ||
    data.headline || data.title || data.summary || data.about ||
    data.experience || data.experiences || data.work_history ||
    data.education || data.schools || data.profile || data.data
  );

  const hasValidStructure = !!(
    data.success !== false && // Not an error response
    !data.error && // No error field
    !data.message?.includes('does not exist') && // Not "endpoint does not exist"
    data !== null // Not null
  );

  return hasProfileData && hasValidStructure;
}

// Transform real LinkedIn data to our format
function transformLinkedInData(apiData: any, profileUrl: string, username: string): any {
  console.log(`🔄 Real LinkedIn data transform edilir...`);
  
  // Handle different API response structures
  const profile = apiData.data || apiData.profile || apiData;
  
  // Extract personal information
  const personalInfo = {
    name: profile.full_name || profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 
          profile.displayName || formatNameFromUsername(username),
    email: profile.email || profile.contact?.email || "",
    phone: profile.phone || profile.contact?.phone || "",
    linkedin: profileUrl,
    summary: profile.summary || profile.about || profile.description || "",
    website: profile.website || profile.websiteUrl || "",
    headline: profile.headline || profile.title || profile.jobTitle || ""
  };

  // Extract experience
  const experience = [];
  const experiences = profile.experiences || profile.experience || profile.work_history || profile.positions || [];
  
  for (const exp of experiences) {
    if (exp && typeof exp === 'object') {
      experience.push({
        company: exp.company || exp.company_name || exp.companyName || "",
        position: exp.title || exp.position || exp.role || exp.jobTitle || "",
        startDate: exp.start_date || exp.startDate || exp.starts_at || "",
        endDate: exp.end_date || exp.endDate || exp.ends_at || "",
        current: exp.is_current || exp.isCurrent || !exp.end_date,
        description: exp.description || exp.summary || "",
        jobType: exp.employment_type || exp.employmentType || "Full-time",
        skills: Array.isArray(exp.skills) ? exp.skills.join(", ") : ""
      });
    }
  }

  // Extract education
  const education = [];
  const educations = profile.education || profile.schools || profile.educations || [];
  
  for (const edu of educations) {
    if (edu && typeof edu === 'object') {
      education.push({
        institution: edu.school || edu.institution || edu.universityName || "",
        degree: edu.degree || edu.degree_name || edu.degreeName || "",
        field: edu.field_of_study || edu.field || edu.fieldOfStudy || "",
        startDate: edu.start_date || edu.startDate || edu.starts_at || "",
        endDate: edu.end_date || edu.endDate || edu.ends_at || "",
        current: !edu.end_date,
        description: edu.description || "",
        activities: edu.activities || "",
        grade: edu.grade || ""
      });
    }
  }

  // Extract skills
  const skills = [];
  const skillsData = profile.skills || profile.skill_set || [];
  
  for (const skill of skillsData) {
    if (typeof skill === 'string') {
      skills.push({ name: skill, level: "Intermediate" });
    } else if (skill && typeof skill === 'object') {
      skills.push({
        name: skill.name || skill.skill || skill.title || "",
        level: skill.level || skill.proficiency || "Intermediate"
      });
    }
  }

  // Extract languages
  const languages = [];
  const languagesData = profile.languages || [];
  
  for (const lang of languagesData) {
    if (typeof lang === 'string') {
      languages.push({ name: lang, proficiency: "Intermediate" });
    } else if (lang && typeof lang === 'object') {
      languages.push({
        name: lang.name || lang.language || "",
        proficiency: lang.proficiency || lang.level || "Intermediate"
      });
    }
  }

  // Extract certifications
  const certifications = [];
  const certsData = profile.certifications || profile.certificates || [];
  
  for (const cert of certsData) {
    if (cert && typeof cert === 'object') {
      certifications.push({
        name: cert.name || cert.title || "",
        issuer: cert.issuer || cert.authority || cert.organization || "",
        date: cert.date || cert.issued_on || cert.issueDate || "",
        description: cert.description || ""
      });
    }
  }

  const transformedData = {
    personalInfo,
    experience,
    education,
    skills,
    languages,
    certifications
  };

  console.log(`✅ Real data transform tamamlandı`);
  console.log(`📊 Transform edilən məlumatlar:`, {
    name: personalInfo.name,
    experience_count: experience.length,
    education_count: education.length,
    skills_count: skills.length,
    languages_count: languages.length,
    certifications_count: certifications.length
  });

  return transformedData;
}

// Helper function to format name from username
function formatNameFromUsername(username: string): string {
  return username.split(/[^a-zA-Z]/).map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  ).join(' ').trim() || 'Professional';
}

export async function POST(request: NextRequest) {
  // Temporarily disable auth for testing
  const userId = "user-" + Date.now();

  try {
    const body = await request.json();
    const { url, linkedinUrl } = body;
    const profileUrl = url || linkedinUrl;
    
    if (!profileUrl || !profileUrl.includes('linkedin.com')) {
      return NextResponse.json({ 
        error: "Düzgün LinkedIn URL daxil edin (məsələn: https://www.linkedin.com/in/username)" 
      }, { status: 400 });
    }

    console.log('🚀 REAL LinkedIn import başladı:', profileUrl);
    console.log('📊 İstifadəçi ID:', userId);
    
    // Real LinkedIn profile scraping - NO MOCK DATA
    const profileData = await scrapeLinkedInProfile(profileUrl);
    
    if (!profileData) {
      throw new Error("Real LinkedIn profil məlumatları alına bilmədi");
    }

    console.log('✅ REAL LinkedIn profil uğurla import edildi');

    return NextResponse.json({
      success: true,
      message: "LinkedIn profil real məlumatları uğurla import edildi",
      data: profileData,
      meta: {
        source: "real_api",
        imported_at: new Date().toISOString(),
        profile_url: profileUrl
      }
    });

  } catch (error: any) {
    console.error("💥 REAL LinkedIn import xətası:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "LinkedIn import zamanı xəta baş verdi",
      meta: {
        source: "api_error",
        error_at: new Date().toISOString()
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
