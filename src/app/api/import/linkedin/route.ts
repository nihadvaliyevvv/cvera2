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
  console.log('🔄 LinkedIn API key rotation başladı...');
  
  // For testing, use hardcoded API key if database is not available
  const hardcodedKeys = [{
    id: 'test-key',
    key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
    priority: 1,
    active: true,
    name: 'Test LinkedIn API Key'
  }];

  let keys = hardcodedKeys;
  
  try {
    // Try to get keys from database
    const dbKeys = await prisma.apiKey.findMany({
      where: { 
        active: true,
        service: 'linkedin'
      },
      orderBy: { priority: 'asc' }
    });
    
    if (dbKeys.length > 0) {
      keys = dbKeys;
      console.log('📊 Database-dən API keylər istifadə olunur');
    } else {
      console.log('📊 Hardcoded API keylər istifadə olunur');
    }
  } catch (dbError) {
    console.log('⚠️ Database bağlantısı yoxdur, hardcoded key istifadə olunur');
    keys = hardcodedKeys;
  }
  
  // User's working API configuration
  const possibleHosts = [
    'fresh-linkedin-profile-data.p.rapidapi.com'  // User confirmed working host
  ];
  
  console.log('📊 API keylər:', {
    totalKeys: keys.length,
    hosts: possibleHosts.length
  });
  
  if (keys.length === 0) {
    console.error('❌ Aktiv LinkedIn API key tapılmadı');
    return null;
  }

  console.log(`🔑 ${keys.length} API key test ediləcək...`);
  
  // Try each host with each API key until one works
  for (const rapidApiHost of possibleHosts) {
    console.log(`🌐 Testing host: ${rapidApiHost}`);
    
    // Try each API key until one works
    for (const keyRecord of keys) {
      try {
        console.log(`🧪 API Key test: ${keyRecord.key.substring(0, 10)}... (Priority: ${keyRecord.priority || 1})`);
        
        // Clean URL to prevent 431 errors
        const cleanUrl = url.includes('?') ? url.split('?')[0] : url;
      
        // Test the correct endpoint based on your curl example
        const endpointsToTest = [
          // The working endpoint from your curl example
          { 
            path: '/get-profile-public-data', 
            method: 'GET', 
            params: { 
              linkedin_url: cleanUrl,
              include_skills: 'true',
              include_certifications: 'true',
              include_publications: 'true',
              include_honors: 'true',
              include_volunteers: 'true',
              include_projects: 'true',
              include_patents: 'true',
              include_courses: 'true',
              include_organizations: 'true',
              include_profile_status: 'true',
              include_company_public_url: 'true'
            } 
          },
          // Backup variations if the first one fails
          { path: '/get-profile-public-data', method: 'GET', params: { linkedin_url: cleanUrl } },
          { path: '/get-profile', method: 'GET', params: { linkedin_url: cleanUrl } },
          { path: '/profile', method: 'GET', params: { linkedin_url: cleanUrl } },
        ];
      
        for (const endpoint of endpointsToTest) {
          try {
            console.log(`🔍 Testing endpoint: ${endpoint.path} (${endpoint.method})`);
            
            const config = {
              headers: {
                "X-RapidAPI-Key": keyRecord.key,
                "X-RapidAPI-Host": rapidApiHost,
                "User-Agent": "CVera-LinkedIn-Import/1.0"
              },
              timeout: 10000
            };
            
            let requestUrl = `https://${rapidApiHost}${endpoint.path}`;
            
            // All endpoints are GET requests now
            if (endpoint.params) {
              // Filter out undefined values
              const cleanParams = Object.entries(endpoint.params)
                .filter(([_, value]) => value !== undefined)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {});
              
              const searchParams = new URLSearchParams(cleanParams);
              requestUrl += '?' + searchParams.toString();
            }
            
            const response = await axios.get(requestUrl, config);

            if (response.status === 200 && response.data) {
              console.log(`✅ Endpoint işlədi: ${endpoint.path} (${endpoint.method})`);
              console.log('✅ API Key uğurla işlədi:', keyRecord.key.substring(0, 10));
              return { apiKey: keyRecord.key, response: response.data };
            }
            
          } catch (endpointError: any) {
            console.log(`❌ Endpoint failed: ${endpoint.path} (${endpoint.method}) - ${endpointError.response?.status || endpointError.message}`);
            continue; // Try next endpoint
          }
        }
        
      } catch (error: any) {
        console.log(`❌ API Key failed: ${keyRecord.key.substring(0, 10)}...`);
        
        if (error.response) {
          console.log(`   HTTP ${error.response.status}: ${error.response.statusText}`);
          console.log(`   Error: ${JSON.stringify(error.response.data)}`);
          
          // If 403 or subscription error, try next key
          if (error.response.status === 403) {
            console.log('   🔄 403 error, trying next key...');
            continue;
          }
          
          // If 429 (rate limit), wait and try next key
          if (error.response.status === 429) {
            console.log('   ⏳ Rate limit, trying next key...');
            continue;
          }
        }
        
        console.log(`   Error details: ${error.message}`);
      }
    } // End of API key loop
  } // End of host loop
  
  console.error('💥 Bütün API keylər və host-lar uğursuz oldu');
  return null;
}

