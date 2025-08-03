import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

// Type definitions for CV data structures
interface Experience {
  id?: string;
  company?: string;
  position?: string;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string;
}

interface Education {
  id?: string;
  institution?: string;
  school?: string;
  degree?: string;
  qualification?: string;
  field?: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  description?: string;
  achievements?: string;
}

interface Project {
  id?: string;
  name?: string;
  title?: string;
  technologies?: string;
  description?: string;
  role?: string;
  achievements?: string;
}

const prisma = new PrismaClient();
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PROFESSIONAL_TERMS: Record<string, Record<string, string>> = {
  azerbaijani: {
    // Job titles and positions
    'Manager': 'Menecer',
    'Senior': 'Böyük',
    'Junior': 'Kiçik',
    'Lead': 'Aparıcı',
    'Director': 'Direktor',
    'Supervisor': 'Nəzarətçi',
    'Coordinator': 'Koordinator',
    'Specialist': 'Mütəxəssis',
    'Analyst': 'Analitik',
    'Developer': 'Proqramçı',
    'Engineer': 'Mühəndis',
    'Designer': 'Dizayner',
    'Consultant': 'Məsləhətçi',
    'Administrator': 'Administrator',
    'Assistant': 'Köməkçi',
    'Executive': 'İcraçı',
    'Officer': 'Məsul şəxs',
    'Representative': 'Nümayəndə',
    'Trainee': 'Stajyer',
    'Intern': 'Təcrübəçi',

    // Professional skills
    'Leadership': 'Liderlik',
    'Management': 'İdarəetmə',
    'Communication': 'Ünsiyyət',
    'Teamwork': 'Komanda işi',
    'Problem Solving': 'Problem həlli',
    'Critical Thinking': 'Tənqidi təfəkkür',
    'Time Management': 'Vaxt idarəetməsi',
    'Project Management': 'Layihə idarəetməsi',
    'Strategic Planning': 'Strateji planlaşdırma',
    'Customer Service': 'Müştəri xidməti',
    'Sales': 'Satış',
    'Marketing': 'Marketinq',
    'Research': 'Tədqiqat',
    'Analysis': 'Analiz',
    'Presentation': 'Təqdimat',
    'Negotiation': 'Danışıqlar',
    'Training': 'Təlim',
    'Mentoring': 'Mentorluq',
    'Innovation': 'İnnovasiya',
    'Quality Assurance': 'Keyfiyyət təminatı'
  },
  english: {
    // Job titles and positions (Azerbaijani to English)
    'Menecer': 'Manager',
    'Böyük': 'Senior',
    'Kiçik': 'Junior',
    'Aparıcı': 'Lead',
    'Direktor': 'Director',
    'Nəzarətçi': 'Supervisor',
    'Koordinator': 'Coordinator',
    'Mütəxəssis': 'Specialist',
    'Analitik': 'Analyst',
    'Proqramçı': 'Developer',
    'Mühəndis': 'Engineer',
    'Dizayner': 'Designer',
    'Məsləhətçi': 'Consultant',
    'Administrator': 'Administrator',
    'Köməkçi': 'Assistant',
    'İcraçı': 'Executive',
    'Məsul şəxs': 'Officer',
    'Nümayəndə': 'Representative',
    'Stajyer': 'Trainee',
    'Təcrübəçi': 'Intern',

    // Professional skills (Azerbaijani to English)
    'Liderlik': 'Leadership',
    'İdarəetmə': 'Management',
    'Ünsiyyət': 'Communication',
    'Komanda işi': 'Teamwork',
    'Problem həlli': 'Problem Solving',
    'Tənqidi təfəkkür': 'Critical Thinking',
    'Vaxt idarəetməsi': 'Time Management',
    'Layihə idarəetməsi': 'Project Management',
    'Strateji planlaşdırma': 'Strategic Planning',
    'Müştəri xidməti': 'Customer Service',
    'Satış': 'Sales',
    'Marketinq': 'Marketing',
    'Tədqiqat': 'Research',
    'Analiz': 'Analysis',
    'Təqdimat': 'Presentation',
    'Danışıqlar': 'Negotiation',
    'Təlim': 'Training',
    'Mentorluq': 'Mentoring',
    'İnnovasiya': 'Innovation',
    'Keyfiyyət təminatı': 'Quality Assurance'
  }
};

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value ||
                  request.cookies.get('auth-token')?.value ||
                  request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the JWT token
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { cvId, targetLanguage } = await request.json();

    if (!cvId || !targetLanguage) {
      return NextResponse.json({ error: 'CV ID and target language are required' }, { status: 400 });
    }

    if (!['azerbaijani', 'english'].includes(targetLanguage)) {
      return NextResponse.json({ error: 'Target language must be azerbaijani or english' }, { status: 400 });
    }

    // Check user tier - AI translation is for Premium and Medium users
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tier: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can use AI features
    const canUseAI = user.tier === 'Premium' || user.tier === 'Medium';
    if (!canUseAI) {
      return NextResponse.json({
        error: 'AI translation is available for Premium and Medium subscribers only'
      }, { status: 403 });
    }

    // Get CV data
    const cv = await prisma.cV.findUnique({
      where: { id: cvId, userId: payload.userId },
      select: { cv_data: true }
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cvData = cv.cv_data as any;

    console.log('🌍 Starting comprehensive AI translation to:', targetLanguage);

    // Create enhanced professional translation prompt
    const isAzerbaijani = targetLanguage === 'azerbaijani';
    const targetLangName = isAzerbaijani ? 'Azerbaijani (Azərbaycan dili)' : 'English (Professional/Business)';

    const prompt = `
      PROFESSIONAL CV COMPREHENSIVE TRANSLATION SERVICE
      ===============================================
      
      You are an expert professional CV translator specializing in career documents with deep knowledge of both Azerbaijani and English business terminology. 
      
      TRANSLATION TARGET: ${targetLangName}
      
      COMPREHENSIVE TRANSLATION REQUIREMENTS:
      =====================================
      
      1. SECTION NAMES: Translate ALL section headers and titles
      2. CONTENT: Translate ALL textual content while maintaining professional quality
      3. TERMINOLOGY: Use appropriate business/professional terminology for target language
      4. CULTURAL ADAPTATION: Adapt content for target language professional culture
      5. CONSISTENCY: Maintain consistent terminology throughout the document
      6. IMPACT PRESERVATION: Keep the professional impact and meaning of statements
      
      SPECIFIC RULES:
      ==============
      
      ✅ TRANSLATE:
      - All section names and headers
      - Job titles and positions (using professional equivalents)
      - Job descriptions and responsibilities
      - Educational descriptions
      - Project descriptions
      - Skill names (soft skills and general professional skills)
      - Certification descriptions
      - Personal summary/objective
      - Achievement descriptions
      - All narrative text
      
      ❌ KEEP ORIGINAL:
      - Company names (Google, Microsoft, etc.)
      - Institution names (Harvard University, etc.)
      - Programming languages (JavaScript, Python, etc.)
      - Software names (Adobe Photoshop, AutoCAD, etc.)
      - Technical frameworks (React, Angular, etc.)
      - Certification brand names (AWS, Microsoft Azure, etc.)
      - Dates and numbers
      - URLs and email addresses
      - Proper nouns (names of specific technologies, brands)
      
      ${isAzerbaijani ? `
      AZERBAIJANI TRANSLATION SPECIFICS:
      =================================
      - Use formal business Azerbaijani
      - Employ professional terminology appropriate for CV context
      - Maintain respectful and formal tone throughout
      - Use appropriate honorifics and professional language
      - Adapt Western business concepts to Azerbaijani professional culture
      - Use correct Azerbaijani grammar and sentence structure
      - Translate soft skills to culturally appropriate equivalents
      ` : `
      ENGLISH TRANSLATION SPECIFICS:
      =============================
      - Use professional business English
      - Employ industry-standard terminology
      - Maintain formal and professional tone
      - Use action-oriented language for achievements
      - Follow Western CV writing conventions
      - Use appropriate professional jargon
      - Ensure grammatical accuracy and fluency
      `}
      
      CV CONTENT TO TRANSLATE:
      =======================
      
      PERSONAL INFORMATION SECTION:
      Summary/Objective: ${cvData.personalInfo?.summary || 'No summary provided'}
      
      WORK EXPERIENCE SECTION:
      ${(cvData.experience as Experience[] || []).map((exp, index) => 
        `${index + 1}. Position: ${exp.position || exp.title || 'Not specified'}
           Company: ${exp.company || 'Not specified'} (KEEP UNCHANGED)
           Location: ${exp.location || 'Not specified'}
           Description: ${exp.description || 'No description provided'}
           Key Achievements: ${exp.achievements || 'No achievements listed'}`
      ).join('\n')}
      
      EDUCATION SECTION:
      ${(cvData.education as Education[] || []).map((edu, index) => 
        `${index + 1}. Degree: ${edu.degree || 'Not specified'}
           Field of Study: ${edu.field || edu.fieldOfStudy || 'Not specified'}
           Institution: ${edu.institution || edu.school || 'Not specified'} (KEEP UNCHANGED)
           Location: ${edu.location || 'Not specified'}
           Description: ${edu.description || 'No description provided'}
           Achievements: ${edu.achievements || 'No achievements listed'}`
      ).join('\n')}
      
      PROJECTS SECTION:
      ${(cvData.projects as Project[] || []).map((proj, index) => 
        `${index + 1}. Project Name: ${proj.name || proj.title || 'Not specified'}
           Technologies: ${proj.technologies || 'Not specified'} (Keep technical terms)
           Description: ${proj.description || 'No description provided'}
           Role: ${proj.role || 'Not specified'}
           Achievements: ${proj.achievements || 'No achievements listed'}`
      ).join('\n')}
      
      SKILLS SECTION:
      Technical Skills: ${(cvData.skills || []).filter((skill: any) => 
        typeof skill === 'string' ? 
        /javascript|python|java|react|angular|css|html|sql|aws|azure/i.test(skill) :
        /javascript|python|java|react|angular|css|html|sql|aws|azure/i.test(skill.name || '')
      ).map((skill: any) => typeof skill === 'string' ? skill : skill.name).join(', ')}
      
      Soft Skills: ${(cvData.skills || []).filter((skill: any) => 
        typeof skill === 'string' ? 
        !/javascript|python|java|react|angular|css|html|sql|aws|azure/i.test(skill) :
        !/javascript|python|java|react|angular|css|html|sql|aws|azure/i.test(skill.name || '')
      ).map((skill: any) => typeof skill === 'string' ? skill : skill.name).join(', ')}
      
      CERTIFICATIONS SECTION:
      ${(cvData.certifications || []).map((cert: any, index: number) => 
        `${index + 1}. Certificate Name: ${cert.name || 'Not specified'}
           Issuer: ${cert.issuer || 'Not specified'} (KEEP UNCHANGED)
           Date: ${cert.date || 'Not specified'}
           Description: ${cert.description || 'No description provided'}`
      ).join('\n')}
      
      VOLUNTEER EXPERIENCE SECTION:
      ${(cvData.volunteerExperience || []).map((vol: any, index: number) => 
        `${index + 1}. Role: ${vol.role || 'Not specified'}
           Organization: ${vol.organization || 'Not specified'} (KEEP UNCHANGED)
           Location: ${vol.location || 'Not specified'}
           Description: ${vol.description || 'No description provided'}
           Impact: ${vol.impact || 'No impact mentioned'}`
      ).join('\n')}
      
      LANGUAGES SECTION:
      ${(cvData.languages || []).map((lang: any, index: number) => 
        `${index + 1}. Language: ${lang.name || lang} 
           Proficiency: ${lang.level || 'Not specified'}`
      ).join('\n')}
      
      AWARDS SECTION:
      ${(cvData.awards || []).map((award: any, index: number) => 
        `${index + 1}. Award: ${award.name || award.title || 'Not specified'}
           Issuer: ${award.issuer || 'Not specified'} (KEEP UNCHANGED)
           Description: ${award.description || 'No description provided'}`
      ).join('\n')}
      
      RESPONSE FORMAT:
      ===============
      Return the translated content in this exact JSON format with ALL sections translated:
      
      {
        "sectionNames": {
          "personalInfo": "Translated section name",
          "experience": "Translated section name",
          "education": "Translated section name",
          "skills": "Translated section name",
          "projects": "Translated section name",
          "certifications": "Translated section name",
          "volunteerExperience": "Translated section name",
          "languages": "Translated section name",
          "awards": "Translated section name"
        },
        "personalInfo": {
          "summary": "Fully translated professional summary with impact and professional terminology"
        },
        "experience": [
          {
            "position": "Translated position title using professional equivalent",
            "location": "Translated location if applicable",
            "description": "Fully translated job description with professional terminology and impact statements",
            "achievements": "Translated achievements with quantifiable results where possible"
          }
        ],
        "education": [
          {
            "degree": "Translated degree name using educational terminology",
            "field": "Translated field of study",
            "location": "Translated location if applicable", 
            "description": "Translated education description",
            "achievements": "Translated academic achievements"
          }
        ],
        "projects": [
          {
            "name": "Translated project name (if not technical)",
            "role": "Translated role/position in project",
            "description": "Fully translated project description with technical and business context",
            "achievements": "Translated project achievements and impact"
          }
        ],
        "skills": [
          {
            "name": "Translated skill name (keep technical terms, translate soft skills)",
            "category": "Translated skill category if applicable"
          }
        ],
        "certifications": [
          {
            "name": "Translated certification name (if general term, keep specific brand names)",
            "description": "Translated certification description with professional context"
          }
        ],
        "volunteerExperience": [
          {
            "role": "Translated volunteer role with appropriate terminology",
            "description": "Translated volunteer description with impact and skills demonstrated",
            "impact": "Translated impact statement with quantifiable results"
          }
        ],
        "languages": [
          {
            "name": "Language name in target language",
            "level": "Translated proficiency level using standard terms"
          }
        ],
        "awards": [
          {
            "name": "Translated award name (if general term)",
            "description": "Translated award description with achievement context"
          }
        ]
      }
      
      CRITICAL QUALITY REQUIREMENTS:
      =============================
      - COMPREHENSIVE: Translate EVERYTHING that should be translated
      - PROFESSIONAL: Use appropriate business/professional terminology
      - CONSISTENT: Maintain consistent terminology throughout
      - CULTURAL: Adapt to target language professional norms
      - ACCURATE: Preserve meaning and professional impact
      - COMPLETE: Include ALL sections with translations
      - NATURAL: Sound natural and fluent in target language
      
      ${isAzerbaijani ? 
        'Azərbaycan dilində peşəkar və rəsmi ton istifadə edin. Bütün məzmunu hərtərəfli tərcümə edin.' :
        'Use professional and formal English tone. Translate all content comprehensively.'
      }
    `;

    const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text().trim();

    console.log('🔍 AI Comprehensive Translation Response received');

    // Parse AI response with fixed regex
    let translatedContent;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return NextResponse.json({ error: 'Failed to parse translation results' }, { status: 500 });
      }

      translatedContent = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ Failed to parse AI translation response:', parseError);
      return NextResponse.json({ error: 'Failed to parse translation results' }, { status: 500 });
    }

    // Apply comprehensive translations to the original CV data
    const translatedCvData = { ...cvData };

    // Add section name translations
    if (translatedContent.sectionNames) {
      translatedCvData.sectionNames = translatedContent.sectionNames;
    }

    // Apply professional terminology enhancements
    const applyTerminologyEnhancement = (text: string, targetLang: string): string => {
      if (!text) return text;

      let enhancedText = text;
      const terms = PROFESSIONAL_TERMS[targetLang] || {};

      Object.entries(terms).forEach(([original, translation]) => {
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        enhancedText = enhancedText.replace(regex, translation);
      });

      return enhancedText;
    };

    // Translate personal info with enhanced terminology
    if (translatedContent.personalInfo?.summary) {
      translatedCvData.personalInfo.summary = applyTerminologyEnhancement(
        translatedContent.personalInfo.summary,
        targetLanguage
      );
    }

    // Translate experience with comprehensive coverage
    if (translatedContent.experience && Array.isArray(translatedContent.experience)) {
      translatedContent.experience.forEach((translatedExp: any, index: number) => {
        if (translatedCvData.experience[index]) {
          Object.keys(translatedExp).forEach((key: string) => {
            if (translatedExp[key]) {
              translatedCvData.experience[index][key] = applyTerminologyEnhancement(
                translatedExp[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Translate education comprehensively
    if (translatedContent.education && Array.isArray(translatedContent.education)) {
      translatedContent.education.forEach((translatedEdu: any, index: number) => {
        if (translatedCvData.education[index]) {
          Object.keys(translatedEdu).forEach((key: string) => {
            if (translatedEdu[key]) {
              translatedCvData.education[index][key] = applyTerminologyEnhancement(
                translatedEdu[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Translate projects with technical awareness
    if (translatedContent.projects && Array.isArray(translatedContent.projects)) {
      translatedContent.projects.forEach((translatedProj: any, index: number) => {
        if (translatedCvData.projects[index]) {
          Object.keys(translatedProj).forEach((key: string) => {
            if (translatedProj[key] && key !== 'technologies') {
              translatedCvData.projects[index][key] = applyTerminologyEnhancement(
                translatedProj[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Translate skills with professional categorization
    if (translatedContent.skills && Array.isArray(translatedContent.skills)) {
      translatedContent.skills.forEach((translatedSkill: any, index: number) => {
        if (translatedCvData.skills[index] && translatedSkill.name) {
          if (typeof translatedCvData.skills[index] === 'object') {
            translatedCvData.skills[index].name = translatedSkill.name;
            if (translatedSkill.category) {
              translatedCvData.skills[index].category = translatedSkill.category;
            }
          } else {
            translatedCvData.skills[index] = translatedSkill.name;
          }
        }
      });
    }

    // Translate certifications comprehensively
    if (translatedContent.certifications && Array.isArray(translatedContent.certifications)) {
      translatedContent.certifications.forEach((translatedCert: any, index: number) => {
        if (translatedCvData.certifications[index]) {
          Object.keys(translatedCert).forEach((key: string) => {
            if (translatedCert[key] && key !== 'issuer') {
              translatedCvData.certifications[index][key] = applyTerminologyEnhancement(
                translatedCert[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Translate volunteer experience with impact focus
    if (translatedContent.volunteerExperience && Array.isArray(translatedContent.volunteerExperience)) {
      translatedContent.volunteerExperience.forEach((translatedVol: any, index: number) => {
        if (translatedCvData.volunteerExperience[index]) {
          Object.keys(translatedVol).forEach((key: string) => {
            if (translatedVol[key] && key !== 'organization') {
              translatedCvData.volunteerExperience[index][key] = applyTerminologyEnhancement(
                translatedVol[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Translate languages section
    if (translatedContent.languages && Array.isArray(translatedContent.languages)) {
      translatedContent.languages.forEach((translatedLang: any, index: number) => {
        if (translatedCvData.languages && translatedCvData.languages[index]) {
          Object.keys(translatedLang).forEach((key: string) => {
            if (translatedLang[key]) {
              if (typeof translatedCvData.languages[index] === 'object') {
                translatedCvData.languages[index][key] = translatedLang[key];
              }
            }
          });
        }
      });
    }

    // Translate awards section
    if (translatedContent.awards && Array.isArray(translatedContent.awards)) {
      translatedContent.awards.forEach((translatedAward: any, index: number) => {
        if (translatedCvData.awards && translatedCvData.awards[index]) {
          Object.keys(translatedAward).forEach((key: string) => {
            if (translatedAward[key] && key !== 'issuer') {
              translatedCvData.awards[index][key] = applyTerminologyEnhancement(
                translatedAward[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Update CV language and add translation metadata
    translatedCvData.cvLanguage = targetLanguage;
    translatedCvData.translationMetadata = {
      translatedAt: new Date().toISOString(),
      translatedBy: 'AI_Professional_Translator_v2.0',
      sourceLanguage: targetLanguage === 'english' ? 'azerbaijani' : 'english',
      targetLanguage: targetLanguage,
      comprehensiveTranslation: true
    };

    // Save the professionally translated CV
    await prisma.cV.update({
      where: { id: cvId },
      data: { cv_data: translatedCvData }
    });

    // Log the comprehensive translation for analytics
    await prisma.importSession.create({
      data: {
        userId: payload.userId,
        type: 'ai_comprehensive_translation_completed',
        data: JSON.stringify({
          cvId,
          targetLanguage,
          userTier: user.tier,
          translationType: 'comprehensive_professional',
          timestamp: new Date().toISOString(),
          sectionsTranslated: Object.keys(translatedContent.sectionNames || {}),
          enhancementsApplied: ['terminology_enhancement', 'cultural_adaptation', 'professional_formatting']
        }),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return NextResponse.json({
      success: true,
      message: `CV professionally and comprehensively translated to ${targetLanguage}`,
      translatedData: translatedCvData,
      translationMetadata: {
        sectionsTranslated: Object.keys(translatedContent.sectionNames || {}),
        enhancementsApplied: ['Professional terminology', 'Cultural adaptation', 'Comprehensive content coverage'],
        qualityLevel: 'Professional'
      }
    });

  } catch (error) {
    console.error('❌ AI comprehensive translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate CV content comprehensively' },
      { status: 500 }
    );
  }
}
