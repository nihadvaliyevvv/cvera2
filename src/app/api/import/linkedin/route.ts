import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { callRapidAPIForSkills } from '@/lib/api-fallback-system';

const prisma = new PrismaClient();

// Function to get active ScrapingDog API key from admin panel
async function getActiveScrapingDogApiKey() {
  try {
    const activeApiKey = await prisma.apiKey.findFirst({
      where: {
        service: 'scrapingdog',
        active: true
      },
      orderBy: {
        priority: 'asc' // Lower number = higher priority
      }
    });

    if (!activeApiKey) {
      throw new Error('Aktiv ScrapingDog API key tapılmadı. Admin paneldə API key əlavə edin.');
    }

    console.log('✅ Active ScrapingDog API key found:', activeApiKey.apiKey.substring(0, 8) + '***');
    return activeApiKey.apiKey;
  } catch (error) {
    console.error('❌ API key lookup failed:', error);
    throw new Error('ScrapingDog API key əldə edilə bilmədi');
  }
}

// ScrapingDog API call with your exact code style
async function callScrapingDogAPI(linkedinUrl: string) {
  const axios = require('axios');

  // Get active API key from admin panel
  const api_key = await getActiveScrapingDogApiKey();
  const url = 'https://api.scrapingdog.com/linkedin';

  // Extract LinkedIn username/ID
  let linkId = '';
  try {
    if (linkedinUrl.includes('linkedin.com/in/')) {
      linkId = linkedinUrl.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
    } else {
      linkId = linkedinUrl.trim();
    }
  } catch (error) {
    throw new Error('LinkedIn URL formatı səhvdir');
  }

  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: linkId,
    premium: 'false',
  };

  console.log('🔄 ScrapingDog API call with params:', { ...params, api_key: api_key.substring(0, 8) + '***' });

  try {
    const response = await axios
      .get(url, { params: params })
      .then(function (response: any) {
        if (response.status === 200) {
          const data = response.data;
          console.log('✅ ScrapingDog API success');
          return { success: true, data: data };
        } else {
          console.log('❌ Request failed with status code: ' + response.status);
          return { success: false, error: 'Request failed with status code: ' + response.status };
        }
      })
      .catch(function (error: any) {
        console.error('❌ Error making the request: ' + error.message);

        if (error.message.includes('Unexpected token')) {
          return {
            success: false,
            error: 'API key limiti tükənib və ya səhvdir. Admin paneldə yeni key əlavə edin.',
            details: 'JSON parse xətası - API HTML qaytarır'
          };
        }

        return { success: false, error: error.message };
      });

    return response;
  } catch (error: any) {
    console.error('❌ ScrapingDog API error:', error.message);
    throw new Error('LinkedIn profil məlumatları əldə edilə bilmədi: ' + error.message);
  }
}

