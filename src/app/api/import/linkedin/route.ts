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
      
      // Ensure URL is not too long to prevent 431 errors - aggressive cleaning  
      const cleanUrl = url.trim()
        .replace(/\?.*$/, '') // Remove all query parameters
        .replace(/#.*$/, '') // Remove hash fragments  
        .replace(/\/$/, '') // Remove trailing slash
        .replace(/\/+$/, '') // Remove multiple trailing slashes
        .split('/').slice(0, 5).join('/'); // Keep only first 5 path segments
      
      // Additional URL length check
      let finalUrl: string;
      if (cleanUrl.length > 100) {
        console.log(`URL too long after cleaning: ${cleanUrl.length} characters, truncating...`);
        const baseUrl = cleanUrl.split('/').slice(0, 4).join('/'); // More aggressive truncation
        finalUrl = baseUrl.length > 80 ? cleanUrl.substring(0, 80) : baseUrl;
      } else {
        finalUrl = cleanUrl;
      }
      
      console.log(`Original URL: ${url.substring(0, 100)}...`);
      console.log(`Cleaned URL: ${finalUrl}`);
      
      const response = await axios.get(
        `https://${process.env.RAPIDAPI_HOST}/get-linkedin-profile`,
        {
          params: { 
            linkedin_url: finalUrl,
            include_experiences: 'true',
            include_educations: 'true',
            include_skills: 'true',
            include_languages: 'true',
            include_certifications: 'true',
            include_projects: 'true',
            include_volunteer_experience: 'true',
            include_volunteers: 'true',
            include_volunteering: 'true',
            include_volunteer_work: 'true',
            include_accomplishments: 'true',
            include_publications: 'true',
            include_honors: 'true',
            include_awards: 'true',
            include_honors_awards: 'true',
            include_achievements: 'true',
            include_causes: 'true'
          },
          headers: {
            "X-RapidAPI-Key": keyRecord.key,
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
          },
          timeout: 25000, // Reduced timeout
          maxRedirects: 3, // Reduced redirects
        }
      );
      
      console.log(`API key ${keyRecord.key.substring(0, 10)}... works! Status: ${response.status}`);
      
      // Update API key usage statistics on success
      await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date(),
          lastResult: 'success'
        }
      });
      
      return { apiKey: keyRecord.key, response };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.log(`API key ${keyRecord.key.substring(0, 10)}... failed:`, {
        status: statusCode,
        message: errorMessage,
        code: error.code
      });
      
      // Update API key usage statistics on failure
      await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date(),
          lastResult: 'error'
        }
      });
      
      // Auto-deactivate API key on authentication errors
      if (statusCode === 401 || statusCode === 403) {
        console.log(`🔒 Authentication error for key ${keyRecord.key.substring(0, 10)}... - DEACTIVATING KEY`);
        
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: {
            active: false,
            deactivatedAt: new Date(),
            lastResult: 'deactivated_auth_error'
          }
        });
        
        console.log(`✅ API key ${keyRecord.key.substring(0, 10)}... has been deactivated due to auth error`);
        continue;
      }
      
      // Handle 431 Request Header Fields Too Large
      if (statusCode === 431) {
        console.log(`Header too large error for key ${keyRecord.key.substring(0, 10)}..., trying next key`);
        continue;
      }
      
      // If it's a rate limit error (429), try next key
      if (statusCode === 429) {
        console.log(`Rate limit hit for key ${keyRecord.key.substring(0, 10)}..., trying next key`);
        continue;
      }
      
      // For other errors, we might want to return the error instead of trying more keys
      if (statusCode === 404) {
        console.log(`Profile not found - no point trying other keys`);
        throw error; // Profile not found - no point trying other keys
      }
      
      // Auto-deactivate API key on server errors (5xx)
      if (statusCode >= 500) {
        console.log(`🔒 Server error ${statusCode} for key ${keyRecord.key.substring(0, 10)}... - DEACTIVATING KEY`);
        
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: {
            active: false,
            deactivatedAt: new Date(),
            lastResult: 'deactivated_server_error'
          }
        });
        
        console.log(`✅ API key ${keyRecord.key.substring(0, 10)}... has been deactivated due to server error`);
        continue;
      }
      
      // Network errors - also deactivate after multiple failures
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.log(`🔒 Network error ${error.code} for key ${keyRecord.key.substring(0, 10)}... - DEACTIVATING KEY`);
        
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: {
            active: false,
            deactivatedAt: new Date(),
            lastResult: 'deactivated_network_error'
          }
        });
        
        console.log(`✅ API key ${keyRecord.key.substring(0, 10)}... has been deactivated due to network error`);
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
    console.log('Raw certifications data from LinkedIn:', JSON.stringify(data.certifications || [], null, 2));
    
    return (data.certifications || []).map((cert: any) => ({
      name: cert.name || cert.title || "",
      issuer: cert.authority || cert.issuer || cert.organization || "",
      date: cert.issued || cert.date || cert.issue_date || `${cert.start_date || ""} - ${cert.end_date || ""}`,
      url: cert.url || "",
      license_number: cert.license_number || cert.credential_id || "",
    }));
  };
  
  // Extract volunteer experience if available
  const extractVolunteer = (data: any) => {
    console.log('Raw volunteer data from LinkedIn:', JSON.stringify(data.volunteer || [], null, 2));
    console.log('Raw volunteers data from LinkedIn:', JSON.stringify(data.volunteers || [], null, 2));
    console.log('Raw volunteer_experience data from LinkedIn:', JSON.stringify(data.volunteer_experience || [], null, 2));
    console.log('Raw volunteering data from LinkedIn:', JSON.stringify(data.volunteering || [], null, 2));
    console.log('Raw volunteer_work data from LinkedIn:', JSON.stringify(data.volunteer_work || [], null, 2));
    
    const volunteers = [];
    
    // Check both volunteer and volunteer_experience fields
    if (data.volunteer && Array.isArray(data.volunteer)) {
      volunteers.push(...data.volunteer);
    }
    
    if (data.volunteers && Array.isArray(data.volunteers)) {
      volunteers.push(...data.volunteers);
    }
    
    if (data.volunteer_experience && Array.isArray(data.volunteer_experience)) {
      volunteers.push(...data.volunteer_experience);
    }
    
    // Also check if it's under different field names
    if (data.volunteering && Array.isArray(data.volunteering)) {
      volunteers.push(...data.volunteering);
    }
    
    if (data.volunteer_work && Array.isArray(data.volunteer_work)) {
      volunteers.push(...data.volunteer_work);
    }
    
    console.log('Total volunteer entries found:', volunteers.length);
    
    return volunteers.map((vol: any) => ({
      organization: vol.organization || vol.company || vol.org || "",
      role: vol.role || vol.title || vol.position || "",
      description: vol.description || "",
      start_date: vol.start_date || vol.startDate || "",
      end_date: vol.end_date || vol.endDate || "",
      date: vol.date || `${vol.start_date || vol.startDate || ""} - ${vol.end_date || vol.endDate || ""}`,
      cause: vol.cause || vol.category || "",
    }));
  };

  // Extract honors & awards if available
  const extractHonorsAwards = (data: any) => {
    console.log('Raw honors data from LinkedIn:', JSON.stringify(data.honors || [], null, 2));
    console.log('Raw awards data from LinkedIn:', JSON.stringify(data.awards || [], null, 2));
    console.log('Raw accomplishments data from LinkedIn:', JSON.stringify(data.accomplishments || [], null, 2));
    
    const honors = [];
    
    // Check multiple possible field names for honors/awards
    if (data.honors && Array.isArray(data.honors)) {
      honors.push(...data.honors);
    }
    
    if (data.awards && Array.isArray(data.awards)) {
      honors.push(...data.awards);
    }
    
    if (data.accomplishments && Array.isArray(data.accomplishments)) {
      honors.push(...data.accomplishments);
    }
    
    if (data.honors_awards && Array.isArray(data.honors_awards)) {
      honors.push(...data.honors_awards);
    }
    
    if (data.achievements && Array.isArray(data.achievements)) {
      honors.push(...data.achievements);
    }
    
    console.log('Total honors/awards entries found:', honors.length);
    
    return honors.map((honor: any) => ({
      title: honor.title || honor.name || "",
      issuer: honor.issuer || honor.authority || honor.organization || "",
      date: honor.date || honor.issued || `${honor.start_date || ""} - ${honor.end_date || ""}`,
      description: honor.description || "",
      url: honor.url || "",
    }));
  };
  
  const mappedData = {
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
    honors_awards: extractHonorsAwards(linkedinData),
    // Additional metadata
    connections_count: linkedinData.connection_count || 0,
    followers_count: linkedinData.follower_count || 0,
    is_premium: linkedinData.is_premium || false,
    is_verified: linkedinData.is_verified || false,
  };
  
  // Log the final mapped data
  console.log('Final mapped CV data languages:', JSON.stringify(mappedData.languages, null, 2));
  console.log('Final mapped CV data certifications:', JSON.stringify(mappedData.certifications, null, 2));
  console.log('Final mapped CV data projects:', JSON.stringify(mappedData.projects, null, 2)); 
  console.log('Final mapped CV data volunteer_experience:', JSON.stringify(mappedData.volunteer_experience, null, 2));
  console.log('Final mapped CV data honors_awards:', JSON.stringify(mappedData.honors_awards, null, 2));
  
  return mappedData;
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

    // Validate LinkedIn URL format
    if (!url.includes('linkedin.com/in/')) {
      return NextResponse.json({ 
        error: "Yalnız LinkedIn profil URL-ləri dəstəklənir. URL https://linkedin.com/in/username formatında olmalıdır." 
      }, { status: 400 });
    }

    // Clean and shorten URL to prevent 431 Header Fields Too Large error
    const cleanUrl = url.trim()
      .replace(/\?.*$/, '') // Remove query parameters
      .replace(/#.*$/, '') // Remove hash fragments
      .replace(/\/$/, ''); // Remove trailing slash

    console.log('Original URL:', url);
    console.log('Cleaned URL:', cleanUrl);

    // Extract username from URL for additional validation
    const urlMatch = cleanUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
    if (!urlMatch) {
      return NextResponse.json({ 
        error: "LinkedIn URL formatı yanlışdır. Düzgün format: https://linkedin.com/in/username" 
      }, { status: 400 });
    }

    const username = urlMatch[1];
    console.log('Extracted username:', username);

    // Use cleaned URL for API call
    const result = await tryApiKeysSequentially(cleanUrl);
    if (!result) {
      return NextResponse.json({ 
        error: "Bütün API açarları limit aşıb və ya əlçatamazdır. Zəhmət olmasa bir neçə dəqiqə sonra yenidən cəhd edin." 
      }, { status: 503 });
    }

    const { apiKey, response } = result;
    console.log(`Successfully used API key: ${apiKey.substring(0, 10)}... for LinkedIn profile: ${cleanUrl}`);

    console.log('LinkedIn API response status:', response.status);
    console.log('LinkedIn API response data keys:', Object.keys(response.data || {}));

    // Log the full raw LinkedIn API response for debugging
    console.log('RAW LINKEDIN API RESPONSE:', JSON.stringify(response.data, null, 2));
    
    // Log specific sections we're interested in
    const data = response.data.data || {};
    console.log('LinkedIn API - Languages:', data.languages ? data.languages.length : 0);
    console.log('LinkedIn API - Certifications:', data.certifications ? data.certifications.length : 0);
    console.log('LinkedIn API - Projects:', data.projects ? data.projects.length : 0);
    console.log('LinkedIn API - Volunteer:', data.volunteer ? data.volunteer.length : 0);
    console.log('LinkedIn API - Volunteer Experience:', data.volunteer_experience ? data.volunteer_experience.length : 0);
    console.log('LinkedIn API - Volunteering:', data.volunteering ? data.volunteering.length : 0);
    console.log('LinkedIn API - Volunteer Work:', data.volunteer_work ? data.volunteer_work.length : 0);
    console.log('LinkedIn API - Honors:', data.honors ? data.honors.length : 0);
    console.log('LinkedIn API - Awards:', data.awards ? data.awards.length : 0);
    console.log('LinkedIn API - Accomplishments:', data.accomplishments ? data.accomplishments.length : 0);
    console.log('LinkedIn API - Honors Awards:', data.honors_awards ? data.honors_awards.length : 0);
    console.log('LinkedIn API - Achievements:', data.achievements ? data.achievements.length : 0);
    
    // Log all available keys to see what volunteer-related fields exist
    console.log('All available keys in LinkedIn data:', Object.keys(data));

    if (!response.data || !response.data.data) {
      return NextResponse.json({ 
        error: "LinkedIn profili tapılmadı və ya boşdur. Profilin ictimai olduğunu və düzgün URL istifadə etdiyinizi yoxlayın." 
      }, { status: 404 });
    }

    // Ensure all required fields exist with default empty arrays
    const linkedinData = {
      ...response.data.data,
      languages: response.data.data.languages || [],
      certifications: response.data.data.certifications || [],
      projects: response.data.data.projects || [],
      volunteer: response.data.data.volunteer || [],
      volunteer_experience: response.data.data.volunteer_experience || [],
      volunteering: response.data.data.volunteering || [],
      volunteer_work: response.data.data.volunteer_work || [],
      honors: response.data.data.honors || [],
      awards: response.data.data.awards || [],
      accomplishments: response.data.data.accomplishments || [],
      honors_awards: response.data.data.honors_awards || [],
      achievements: response.data.data.achievements || []
    };

    // Map LinkedIn data to CV structure
    const cvData = mapLinkedInToCVData(linkedinData);
    console.log('Final CV data being sent:', JSON.stringify(cvData, null, 2));

    // Store import data temporarily and return short URL
    try {
      console.log('Creating import session for user:', userId);
      console.log('Session data size:', JSON.stringify(cvData).length);
      
      const importSession = await prisma.importSession.create({
        data: {
          userId,
          data: JSON.stringify(cvData),
          type: 'linkedin',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        }
      });

      console.log('Import session created successfully:', importSession.id);

      return NextResponse.json({
        success: true,
        sessionId: importSession.id,
        redirectUrl: `/cv/edit/new?session=${importSession.id}`,
        message: "LinkedIn profili uğurla import edildi"
      });
    } catch (storeError) {
      console.error('Failed to store import session:', storeError);
      // Return error instead of falling back to URL data
      return NextResponse.json({ 
        error: "Import məlumatları saxlanılarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin." 
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("LinkedIn import error:", error);
    
    // Handle specific axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
      const status = axiosError.response?.status;
      
      if (status === 431) {
        return NextResponse.json({ 
          error: "Request header çox böyükdür. Zəhmət olmasa qısa LinkedIn URL istifadə edin." 
        }, { status: 431 });
      } else if (status === 429) {
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
