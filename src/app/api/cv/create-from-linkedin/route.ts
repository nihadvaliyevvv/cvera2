import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';
import { checkCVCreationLimit, incrementCVUsage, getLimitMessage } from '@/lib/cvLimits';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Etibarsız token' },
        { status: 401 }
      );
    }

    // Check CV creation limits before proceeding
    const limits = await checkCVCreationLimit(decoded.userId);

    if (!limits.canCreate) {
      return NextResponse.json(
        {
          error: 'CV yaratma limiti dolmuşdur',
          message: getLimitMessage(limits),
          limits: {
            currentCount: limits.currentCount,
            limit: limits.limit,
            tierName: limits.tierName,
            resetTime: limits.resetTime
          }
        },
        { status: 403 }
      );
    }

    const { profileData } = await request.json();

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profil məlumatları tələb olunur' },
        { status: 400 }
      );
    }

    console.log('🔄 Creating CV from LinkedIn profile data:', profileData);

    // Handle array format from ScrapingDog API
    let profile = profileData;
    if (Array.isArray(profileData) && profileData.length > 0) {
      profile = profileData[0];
      console.log('✅ Extracted profile data from array format');
    } else if (profileData.profile) {
      profile = profileData.profile;
    }

    console.log('🎯 Processing profile fields:');
    console.log('- Full name:', profile.full_name);
    console.log('- About:', profile.about ? 'Present' : 'Missing');
    console.log('- Experience:', profile.experience ? profile.experience.length + ' items' : 'Missing');
    console.log('- Education:', profile.education ? profile.education.length + ' items' : 'Missing');
    console.log('- Awards:', profile.awards ? profile.awards.length + ' items' : 'Missing');
    console.log('- Skills:', profile.skills ? profile.skills.length + ' items' : 'Missing');

    // Ensure we have at least the full name
    if (!profile.full_name && !profile.name) {
      console.log('⚠️ Warning: No name field found in profile data');
      console.log('Available fields:', Object.keys(profile));
    }

    // Create new CV with properly transformed LinkedIn data
    const cv = await prisma.cV.create({
      data: {
        userId: decoded.userId,
        title: `${profile.full_name || profile.name || 'LinkedIn Import'} - CV`,
        templateId: 'professional',
        cv_data: {
          personalInfo: {
            fullName: profile.full_name || profile.name || '',
            email: '', // Will be filled in editor
            phone: '', // Will be filled in editor
            address: profile.location || '',
            website: profile.public_profile_url || '',
            linkedin: profile.public_profile_url || '',
            summary: profile.about || profile.headline || profile.summary || ''
          },
          experience: (profile.experience || []).map((exp: any) => ({
            position: exp.position || exp.title || '',
            company: exp.company_name || exp.company || '',
            startDate: exp.starts_at || exp.start_date || exp.startDate || '',
            endDate: exp.ends_at || exp.end_date || exp.endDate || '',
            description: exp.summary || exp.description || '',
            location: exp.location || ''
          })),
          education: (profile.education || []).map((edu: any) => ({
            degree: edu.college_degree || edu.degree || '',
            institution: edu.college_name || edu.school || edu.institution || '',
            year: edu.college_duration || edu.duration || edu.year || '',
            description: edu.college_activity || edu.description || '',
            gpa: edu.gpa || ''
          })),
          skills: profile.skills ?
            (Array.isArray(profile.skills) ?
              profile.skills.map((skill: any) => ({
                name: typeof skill === 'string' ? skill : skill.name || skill.skill || '',
                level: 'Intermediate' as const
              })) : []
            ) : [],
          languages: (profile.languages || []).map((lang: any) => ({
            name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
            proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || 'Professional'
          })),
          projects: (profile.projects || []).map((proj: any) => ({
            name: proj.title || proj.name || '',
            description: proj.description || proj.summary || '',
            startDate: proj.duration || proj.start_date || proj.startDate || '',
            endDate: proj.end_date || proj.endDate || '',
            skills: proj.skills || '',
            url: proj.link || proj.url || ''
          })),
          certifications: (profile.certification || profile.certifications || []).map((cert: any) => ({
            name: cert.name || cert.title || cert.certification || '',
            issuer: cert.authority || cert.issuer || cert.organization || '',
            date: cert.start_date || cert.date || cert.issued_date || '',
            description: cert.description || ''
          })),
          volunteerExperience: (profile.volunteering || profile.volunteerExperience || []).map((vol: any) => ({
            organization: vol.organization || vol.company || '',
            role: vol.role || vol.title || vol.position || '',
            startDate: vol.start_date || vol.startDate || vol.date_range || '',
            endDate: vol.end_date || vol.endDate || '',
            description: vol.description || '',
            cause: vol.cause || vol.topic || ''
          })),
          publications: (profile.publications || []).map((pub: any) => ({
            title: pub.title || pub.name || '',
            publisher: pub.publisher || pub.publication || '',
            date: pub.date || pub.published_date || '',
            description: pub.description || '',
            url: pub.url || ''
          })),
          honorsAwards: (profile.awards || profile.honorsAwards || []).map((award: any) => ({
            title: award.name || award.title || '',
            issuer: award.organization || award.issuer || award.authority || '',
            date: award.duration || award.date || award.issued_date || '',
            description: award.summary || award.description || ''
          })),
          testScores: [],
          recommendations: [],
          courses: [],
          cvLanguage: 'azerbaijani'
        }
      }
    });

    // Increment usage counter after successful CV creation
    await incrementCVUsage(decoded.userId);

    console.log('✅ CV successfully created from LinkedIn data:', cv.id);

    // Get updated limits for response
    const updatedLimits = await checkCVCreationLimit(decoded.userId);

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      message: 'CV LinkedIn məlumatlarından uğurla yaradıldı',
      limits: {
        currentCount: updatedLimits.currentCount,
        limit: updatedLimits.limit,
        tierName: updatedLimits.tierName,
        canCreateMore: updatedLimits.canCreate,
        limitMessage: getLimitMessage(updatedLimits)
      }
    });

  } catch (error) {
    console.error('💥 LinkedIn CV creation error:', error);
    return NextResponse.json(
      { error: 'CV yaradılarkən xəta baş verdi' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
