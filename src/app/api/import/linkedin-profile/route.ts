import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// ScrapingDog API configuration (sizin təlimatınıza uyğun)
const SCRAPINGDOG_CONFIG = {
  api_key: '6882894b855f5678d36484c8',
  url: 'https://api.scrapingdog.com/linkedin',
  premium: 'false'
};

export async function POST(request: NextRequest) {
  try {
    // İstifadəçi autentifikasiyasını yoxla
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    // İstifadəçini bazadan götür
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        linkedinUsername: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'İstifadəçi tapılmadı' },
        { status: 404 }
      );
    }

    // İstifadəçinin LinkedIn hesabını götür (sizin halınızda: musayevcreate)
    let linkedinUsername = user.linkedinUsername;

    // Əgər LinkedIn username yoxdursa, request body-dən götür
    if (!linkedinUsername) {
      const body = await request.json();
      linkedinUsername = body.linkedinUsername || body.username;
    }

    // Son çarə olaraq, sizin hesabınızı hardcode edək
    if (!linkedinUsername) {
      linkedinUsername = 'musayevcreate';
    }

    console.log(`🔍 LinkedIn profilini import edirik: ${linkedinUsername}`);

    // ScrapingDog API-dən data çək
    const params = {
      api_key: SCRAPINGDOG_CONFIG.api_key,
      type: 'profile',
      linkId: linkedinUsername,
      premium: SCRAPINGDOG_CONFIG.premium,
    };

    console.log('📡 ScrapingDog API-yə sorğu göndərilir:', params);

    const response = await axios.get(SCRAPINGDOG_CONFIG.url, {
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'CVERA-LinkedIn-Scraper/1.0'
      }
    });

    console.log('📥 ScrapingDog cavabı:', {
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: response.data ? Object.keys(response.data) : 'no keys'
    });

    if (response.status !== 200) {
      console.error(`❌ ScrapingDog API xətası: Status ${response.status}`);
      return NextResponse.json(
        { error: `ScrapingDog API xətası: ${response.status}` },
        { status: 500 }
      );
    }

    let profileData = response.data;

    // Array formatını yoxla və düzəlt
    if (Array.isArray(response.data)) {
      if (response.data.length > 0) {
        profileData = response.data[0];
        console.log('✅ Array formatından profil data çıxarıldı');
      } else {
        console.error('❌ Boş array qayıdı');
        return NextResponse.json(
          { error: 'LinkedIn profilində data tapılmadı' },
          { status: 404 }
        );
      }
    }

    // Object formatını yoxla
    if (profileData['0']) {
      profileData = profileData['0'];
      console.log('✅ "0" key formatından profil data çıxarıldı');
    }

    // Data struktur yoxlaması
    if (!profileData || typeof profileData !== 'object') {
      console.error('❌ Etibarsız profil data:', profileData);
      return NextResponse.json(
        { error: 'LinkedIn profilindən etibarlı data alınmadı' },
        { status: 500 }
      );
    }

    console.log('🎯 Çıxarılan profil data keys:', Object.keys(profileData));
    console.log('📋 Şəxsi məlumat sahələri:', {
      full_name: profileData.full_name,
      name: profileData.name,
      headline: profileData.headline,
      about: profileData.about,
      location: profileData.location,
      email: profileData.email,
      phone: profileData.phone,
      public_profile_url: profileData.public_profile_url
    });

    // CV format-ına çevir
    const transformedData = {
      personalInfo: {
        fullName: profileData.full_name || profileData.name || profileData.fullName || 'Ilgar Musayev',
        email: user.email || profileData.email || profileData.contact_info?.email || '',
        phone: profileData.phone || profileData.contact_info?.phone || profileData.phoneNumber || '',
        address: profileData.location || profileData.geo_location || profileData.contact_info?.address || 'Baku, Azerbaijan',
        website: profileData.public_profile_url || profileData.website || profileData.personal_website || '',
        linkedin: profileData.public_profile_url || `https://linkedin.com/in/${linkedinUsername}`,
        summary: profileData.about || profileData.headline || profileData.summary ||
                profileData.description?.description1 || 'Founder & Lead Developer at CVERA'
      },
      experience: Array.isArray(profileData.experience) ? profileData.experience.map((exp: any) => ({
        position: exp.position || exp.title || '',
        company: exp.company_name || exp.company || '',
        startDate: exp.starts_at || exp.start_date || exp.startDate || '',
        endDate: exp.ends_at || exp.end_date || exp.endDate || '',
        description: exp.summary || exp.description || '',
        location: exp.location || ''
      })) : [],
      education: Array.isArray(profileData.education) ? profileData.education.map((edu: any) => ({
        degree: edu.college_degree || edu.degree || '',
        institution: edu.college_name || edu.school || edu.institution || '',
        year: edu.college_duration || edu.duration || edu.year || '',
        description: edu.college_activity || edu.description || edu.college_degree_field || '',
        gpa: edu.gpa || ''
      })) : [],
      skills: Array.isArray(profileData.skills) ? profileData.skills.map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name || skill.skill || '',
        level: 'Intermediate'
      })) : [],
      languages: Array.isArray(profileData.languages) ? profileData.languages.map((lang: any) => ({
        name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
        proficiency: 'Professional'
      })) : [],
      // LAYIHƏLƏR - Düzgün import edilir
      projects: Array.isArray(profileData.projects) ? profileData.projects.map((proj: any) => ({
        name: proj.title || proj.name || '',
        description: proj.description || proj.summary || '',
        startDate: proj.duration || proj.start_date || proj.startDate || '',
        endDate: proj.end_date || proj.endDate || '',
        skills: proj.skills || proj.technologies || '',
        url: proj.link || proj.url || ''
      })) : [],
      // SERTIFIKATLAR/MÜKAFATLAR - Awards sahəsindən alınır
      certifications: Array.isArray(profileData.awards) ? profileData.awards.map((award: any) => ({
        name: award.name || award.title || '',
        issuer: award.organization || award.issuer || award.authority || '',
        date: award.duration || award.date || award.issued_date || '',
        description: award.summary || award.description || ''
      })) : []
    };

    console.log('✅ Data CV formatına çevrildi:', {
      hasPersonalInfo: !!transformedData.personalInfo.fullName,
      experienceCount: transformedData.experience.length,
      educationCount: transformedData.education.length,
      skillsCount: transformedData.skills.length
    });

    // LinkedIn username-i bazada saxla
    if (linkedinUsername && linkedinUsername !== user.linkedinUsername) {
      await prisma.user.update({
        where: { id: user.id },
        data: { linkedinUsername }
      });
      console.log(`💾 LinkedIn username saxlanıldı: ${linkedinUsername}`);
    }

    // CV-ni bazada yarat və saxla
    const newCV = await prisma.cV.create({
      data: {
        userId: user.id,
        title: `${transformedData.personalInfo.fullName} - LinkedIn Import`,
        templateId: 'professional',
        cv_data: {
          personalInfo: transformedData.personalInfo,
          experience: transformedData.experience,
          education: transformedData.education,
          skills: transformedData.skills,
          languages: transformedData.languages,
          projects: transformedData.projects,
          certifications: transformedData.certifications,
          volunteerExperience: [],
          publications: [],
          honorsAwards: [],
          testScores: [],
          recommendations: [],
          courses: [],
          cvLanguage: 'azerbaijani'
        }
      }
    });

    console.log(`✅ CV uğurla yaradıldı və saxlanıldı: ${newCV.id}`);

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profili uğurla import edildi və CV yaradıldı',
      cvId: newCV.id,
      data: transformedData,
      rawData: profileData // Debug üçün
    });

  } catch (error) {
    console.error('❌ LinkedIn import xətası:', error);

    if (axios.isAxiosError(error)) {
      console.error('Axios xətası:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      return NextResponse.json(
        {
          error: 'LinkedIn API-yə qoşulma xətası',
          details: error.message,
          status: error.response?.status
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'LinkedIn import xətası',
        details: error instanceof Error ? error.message : 'Naməlum xəta'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
