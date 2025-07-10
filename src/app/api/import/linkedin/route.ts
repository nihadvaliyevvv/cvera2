import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import axios from "axios";

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

// API Key Rotation Algorithm - Try all keys until one works
async function tryApiKeysSequentially(url: string): Promise<{ apiKey: string; response: any } | null> {
  console.log('Starting API key rotation for LinkedIn import...');
  
  // Get all active API keys from database
  const keys = await prisma.apiKey.findMany({
    where: { 
      active: true
    },
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('Available API keys:', {
    dbKeys: keys.length,
    host: process.env.RAPIDAPI_HOST
  });
  
  if (keys.length === 0) {
    console.error('No active LinkedIn API keys available in database');
    return null;
  }
  
  console.log(`Trying ${keys.length} API keys...`);
  
  // Try each API key until one works
  for (const keyRecord of keys) {
    try {
      console.log(`Trying API key: ${keyRecord.key.substring(0, 10)}...`);
      
      const response = await axios.get(
        `https://${process.env.RAPIDAPI_HOST}/get-linkedin-profile`,
        {
          params: { linkedin_url: url },
          headers: {
            "X-RapidAPI-Key": keyRecord.key,
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
          },
          timeout: 30000,
        }
      );
      
      console.log(`API key ${keyRecord.key.substring(0, 10)}... works! Status: ${response.status}`);
      
      return { apiKey: keyRecord.key, response };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.log(`API key ${keyRecord.key.substring(0, 10)}... failed:`, {
        status: statusCode,
        message: errorMessage,
        code: error.code
      });
      
      // If it's a rate limit error (429), try next key
      if (statusCode === 429) {
        console.log(`Rate limit hit for key ${keyRecord.key.substring(0, 10)}..., trying next key`);
        continue;
      }
      
      // If it's a different error, still try next key but log it
      if (statusCode === 401 || statusCode === 403) {
        console.log(`Authentication error for key ${keyRecord.key.substring(0, 10)}..., trying next key`);
        continue;
      }
      
      // For other errors, we might want to return the error instead of trying more keys
      if (statusCode === 404) {
        console.log(`Profile not found - no point trying other keys`);
        throw error; // Profile not found - no point trying other keys
      }
      
      // Network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log(`Network error for key ${keyRecord.key.substring(0, 10)}...:`, error.code);
        continue;
      }
      
      // For unknown errors, try next key
      continue;
    }
  }
  
  console.log('All API keys exhausted, no working key found');
  return null;
}

// Map LinkedIn data to CV structure for Fresh LinkedIn Profile Data API
function mapLinkedInToCVData(linkedinData: any) {
  console.log('Mapping LinkedIn data structure...');
  
  // Extract skills from various possible sources
  const extractSkills = (data: any) => {
    const skills = [];
    
    // From direct skills array
    if (data.skills && Array.isArray(data.skills)) {
      skills.push(...data.skills);
    }
    
    // From experience skills
    if (data.experiences) {
      data.experiences.forEach((exp: any) => {
        if (exp.skills) {
          const expSkills = exp.skills.split(' · ').map((s: string) => s.trim());
          skills.push(...expSkills);
        }
      });
    }
    
    // Remove duplicates and empty values
    return [...new Set(skills.filter(Boolean))];
  };
  
  // Extract projects if available
  const extractProjects = (data: any) => {
    return (data.projects || []).map((project: any) => ({
      name: project.name || project.title || "",
      description: project.description || "",
      url: project.url || "",
      date: project.date || `${project.start_date || ""} - ${project.end_date || ""}`,
    }));
  };
  
  // Extract certifications if available
  const extractCertifications = (data: any) => {
    return (data.certifications || []).map((cert: any) => ({
      name: cert.name || cert.title || "",
      issuer: cert.authority || cert.issuer || cert.organization || "",
      date: cert.date || `${cert.start_date || ""} - ${cert.end_date || ""}`,
      url: cert.url || "",
      license_number: cert.license_number || cert.credential_id || "",
    }));
  };
  
  // Extract volunteer experience if available
  const extractVolunteer = (data: any) => {
    return (data.volunteer || data.volunteer_experience || []).map((vol: any) => ({
      organization: vol.organization || vol.company || "",
      role: vol.role || vol.title || vol.position || "",
      description: vol.description || "",
      start_date: vol.start_date || "",
      end_date: vol.end_date || "",
      cause: vol.cause || "",
    }));
  };
  
  return {
    personal_info: {
      full_name: linkedinData.full_name || "",
      email: linkedinData.email || "",
      phone: linkedinData.phone || "",
      address: linkedinData.location || "",
      photo_url: linkedinData.profile_image_url || "",
      website: linkedinData.company_website || linkedinData.website || "",
      linkedin_url: linkedinData.linkedin_url || "",
      headline: linkedinData.headline || "",
    },
    summary: linkedinData.about || linkedinData.headline || "",
    experience: (linkedinData.experiences || []).map((exp: any) => ({
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      start_date: exp.start_year ? `${exp.start_year}-${String(exp.start_month || 1).padStart(2, '0')}` : "",
      end_date: exp.end_year ? `${exp.end_year}-${String(exp.end_month || 12).padStart(2, '0')}` : "",
      description: exp.description || "",
      is_current: exp.is_current || false,
      job_type: exp.job_type || "",
      skills: exp.skills || "",
    })),
    education: (linkedinData.educations || []).map((edu: any) => ({
      degree: edu.degree || "",
      institution: edu.school || "",
      field_of_study: edu.field_of_study || "",
      start_date: edu.start_year ? `${edu.start_year}-${String(edu.start_month || 9).padStart(2, '0')}` : "",
      end_date: edu.end_year ? `${edu.end_year}-${String(edu.end_month || 6).padStart(2, '0')}` : "",
      description: edu.description || "",
      activities: edu.activities || "",
      grade: edu.grade || "",
    })),
    skills: extractSkills(linkedinData),
    languages: (linkedinData.languages || []).map((lang: any) => ({
      name: lang.name || lang.language || "",
      proficiency: lang.proficiency || lang.level || "",
    })),
    certifications: extractCertifications(linkedinData),
    projects: extractProjects(linkedinData),
    volunteer_experience: extractVolunteer(linkedinData),
    // Additional metadata
    connections_count: linkedinData.connection_count || 0,
    followers_count: linkedinData.follower_count || 0,
    is_premium: linkedinData.is_premium || false,
    is_verified: linkedinData.is_verified || false,
  };
}

// POST /api/import/linkedin - Import LinkedIn profile
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "LinkedIn URL is required" }, { status: 400 });
    }

    // API Key Rotation Logic - Try all keys until one works
    const result = await tryApiKeysSequentially(url);
    if (!result) {
      return NextResponse.json({ 
        error: "Bütün API açarları limit aşıb və ya əlçatamazdır. Zəhmət olmasa bir neçə dəqiqə sonra yenidən cəhd edin." 
      }, { status: 503 });
    }

    const { apiKey, response } = result;
    console.log(`Successfully used API key: ${apiKey.substring(0, 10)}... for LinkedIn profile: ${url}`);

    // Validate LinkedIn URL format
    if (!url.includes('linkedin.com/in/')) {
      return NextResponse.json({ 
        error: "Yalnız LinkedIn profil URL-ləri dəstəklənir. URL https://linkedin.com/in/username formatında olmalıdır." 
      }, { status: 400 });
    }

    console.log(`Successfully used API key: ${apiKey.substring(0, 10)}... for LinkedIn profile: ${url}`);

    console.log('LinkedIn API response status:', response.status);
    console.log('LinkedIn API response data keys:', Object.keys(response.data || {}));

    if (!response.data || !response.data.data) {
      return NextResponse.json({ 
        error: "LinkedIn profili tapılmadı və ya boşdur. Profilin ictimai olduğunu və düzgün URL istifadə etdiyinizi yoxlayın." 
      }, { status: 404 });
    }

    // Map LinkedIn data to CV structure
    const cvData = mapLinkedInToCVData(response.data.data);
    console.log('Final CV data being sent:', JSON.stringify(cvData, null, 2));

    return NextResponse.json(cvData);
  } catch (error: unknown) {
    console.error("LinkedIn import error:", error);
    
    // Handle specific axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
      const status = axiosError.response?.status;
      
      if (status === 429) {
        return NextResponse.json({ 
          error: "Çox sayda sorğu göndərildiği üçün xidmət müvəqqəti olaraq məhdudlaşdırılıb. Zəhmət olmasa bir neçə dəqiqə sonra yenidən cəhd edin." 
        }, { status: 429 });
      } else if (status === 401 || status === 403) {
        return NextResponse.json({ 
          error: "LinkedIn profili yüklənərkən icazə problemi yaşandı. Bu profil ictimai olmaya bilər və ya API xidməti müvəqqəti olaraq əlçatmazdır." 
        }, { status: 403 });
      } else if (status === 404) {
        return NextResponse.json({ 
          error: "LinkedIn profili tapılmadı. URL-nin düzgün olduğunu və profilin mövcud olduğunu yoxlayın." 
        }, { status: 404 });
      }
    }
    
    // Handle timeout errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
      return NextResponse.json({ 
        error: "LinkedIn profili yüklənərkən zaman aşımı baş verdi. Şəbəkə bağlantınızı yoxlayın və yenidən cəhd edin." 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: "LinkedIn profili yüklənərkən xəta baş verdi. URL-nin düzgün olduğunu və profilin ictimai (public) olduğunu yoxlayın." 
    }, { status: 500 });
  }
}