export async function POST(request: NextRequest) {
  // Temporarily disable auth for testing
  // const userId = getUserIdFromRequest(request);
  // if (!userId) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const userId = "test-user"; // For testing

  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url || !url.includes('linkedin.com')) {
      return NextResponse.json({ 
        error: "Düzgün LinkedIn URL daxil edin" 
      }, { status: 400 });
    }

    console.log('🚀 LinkedIn import başladı:', url);
    
    // Try API keys sequentially
    const result = await tryApiKeysSequentially(url);
    
    if (!result) {
      return NextResponse.json({ 
        success: false,
        error: "LinkedIn profil məlumatları əldə edilə bilmədi. Bütün API keylər uğursuz oldu. API subscription-ı yoxlayın." 
      }, { status: 503 });
    }

    const linkedinData = result.response;
    console.log('📊 LinkedIn data alındı:', Object.keys(linkedinData));
    console.log('🔍 Full LinkedIn response:', JSON.stringify(linkedinData, null, 2));

    // Transform the data for our CV format
    const profileData = linkedinData.data || linkedinData; // Handle nested structure
    
    // Debug skills structure specifically
    console.log('🔍 Skills data structure:', profileData.skills);
    console.log('🔍 Skills type:', typeof profileData.skills);
    console.log('🔍 Is skills array?:', Array.isArray(profileData.skills));
    console.log('🔍 Certifications data:', profileData.certifications);
    console.log('🔍 PersonalInfo data:', {
      full_name: profileData.full_name,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      headline: profileData.headline,
      about: profileData.about
    });
    
    const transformedData = {
      personalInfo: {
        name: profileData.full_name || profileData.first_name + ' ' + profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        linkedin: url,
        summary: profileData.about || profileData.summary || '',
        website: profileData.company_website || '',
        headline: profileData.headline || profileData.job_title || ''
      },
      experience: Array.isArray(profileData.experiences) ? profileData.experiences.map((exp: any) => ({
        company: exp.company || exp.company_name || exp.organization || '',
        position: exp.title || exp.position || exp.job_title || '',
        startDate: exp.start_year ? exp.start_year.toString() : exp.start_date || exp.starts_at || '',
        endDate: exp.end_year ? exp.end_year.toString() : exp.end_date || exp.ends_at || '',
        current: exp.is_current || (!exp.end_date && !exp.ends_at && !exp.end_year),
        description: exp.description || '',
        jobType: exp.job_type || exp.employment_type || '',
        skills: exp.skills || '',
        duration: exp.duration || ''
      })) : [],
      education: Array.isArray(profileData.educations) ? profileData.educations.map((edu: any) => ({
        institution: edu.school || edu.institution || edu.university || '',
        degree: edu.degree || edu.degree_name || '',
        field: edu.field_of_study || edu.field || '',
        startDate: edu.start_year ? edu.start_year.toString() : edu.start_date || edu.starts_at || '',
        endDate: edu.end_year ? edu.end_year.toString() : edu.end_date || edu.ends_at || '',
        current: !edu.end_date && !edu.ends_at && !edu.end_year,
        description: edu.description || '',
        activities: edu.activities || '',
        grade: edu.grade || ''
      })) : [],
      skills: Array.isArray(profileData.skills) ? profileData.skills.map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name || skill.title || '',
        level: 'Intermediate' as const
      })) : [],
      languages: Array.isArray(profileData.languages) ? profileData.languages.map((lang: any) => ({
        name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
        proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || lang.level || 'Professional'
      })) : [],
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications.map((cert: any) => ({
        name: cert.name || cert.title || cert.certification || '',
        issuer: cert.authority || cert.issuer || cert.organization || '',
        date: cert.start_date || cert.date || cert.issued_date || '',
        description: cert.description || ''
      })) : [],
      projects: Array.isArray(profileData.projects) ? profileData.projects.map((proj: any) => ({
        name: proj.title || proj.name || proj.project_name || '',
        description: proj.description || '',
        startDate: proj.start_date || proj.starts_at || '',
        endDate: proj.end_date || proj.ends_at || '',
        skills: proj.skills || '',
        url: proj.url || proj.project_url || ''
      })) : [],
      // Additional sections - even if empty, include them for CV completeness
      volunteerExperience: Array.isArray(profileData.volunteer_experience) ? profileData.volunteer_experience.map((vol: any) => ({
        organization: vol.organization || vol.company || '',
        role: vol.role || vol.title || vol.position || '',
        startDate: vol.start_date || vol.starts_at || '',
        endDate: vol.end_date || vol.ends_at || '',
        description: vol.description || '',
        cause: vol.cause || ''
      })) : (Array.isArray(profileData.volunteering) ? profileData.volunteering.map((vol: any) => ({
        organization: vol.organization || vol.company || '',
        role: vol.role || vol.title || vol.position || '',
        startDate: vol.start_date || vol.starts_at || '',
        endDate: vol.end_date || vol.ends_at || '',
        description: vol.description || '',
        cause: vol.cause || ''
      })) : []),
      publications: Array.isArray(profileData.publications) ? profileData.publications : [],
      honorsAwards: Array.isArray(profileData.honors) ? profileData.honors : (Array.isArray(profileData.awards) ? profileData.awards : []),
      testScores: Array.isArray(profileData.test_scores) ? profileData.test_scores : [],
      recommendations: Array.isArray(profileData.recommendations) ? profileData.recommendations : [],
      courses: Array.isArray(profileData.courses) ? profileData.courses : []
    };

    console.log('✅ LinkedIn data transform edildi');
    console.log('🎯 Final transformed data structure:');
    console.log('🎯 PersonalInfo:', transformedData.personalInfo);
    console.log('🎯 Skills count:', transformedData.skills.length);
    console.log('🎯 Certifications count:', transformedData.certifications.length);
    console.log('🎯 Experience count:', transformedData.experience.length);
    console.log('🎯 Education count:', transformedData.education.length);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error: any) {
    console.error("💥 LinkedIn import error:", error);
    
    if (error.response?.status === 403) {
      return NextResponse.json({ 
        success: false,
        error: "API subscription problemi. RapidAPI-da 'Fresh LinkedIn Profile Data' servisinə abunə olduğunuzdan əmin olun." 
      }, { status: 503 });
    }
    
    if (error.response?.status === 429) {
      return NextResponse.json({ 
        success: false,
        error: "API limit aşıldı. Bir neçə dəqiqə sonra yenidən cəhd edin." 
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: "LinkedIn profil import zamanı xəta baş verdi. URL-nin düzgün olduğunu və profilin public olduğunu yoxlayın." 
    }, { status: 500 });
  }
}