// Enhanced data transformation function with specialized data sources
function transformLinkedInData(scrapingdogData: any, rapidApiData: any = null) {
  console.log('�� Transforming LinkedIn data...');
  console.log('📊 ScrapingDog data type:', Array.isArray(scrapingdogData) ? 'Array' : typeof scrapingdogData);
  console.log('📊 RapidAPI skills data available:', !!rapidApiData?.skills);

  // Handle ScrapingDog array response format - the API returns an array with profile data
  let profileData = {};
  if (Array.isArray(scrapingdogData) && scrapingdogData.length > 0) {
    profileData = scrapingdogData[0];
    console.log('✅ Extracted profile from ScrapingDog array format');
    console.log('📊 Profile data keys:', Object.keys(profileData));
  } else if (scrapingdogData && typeof scrapingdogData === 'object') {
    profileData = scrapingdogData;
    console.log('✅ Using ScrapingDog object format');
  }

  // Use ScrapingDog as primary data source
  const combinedData: any = { ...profileData };

  // Transform personal info from ScrapingDog data
  const personalInfo = {
    firstName: combinedData.first_name || combinedData.firstName ||
               (combinedData.full_name || combinedData.fullName || combinedData.name || '').split(' ')[0] || '',
    lastName: combinedData.last_name || combinedData.lastName ||
              (combinedData.full_name || combinedData.fullName || combinedData.name || '').split(' ').slice(1).join(' ') || '',
    fullName: combinedData.full_name || combinedData.fullName || combinedData.name ||
              `${combinedData.first_name || ''} ${combinedData.last_name || ''}`.trim() ||
              combinedData.headline?.split(' at ')[0] || '',
    email: combinedData.email || combinedData.email_address || '',
    phone: combinedData.phone || combinedData.phone_number || combinedData.phoneNumber || '',
    location: combinedData.location || combinedData.city || combinedData.country ||
              combinedData.geo_location || combinedData.address ||
              `${combinedData.city || ''} ${combinedData.country || ''}`.trim(),
    profilePicture: combinedData.profile_photo || combinedData.profile_pic_url ||
                   combinedData.profilePicture || combinedData.image_url ||
                   combinedData.profile_image || combinedData.avatar_url || '',
    summary: combinedData.summary || combinedData.about || combinedData.headline ||
             combinedData.bio || combinedData.description || '',
    linkedin: combinedData.linkedin_url || combinedData.public_profile_url ||
              combinedData.profile_url ||
              (combinedData.public_identifier ? `https://linkedin.com/in/${combinedData.public_identifier}` : '') ||
              (combinedData.username ? `https://linkedin.com/in/${combinedData.username}` : ''),
    website: combinedData.website || combinedData.personal_website || combinedData.website_url || ''
  };

  // Transform experience from ScrapingDog data
  const experienceArray = combinedData.experience || combinedData.experiences || combinedData.work_experience || [];
  const experience = experienceArray.map((exp: any, index: number) => ({
    id: `exp-${Date.now()}-${index}`,
    company: exp.company_name || exp.company || exp.organization || exp.employer || '',
    position: exp.position || exp.title || exp.role || exp.job_title || exp.designation || '',
    startDate: exp.starts_at || exp.start_date || exp.startDate || exp.from || exp.start_year || '',
    endDate: exp.ends_at || exp.end_date || exp.endDate || exp.to || exp.end_year ||
             (exp.is_current || exp.current ? 'Hazırda' : ''),
    description: exp.summary || exp.description || exp.details || '',
    location: exp.location || exp.company_location || exp.workplace_location || ''
  })).filter((exp: any) => exp.company.trim() !== '' || exp.position.trim() !== '');

  // Transform education from ScrapingDog data
  const educationArray = combinedData.education || combinedData.educations || combinedData.schools || [];
  let education = educationArray.map((edu: any, index: number) => ({
    id: `edu-${Date.now()}-${index}`,
    institution: edu.college_name || edu.school || edu.institution || edu.university ||
                edu.school_name || edu.college || '',
    degree: edu.college_degree || edu.degree || edu.degree_name || edu.qualification ||
            edu.program || edu.field_of_study || '',
    field: edu.college_degree_field || edu.field_of_study || edu.field || edu.major ||
           edu.specialization || '',
    startDate: edu.college_duration?.split(' - ')[0] || edu.start_date || edu.startDate ||
               edu.start_year || '',
    endDate: edu.college_duration?.split(' - ')[1] || edu.end_date || edu.endDate ||
             edu.end_year || edu.graduation_year || '',
    description: edu.college_activity || edu.description || edu.activities ||
                edu.details || ''
  })).filter((edu: any) => edu.institution.trim() !== '');

  // If no education data, create placeholder
  if (education.length === 0) {
    education = [{
      id: `edu-placeholder-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    }];
  }

  // SKILLS: Use RapidAPI as primary source, fallback to ScrapingDog + text extraction
  let skills: any[] = [];

  // 1. First priority: RapidAPI skills (if available)
  if (rapidApiData?.skills && Array.isArray(rapidApiData.skills)) {
    console.log('✅ Using RapidAPI skills data');
    skills = rapidApiData.skills.map((skill: any, index: number) => ({
      id: `skill-rapidapi-${Date.now()}-${index}`,
      name: typeof skill === 'string' ? skill : skill.name || skill.skill || skill.title || '',
      level: typeof skill === 'object' ? (skill.level || skill.proficiency || 'Intermediate') : 'Intermediate'
    })).filter((skill: any) => skill.name.trim() !== '');
  }

  // 2. If no RapidAPI skills, use ScrapingDog skills
  if (skills.length === 0 && combinedData.skills) {
    console.log('📡 Using ScrapingDog skills data');
    const scrapingdogSkills = Array.isArray(combinedData.skills) ? combinedData.skills : [combinedData.skills];
    skills = scrapingdogSkills.map((skill: any, index: number) => ({
      id: `skill-scrapingdog-${Date.now()}-${index}`,
      name: typeof skill === 'string' ? skill : skill.name || skill.skill || '',
      level: typeof skill === 'object' ? (skill.level || 'Intermediate') : 'Intermediate'
    })).filter((skill: any) => skill.name.trim() !== '');
  }

  // 3. If still no skills, extract from experience text (ScrapingDog data)
  if (skills.length === 0) {
    console.log('🔍 Extracting skills from experience text');
    const skillsFromText = new Set<string>();

    experience.forEach((exp: any) => {
      const textToAnalyze = `${exp.description || ''} ${exp.position || ''} ${exp.company || ''}`.toLowerCase();

      // Enhanced skill detection patterns
      const skillPatterns = [
        // Programming Languages
        'java(?!script)', 'javascript', 'typescript', 'python', 'php', 'c#', 'c\\+\\+', 'ruby', 'go', 'rust', 'swift', 'kotlin',
        // Frontend
        'react', 'vue\\.js', 'angular', 'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'jquery',
        // Backend
        'node\\.js', 'express', 'django', 'flask', 'spring', 'laravel', 'symfony', 'rails',
        // Databases
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
        // Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'gitlab', 'github',
        // Tools & Methodologies
        'agile', 'scrum', 'jira', 'confluence', 'slack', 'teams', 'figma', 'adobe',
        // Business Skills
        'project management', 'team leadership', 'business analysis', 'problem solving',
        'communication', 'presentation', 'negotiation', 'strategic planning'
      ];

      skillPatterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = textToAnalyze.match(regex);
        if (matches) {
          matches.forEach(match => {
            let skillName = match.toLowerCase();
            if (skillName === 'node.js') skillName = 'Node.js';
            else if (skillName === 'vue.js') skillName = 'Vue.js';
            else if (skillName === 'c#') skillName = 'C#';
            else if (skillName === 'c++') skillName = 'C++';
            else skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
            skillsFromText.add(skillName);
          });
        }
      });
    });

    skills = Array.from(skillsFromText).map((skillName, index) => ({
      id: `skill-extracted-${Date.now()}-${index}`,
      name: skillName,
      level: 'Intermediate' as const
    }));
  }

  // 4. If still no skills, add basic skills
  if (skills.length === 0) {
    const basicSkills = ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management'];
    skills = basicSkills.map((skillName, index) => ({
      id: `skill-basic-${Date.now()}-${index}`,
      name: skillName,
      level: 'Advanced' as const
    }));
  }

  // Transform languages from ScrapingDog data
  let languages = (combinedData.languages || []).map((lang: any, index: number) => ({
    id: `lang-${Date.now()}-${index}`,
    name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
    proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || lang.level || 'Professional'
  })).filter((lang: any) => lang.name.trim() !== '');

  // Add default languages if none provided
  if (languages.length === 0) {
    languages = [
      { id: `lang-default-az-${Date.now()}`, name: 'Azərbaycan dili', proficiency: 'Native' },
      { id: `lang-default-en-${Date.now()}`, name: 'English', proficiency: 'Professional' }
    ];
  }

  // Transform projects from ScrapingDog data
  let projects = (combinedData.projects || []).map((proj: any, index: number) => ({
    id: `proj-${Date.now()}-${index}`,
    name: proj.title || proj.name || proj.project_name || '',
    description: proj.description || proj.summary || `${proj.title || ''} layihəsi`,
    startDate: proj.duration || proj.start_date || proj.startDate || '',
    endDate: proj.end_date || proj.endDate || '',
    skills: proj.skills || proj.technologies || '',
    url: proj.link || proj.url || proj.project_url || ''
  })).filter((proj: any) => proj.name.trim() !== '');

  // Add placeholder project if none
  if (projects.length === 0) {
    projects = [{
      id: `proj-placeholder-${Date.now()}`,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      skills: '',
      url: ''
    }];
  }

  // Transform certifications from ScrapingDog data
  let certifications = (combinedData.awards || combinedData.certification || combinedData.certifications || []).map((cert: any, index: number) => ({
    id: `cert-${Date.now()}-${index}`,
    name: cert.name || cert.title || cert.certification || '',
    issuer: cert.organization || cert.authority || cert.issuer || '',
    date: cert.duration || cert.start_date || cert.date || cert.issued_date || '',
    description: cert.summary || cert.description || ''
  })).filter((cert: any) => cert.name.trim() !== '');

  // Add placeholder certification if none
  if (certifications.length === 0) {
    certifications = [{
      id: `cert-placeholder-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      description: ''
    }];
  }

  // Transform volunteer experience from ScrapingDog data
  let volunteerExperience = (combinedData.volunteering || []).map((vol: any, index: number) => ({
    id: `vol-${Date.now()}-${index}`,
    organization: vol.organization || vol.company || '',
    role: vol.role || vol.title || vol.position || '',
    startDate: vol.start_date || vol.startDate || '',
    endDate: vol.end_date || vol.endDate || '',
    description: vol.description || vol.summary || '',
    cause: vol.cause || vol.topic || ''
  })).filter((vol: any) => vol.organization.trim() !== '' || vol.role.trim() !== '');

  console.log('📊 Transformation Results:');
  console.log(`- Personal Info: ${personalInfo.fullName} (ScrapingDog)`);
  console.log(`- Experience: ${experience.length} items (ScrapingDog)`);
  console.log(`- Education: ${education.length} items (ScrapingDog)`);
  console.log(`- Skills: ${skills.length} items (${rapidApiData?.skills ? 'RapidAPI' : 'ScrapingDog/Extracted'})`);
  console.log(`- Languages: ${languages.length} items (ScrapingDog)`);
  console.log(`- Projects: ${projects.length} items (ScrapingDog)`);
  console.log(`- Certifications: ${certifications.length} items (ScrapingDog)`);
  console.log(`- Volunteer: ${volunteerExperience.length} items (ScrapingDog)`);

  return {
    personalInfo,
    experience,
    education,
    skills,
    languages,
    projects,
    certifications,
    volunteerExperience
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 LinkedIn import API started');

    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
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
      const cleanUrl = url.replace(/\/$/, '');
      const match = cleanUrl.match(/\/in\/([^\/]+)/);
      return match ? match[1] : url;
    };

    const linkedinUsername = extractLinkedInUsername(linkedinUrl.trim());
    console.log('📝 LinkedIn username:', linkedinUsername);

    let scrapingdogData = null;
    let rapidApiSkillsData = null;

    // Call ScrapingDog API for ALL main data (experience, education, personal info, etc.)
    console.log('📡 ScrapingDog API çağırışı başlanır (əsas məlumatlar üçün)...');
    const scrapingdogResult = await callScrapingDogAPI(linkedinUsername);

    if (scrapingdogResult.success) {
      scrapingdogData = scrapingdogResult.data;
      console.log(`✅ ScrapingDog əsas məlumatlar alındı (${scrapingdogResult.attemptsCount} cəhddə)`);
    } else {
      console.warn(`⚠️ ScrapingDog API tamamilə uğursuz: ${scrapingdogResult.error}`);
    }

    // Call RapidAPI ONLY for skills data
    console.log('📡 RapidAPI çağırışı başlanır (YALNIZ skills üçün)...');
    const rapidApiSkillsResult = await callRapidAPIForSkills(linkedinUrl);

    if (rapidApiSkillsResult.success) {
      rapidApiSkillsData = rapidApiSkillsResult.data;
      console.log(`✅ RapidAPI skills data alındı (${rapidApiSkillsResult.attemptsCount} cəhddə)`);
    } else {
      console.warn(`⚠️ RapidAPI skills uğursuz: ${rapidApiSkillsResult.error}`);
    }

    // Check if we have main data from ScrapingDog
    if (!scrapingdogData) {
      return NextResponse.json(
        { error: 'LinkedIn profili əsas məlumatları alına bilmədi. ScrapingDog API-lər işləmir.' },
        { status: 404 }
      );
    }

    // Transform the combined data (ScrapingDog main + RapidAPI skills)
    const transformedData = transformLinkedInData(scrapingdogData, rapidApiSkillsData);

    // Enhanced debug logging for CV data
    console.log('🎉 LinkedIn Import SUCCESS! Transformed data:', {
      personalInfo: {
        fullName: transformedData.personalInfo.fullName,
        email: transformedData.personalInfo.email,
        location: transformedData.personalInfo.location,
        summary: transformedData.personalInfo.summary ? 'Present' : 'Missing'
      },
      experienceCount: transformedData.experience.length,
      educationCount: transformedData.education.length,
      skillsCount: transformedData.skills.length,
      projectsCount: transformedData.projects.length,
      certificationsCount: transformedData.certifications.length,
      languagesCount: transformedData.languages.length
    });

    // Create CV data structure
    const cvData = {
      userId: decoded.userId,
      title: `${transformedData.personalInfo.fullName || 'LinkedIn Import'} - CV`,
      ...transformedData,
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

    console.log('💾 CV created successfully:', newCV.id);

    // Return success with CV ID for redirection
    return NextResponse.json({
      success: true,
      message: 'LinkedIn profili uğurla import edildi və CV yaradıldı',
      cvId: newCV.id,
      profileData: {
        name: transformedData.personalInfo.fullName,
        headline: transformedData.personalInfo.summary,
        location: transformedData.personalInfo.location,
        experienceCount: transformedData.experience.length,
        educationCount: transformedData.education.length,
        skillsCount: transformedData.skills.length,
        projectsCount: transformedData.projects.length,
        certificationsCount: transformedData.certifications.length,
        dataSource: {
          scrapingdog: !!scrapingdogData,
          rapidapi: !!rapidApiSkillsData
        }
      },
      // IMPORTANT: Return transformed data for direct CV editor use
      transformedData: transformedData
    });

  } catch (error: any) {
    console.error('❌ LinkedIn import error:', error);

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
