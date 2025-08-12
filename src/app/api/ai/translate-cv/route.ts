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
    const payload = await verifyJWT(token);
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

    // Get current CV language from metadata or detect from content
    const currentCvLanguage = cvData.cvLanguage || cvData.translationMetadata?.targetLanguage || 'english';
    const sourceLangName = currentCvLanguage === 'azerbaijani' ? 'Azerbaijani (Azərbaycan dili)' : 'English (Professional/Business)';

    console.log('🌍 Starting comprehensive AI translation from:', currentCvLanguage, 'to:', targetLanguage);

    // Create enhanced professional translation prompt
    const isAzerbaijani = targetLanguage === 'azerbaijani';
    const targetLangName = isAzerbaijani ? 'Azerbaijani (Azərbaycan dili)' : 'English (Professional/Business)';

    const prompt = `
      PROFESSIONAL CV COMPREHENSIVE TRANSLATION SERVICE
      ===============================================
      
      You are an expert professional CV translator specializing in career documents with deep knowledge of both Azerbaijani and English business terminology. 
      
      SOURCE LANGUAGE: ${sourceLangName}
      TRANSLATION TARGET: ${targetLangName}
      
      CRITICAL INSTRUCTION: You MUST translate ALL textual content from ${sourceLangName} to ${targetLangName}. 
      Do NOT leave any content untranslated. Every description, summary, and text field must be fully translated.
      
      IMPORTANT: The CV content below is currently in ${sourceLangName}. You need to translate it completely to ${targetLangName}.
      
      COMPREHENSIVE TRANSLATION REQUIREMENTS:
      =====================================
      
      1. SECTION NAMES: Translate ALL section headers and titles
      2. CONTENT: Translate ALL textual content while maintaining professional quality
      3. TERMINOLOGY: Use appropriate business/professional terminology for target language
      4. CULTURAL ADAPTATION: Adapt content for target language professional culture
      5. CONSISTENCY: Maintain consistent terminology throughout the document
      6. IMPACT PRESERVATION: Keep the professional impact and meaning of statements
      7. COMPLETENESS: Every single text field must be translated - no exceptions
      
      SPECIFIC RULES:
      ==============
      
      ✅ MUST TRANSLATE (EVERYTHING):
      - All section names and headers
      - Job titles and positions (using professional equivalents)
      - Job descriptions and responsibilities (FULLY TRANSLATE EVERY WORD)
      - Educational descriptions (FULLY TRANSLATE)
      - Project descriptions (FULLY TRANSLATE)
      - Skill names (soft skills and general professional skills)
      - Certification descriptions (FULLY TRANSLATE)
      - Personal summary/objective (FULLY TRANSLATE)
      - Achievement descriptions (FULLY TRANSLATE)
      - All narrative text (FULLY TRANSLATE)
      - Location names (cities, countries)
      - Role descriptions in volunteer work
      - Award descriptions
      - Any other descriptive text
      
      ❌ KEEP ORIGINAL (ONLY THESE):
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
      - Translate ALL English text to Azerbaijani
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
      - Translate ALL Azerbaijani text to English
      - Use strong action verbs (managed, developed, implemented, etc.)
      - Make descriptions concise yet impactful
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
        /javascript|python|java|react|angular|css|html|sql|aws|azure|php|node|vue|laravel|docker|kubernetes/i.test(skill) :
        /javascript|python|java|react|angular|css|html|sql|aws|azure|php|node|vue|laravel|docker|kubernetes/i.test(skill.name || '')
      ).map((skill: any) => typeof skill === 'string' ? skill : skill.name).join(', ')}
      
      Soft Skills: ${(cvData.skills || []).filter((skill: any) => 
        typeof skill === 'string' ? 
        !/javascript|python|java|react|angular|css|html|sql|aws|azure|php|node|vue|laravel|docker|kubernetes/i.test(skill) :
        !/javascript|python|java|react|angular|css|html|sql|aws|azure|php|node|vue|laravel|docker|kubernetes/i.test(skill.name || '')
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
      Return the translated content in this exact JSON format with ALL sections fully translated.
      CRITICAL: Every text field must contain translated content, not the original text.
      
      {
        "sectionNames": {
          "personalInfo": "${isAzerbaijani ? 'Şəxsi Məlumat' : 'Personal Information'}",
          "experience": "${isAzerbaijani ? 'İş Təcrübəsi' : 'Work Experience'}",
          "education": "${isAzerbaijani ? 'Təhsil' : 'Education'}",
          "skills": "${isAzerbaijani ? 'Bacarıqlar' : 'Skills'}",
          "projects": "${isAzerbaijani ? 'Layihələr' : 'Projects'}",
          "certifications": "${isAzerbaijani ? 'Sertifikatlar' : 'Certifications'}",
          "volunteerExperience": "${isAzerbaijani ? 'Könüllü Təcrübəsi' : 'Volunteer Experience'}",
          "languages": "${isAzerbaijani ? 'Dillər' : 'Languages'}",
          "awards": "${isAzerbaijani ? 'Mükafatlar' : 'Awards'}"
        },
        "personalInfo": {
          "summary": "FULLY TRANSLATED professional summary with impact and professional terminology - MUST BE COMPLETELY TRANSLATED"
        },
        "experience": [
          {
            "position": "FULLY TRANSLATED position title using professional equivalent",
            "location": "FULLY TRANSLATED location if applicable",
            "description": "COMPLETELY TRANSLATED job description with professional terminology and impact statements - EVERY WORD TRANSLATED",
            "achievements": "COMPLETELY TRANSLATED achievements with quantifiable results where possible - EVERY WORD TRANSLATED"
          }
        ],
        "education": [
          {
            "degree": "FULLY TRANSLATED degree name using educational terminology",
            "field": "FULLY TRANSLATED field of study",
            "location": "FULLY TRANSLATED location if applicable", 
            "description": "COMPLETELY TRANSLATED education description - EVERY WORD TRANSLATED",
            "achievements": "COMPLETELY TRANSLATED academic achievements - EVERY WORD TRANSLATED"
          }
        ],
        "projects": [
          {
            "name": "TRANSLATED project name (if not technical)",
            "role": "FULLY TRANSLATED role/position in project",
            "description": "COMPLETELY TRANSLATED project description with technical and business context - EVERY WORD TRANSLATED",
            "achievements": "COMPLETELY TRANSLATED project achievements and impact - EVERY WORD TRANSLATED"
          }
        ],
        "skills": [
          {
            "name": "TRANSLATED skill name (keep technical terms, translate soft skills)",
            "category": "TRANSLATED skill category if applicable"
          }
        ],
        "certifications": [
          {
            "name": "TRANSLATED certification name (if general term, keep specific brand names)",
            "description": "COMPLETELY TRANSLATED certification description with professional context - EVERY WORD TRANSLATED"
          }
        ],
        "volunteerExperience": [
          {
            "role": "FULLY TRANSLATED volunteer role with appropriate terminology",
            "description": "COMPLETELY TRANSLATED volunteer description with impact and skills demonstrated - EVERY WORD TRANSLATED",
            "impact": "COMPLETELY TRANSLATED impact statement with quantifiable results - EVERY WORD TRANSLATED"
          }
        ],
        "languages": [
          {
            "name": "Language name in target language",
            "level": "TRANSLATED proficiency level using standard terms"
          }
        ],
        "awards": [
          {
            "name": "TRANSLATED award name (if general term)",
            "description": "COMPLETELY TRANSLATED award description with achievement context - EVERY WORD TRANSLATED"
          }
        ]
      }
      
      FINAL WARNING: DO NOT RETURN ANY UNTRANSLATED TEXT. Every description, summary, and text field must be fully translated to ${targetLangName}. 
      
      ${isAzerbaijani ? 
        'HƏR ŞEYI Azərbaycan dilinə tərcümə edin. Heç bir mətn tərcümə edilməmiş qalmamalıdır!' :
        'TRANSLATE EVERYTHING to English. No text should remain untranslated!'
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
      if (!text || typeof text !== 'string') return text || '';

      let enhancedText = text;
      const terms = PROFESSIONAL_TERMS[targetLang] || {};

      try {
        Object.entries(terms).forEach(([original, translation]) => {
          if (!original || !translation || typeof original !== 'string' || typeof translation !== 'string') {
            return;
          }

          // Escape special regex characters in the original term
          const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'gi');

          // Ensure enhancedText is still a string before replacing
          if (enhancedText && typeof enhancedText === 'string') {
            const replaced = enhancedText.replace(regex, translation);
            enhancedText = replaced || enhancedText;
          }
        });
      } catch (error) {
        console.error('Error in terminology enhancement:', error);
        return text; // Return original text if enhancement fails
      }

      return enhancedText || text;
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
          // Apply all translated fields from AI response
          Object.keys(translatedExp).forEach((key: string) => {
            if (translatedExp[key] && typeof translatedExp[key] === 'string') {
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
        if (translatedCvData.education && translatedCvData.education[index]) {
          // Apply all translated fields from AI response
          Object.keys(translatedEdu).forEach((key: string) => {
            if (translatedEdu[key] && typeof translatedEdu[key] === 'string') {
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
        if (translatedCvData.projects && translatedCvData.projects[index]) {
          // Apply all translated fields except technologies (keep technical terms)
          Object.keys(translatedProj).forEach((key: string) => {
            if (translatedProj[key] && typeof translatedProj[key] === 'string' && key !== 'technologies') {
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
        if (translatedCvData.skills && translatedCvData.skills[index]) {
          if (translatedSkill.name) {
            if (typeof translatedCvData.skills[index] === 'object') {
              translatedCvData.skills[index].name = translatedSkill.name;
              if (translatedSkill.category) {
                translatedCvData.skills[index].category = translatedSkill.category;
              }
            } else {
              translatedCvData.skills[index] = translatedSkill.name;
            }
          }
        }
      });
    }

    // Translate certifications comprehensively
    if (translatedContent.certifications && Array.isArray(translatedContent.certifications)) {
      translatedContent.certifications.forEach((translatedCert: any, index: number) => {
        if (translatedCvData.certifications && translatedCvData.certifications[index]) {
          // Apply all translated fields except issuer (keep company names)
          Object.keys(translatedCert).forEach((key: string) => {
            if (translatedCert[key] && typeof translatedCert[key] === 'string' && key !== 'issuer') {
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
        if (translatedCvData.volunteerExperience && translatedCvData.volunteerExperience[index]) {
          // Apply all translated fields except organization (keep organization names)
          Object.keys(translatedVol).forEach((key: string) => {
            if (translatedVol[key] && typeof translatedVol[key] === 'string' && key !== 'organization') {
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
            if (translatedLang[key] && typeof translatedLang[key] === 'string') {
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
          // Apply all translated fields except issuer (keep organization names)
          Object.keys(translatedAward).forEach((key: string) => {
            if (translatedAward[key] && typeof translatedAward[key] === 'string' && key !== 'issuer') {
              translatedCvData.awards[index][key] = applyTerminologyEnhancement(
                translatedAward[key],
                targetLanguage
              );
            }
          });
        }
      });
    }

    // Add a delay and additional verification to prevent automatic reversion
    const translationTimestamp = Date.now();

    // Update CV language and add translation metadata with lock mechanism
    translatedCvData.cvLanguage = targetLanguage;
    translatedCvData.translationMetadata = {
      translatedAt: new Date().toISOString(),
      translatedBy: 'AI_Professional_Translator_v2.2',
      sourceLanguage: currentCvLanguage,
      targetLanguage: targetLanguage,
      comprehensiveTranslation: true,
      previousLanguage: currentCvLanguage,
      translationLock: true, // Prevent automatic re-translation
      lastTranslationId: `${translationTimestamp}-${targetLanguage}`, // Unique translation ID
      translationLockUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Lock for 10 minutes
      forceLanguage: targetLanguage, // Force this language to stay
      PERMANENT_LOCK: true, // Never allow automatic changes
      API_TRANSLATION: true // Mark as API translation
    };

    // Add language indicator to all major sections to prevent confusion
    translatedCvData.languageIndicator = {
      currentLanguage: targetLanguage,
      lastUpdated: new Date().toISOString(),
      isTranslated: true,
      translationComplete: true,
      locked: true,
      lockExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      NEVER_AUTO_CHANGE: true
    };

    // Add a strong language lock at the root level
    translatedCvData.LANGUAGE_LOCK = {
      language: targetLanguage,
      timestamp: translationTimestamp,
      DO_NOT_CHANGE: true,
      TRANSLATION_IN_PROGRESS: false,
      FINAL_LANGUAGE: targetLanguage,
      LOCK_VERSION: "v2.2",
      PERMANENT: true
    };

    // Add language markers to each section to prevent individual section changes
    if (translatedCvData.personalInfo) {
      translatedCvData.personalInfo.__language = targetLanguage;
      translatedCvData.personalInfo.__locked = true;
    }
    if (translatedCvData.experience) {
      translatedCvData.experience.forEach((exp: any) => {
        exp.__language = targetLanguage;
        exp.__locked = true;
      });
    }
    if (translatedCvData.education) {
      translatedCvData.education.forEach((edu: any) => {
        edu.__language = targetLanguage;
        edu.__locked = true;
      });
    }
    if (translatedCvData.projects) {
      translatedCvData.projects.forEach((proj: any) => {
        proj.__language = targetLanguage;
        proj.__locked = true;
      });
    }

    console.log(`✅ Translation completed and PERMANENTLY LOCKED to ${targetLanguage} with timestamp ${translationTimestamp}`);

    // Save the professionally translated CV with explicit language lock
    await prisma.cV.update({
      where: { id: cvId },
      data: {
        cv_data: translatedCvData
        // Language is now tracked within cv_data.cvLanguage and cv_data.languageIndicator
      }
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
