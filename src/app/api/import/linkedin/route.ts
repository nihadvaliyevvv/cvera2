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
      
        // Test different endpoints and methods for fresh-linkedin-profile-data
        const endpointsToTest = [
          // Query parameter variations
          { path: '/get-profile', method: 'GET', params: { url: cleanUrl } },
          { path: '/profile', method: 'GET', params: { url: cleanUrl } },
          { path: '/linkedin-profile', method: 'GET', params: { url: cleanUrl } },
          { path: '/scrape', method: 'GET', params: { url: cleanUrl } },
          { path: '/fetch', method: 'GET', params: { url: cleanUrl } },
          { path: '/data', method: 'GET', params: { url: cleanUrl } },
          { path: '/user', method: 'GET', params: { url: cleanUrl } },
          { path: '', method: 'GET', params: { url: cleanUrl } },
          
          // POST with JSON body variations
          { path: '/get-profile', method: 'POST', body: { url: cleanUrl } },
          { path: '/profile', method: 'POST', body: { url: cleanUrl } },
          { path: '/linkedin-profile', method: 'POST', body: { url: cleanUrl } },
          { path: '/scrape', method: 'POST', body: { url: cleanUrl } },
          { path: '/fetch', method: 'POST', body: { url: cleanUrl } },
          { path: '', method: 'POST', body: { url: cleanUrl } },
          
          // Alternative parameter names
          { path: '/get-profile', method: 'GET', params: { linkedin_url: cleanUrl } },
          { path: '/profile', method: 'GET', params: { profile_url: cleanUrl } },
          { path: '/scrape', method: 'GET', params: { target: cleanUrl } },
          { path: '/fetch', method: 'GET', params: { link: cleanUrl } },
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
            
            let response;
            let requestUrl = `https://${rapidApiHost}${endpoint.path}`;
            
            if (endpoint.method === 'POST') {
              // Use body if provided, otherwise default
              const postData = endpoint.body || { 
                linkedin_url: cleanUrl,
                url: cleanUrl
              };
              
              response = await axios.post(requestUrl, postData, config);
            } else {
              // Add query parameters if provided
              if (endpoint.params) {
                // Filter out undefined values
                const cleanParams = Object.entries(endpoint.params)
                  .filter(([_, value]) => value !== undefined)
                  .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {});
                
                const searchParams = new URLSearchParams(cleanParams);
                requestUrl += '?' + searchParams.toString();
              }
              
              response = await axios.get(requestUrl, config);
            }

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

    // Transform the data for our CV format
    const transformedData = {
      personalInfo: {
        name: linkedinData.full_name || linkedinData.name || '',
        email: linkedinData.email || '',
        phone: linkedinData.phone || '',
        linkedin: url,
        summary: linkedinData.summary || linkedinData.about || '',
        website: linkedinData.website || '',
        headline: linkedinData.headline || linkedinData.title || ''
      },
      experience: linkedinData.experiences?.map((exp: any) => ({
        company: exp.company || exp.company_name || '',
        position: exp.title || exp.position || '',
        startDate: exp.start_date || exp.starts_at || '',
        endDate: exp.end_date || exp.ends_at || '',
        current: !exp.end_date && !exp.ends_at,
        description: exp.description || '',
        jobType: exp.employment_type || '',
        skills: exp.skills || ''
      })) || [],
      education: linkedinData.education?.map((edu: any) => ({
        institution: edu.school || edu.institution || '',
        degree: edu.degree || '',
        field: edu.field_of_study || edu.field || '',
        startDate: edu.start_date || edu.starts_at || '',
        endDate: edu.end_date || edu.ends_at || '',
        current: !edu.end_date && !edu.ends_at,
        description: edu.description || '',
        activities: edu.activities || '',
        grade: edu.grade || ''
      })) || [],
      skills: linkedinData.skills?.map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name || '',
        level: 'Intermediate' as const
      })) || [],
      languages: linkedinData.languages?.map((lang: any) => ({
        name: typeof lang === 'string' ? lang : lang.name || '',
        proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || 'Professional'
      })) || [],
      certifications: linkedinData.certifications?.map((cert: any) => ({
        name: cert.name || cert.title || '',
        issuer: cert.authority || cert.issuer || '',
        date: cert.start_date || cert.date || '',
        description: cert.description || ''
      })) || [],
      projects: linkedinData.projects?.map((proj: any) => ({
        name: proj.title || proj.name || '',
        description: proj.description || '',
        startDate: proj.start_date || '',
        endDate: proj.end_date || '',
        skills: proj.skills || '',
        url: proj.url || ''
      })) || []
    };

    console.log('✅ LinkedIn data transform edildi');

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
