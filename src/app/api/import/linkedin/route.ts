import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// RapidAPI configuration for skills enhancement
const RAPID_API_CONFIG = {
  key: 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4',
  host: 'fresh-linkedin-profile-data.p.rapidapi.com',
  url: 'https://fresh-linkedin-profile-data.p.rapidapi.com/get-extra-profile-data'
};

// ScrapingDog configuration
const SCRAPINGDOG_CONFIG = {
  apiKey: '6882894b855f5678d36484c8',
  url: 'https://api.scrapingdog.com/linkedin'
};

// Enhanced data transformation function
function transformLinkedInData(scrapingdogData: any, rapidApiData: any = null) {
  console.log('🔄 Transforming LinkedIn data...');
  console.log('📊 ScrapingDog data type:', Array.isArray(scrapingdogData) ? 'Array' : typeof scrapingdogData);
  console.log('📊 ScrapingDog raw data:', JSON.stringify(scrapingdogData, null, 2));
  console.log('📊 RapidAPI data keys:', Object.keys(rapidApiData || {}));

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

  // Combine data from both sources
  const combinedData: any = { ...profileData };

  if (rapidApiData) {
    // Enhance skills from RapidAPI
    if (rapidApiData.skills && Array.isArray(rapidApiData.skills)) {
      combinedData.skills = [...(combinedData.skills || []), ...rapidApiData.skills];
    }

    // Enhance experience details
    if (rapidApiData.experience && Array.isArray(rapidApiData.experience)) {
      combinedData.experience = rapidApiData.experience;
    }

    // Enhance education
    if (rapidApiData.education && Array.isArray(rapidApiData.education)) {
      combinedData.education = rapidApiData.education;
    }

    // Enhance projects
    if (rapidApiData.projects && Array.isArray(rapidApiData.projects)) {
      combinedData.projects = rapidApiData.projects;
    }

    // Enhance certifications
    if (rapidApiData.certifications && Array.isArray(rapidApiData.certifications)) {
      combinedData.certification = rapidApiData.certifications;
    }
  }

  // Transform personal info with enhanced field mappings for ScrapingDog format
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

  // Transform experience with enhanced mapping for ScrapingDog format
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

  // Transform education - if ScrapingDog education is empty, create basic structure
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

  // If no education data from ScrapingDog, create placeholder for user to fill
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

  // Transform skills - Enhanced skill extraction from experience data
  let skills: any[] = [];

  // Extract skills from experience summaries and position titles
  const skillsFromText = new Set<string>();

  // Add technical skills from experience summaries AND position titles
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
          // Normalize skill names
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

  // Convert to skills array
  skills.push(...Array.from(skillsFromText).map((skillName, index) => ({
    id: `skill-extracted-${Date.now()}-${index}`,
    name: skillName,
    level: 'Intermediate' as const
  })));

  // If no skills extracted, add some based on position titles
  if (skills.length === 0) {
    const positionBasedSkills = new Set<string>();
    experience.forEach((exp: any) => {
      const position = exp.position.toLowerCase();
      if (position.includes('developer') || position.includes('programmer')) {
        positionBasedSkills.add('Software Development');
        positionBasedSkills.add('Problem Solving');
      }
      if (position.includes('frontend') || position.includes('front-end')) {
        positionBasedSkills.add('HTML');
        positionBasedSkills.add('CSS');
        positionBasedSkills.add('JavaScript');
      }
      if (position.includes('backend') || position.includes('back-end')) {
        positionBasedSkills.add('Server Development');
        positionBasedSkills.add('Database Management');
      }
      if (position.includes('fullstack') || position.includes('full-stack')) {
        positionBasedSkills.add('Full-Stack Development');
        positionBasedSkills.add('API Development');
      }
      if (position.includes('manager') || position.includes('lead')) {
        positionBasedSkills.add('Team Leadership');
        positionBasedSkills.add('Project Management');
      }
      if (position.includes('designer') || position.includes('ui') || position.includes('ux')) {
        positionBasedSkills.add('UI/UX Design');
        positionBasedSkills.add('User Experience');
      }
      if (position.includes('analyst') || position.includes('consultant')) {
        positionBasedSkills.add('Business Analysis');
        positionBasedSkills.add('Data Analysis');
      }
    });

    skills.push(...Array.from(positionBasedSkills).map((skillName, index) => ({
      id: `skill-position-${Date.now()}-${index}`,
      name: skillName,
      level: 'Intermediate' as const
    })));
  }

  // If still no skills, add basic professional skills
  if (skills.length === 0) {
    const basicSkills = ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management'];
    skills.push(...basicSkills.map((skillName, index) => ({
      id: `skill-basic-${Date.now()}-${index}`,
      name: skillName,
      level: 'Advanced' as const
    })));
  }

  // Transform languages - add default if none provided
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

  // Transform projects - create placeholder if none
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

  // Transform certifications/awards - create placeholder if none
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

  // Transform volunteer experience - create placeholder if none
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
  console.log(`- Personal Info: ${personalInfo.fullName}`);
  console.log(`- Experience: ${experience.length} items`);
  console.log(`- Education: ${education.length} items`);
  console.log(`- Skills: ${skills.length} items`);
  console.log(`- Languages: ${languages.length} items`);
  console.log(`- Projects: ${projects.length} items`);
  console.log(`- Certifications: ${certifications.length} items`);
  console.log(`- Volunteer: ${volunteerExperience.length} items`);

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
    let rapidApiData = null;

    // Call ScrapingDog API
    try {
      console.log('📡 Calling ScrapingDog API...');
      const scrapingdogParams = {
        api_key: SCRAPINGDOG_CONFIG.apiKey,
        type: 'profile',
        linkId: linkedinUsername,
        premium: 'false',
      };

      const scrapingdogResponse = await axios.get(SCRAPINGDOG_CONFIG.url, {
        params: scrapingdogParams,
        timeout: 30000
      });

      if (scrapingdogResponse.status === 200 && scrapingdogResponse.data) {
        scrapingdogData = scrapingdogResponse.data;
        console.log('✅ ScrapingDog data received');
      }
    } catch (error: any) {
      console.warn('⚠️ ScrapingDog API failed:', error.message);
    }

    // Call RapidAPI for enhanced data
    try {
      console.log('📡 Calling RapidAPI for enhanced data...');
      const rapidApiResponse = await axios.get(RAPID_API_CONFIG.url, {
        params: {
          linkedin_url: linkedinUrl
        },
        headers: {
          'x-rapidapi-key': RAPID_API_CONFIG.key,
          'x-rapidapi-host': RAPID_API_CONFIG.host
        },
        timeout: 25000
      });

      if (rapidApiResponse.status === 200 && rapidApiResponse.data) {
        rapidApiData = rapidApiResponse.data;
        console.log('✅ RapidAPI data received');
      }
    } catch (error: any) {
      console.warn('⚠️ RapidAPI failed:', error.message);
    }

    // Check if we have any data
    if (!scrapingdogData && !rapidApiData) {
      return NextResponse.json(
        { error: 'LinkedIn profili məlumatları alına bilmədi. URL-i yoxlayın və yenidən cəhd edin.' },
        { status: 404 }
      );
    }

    // Transform the combined data
    const transformedData = transformLinkedInData(scrapingdogData, rapidApiData);

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
          rapidapi: !!rapidApiData
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
