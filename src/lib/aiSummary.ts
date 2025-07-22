import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVLanguage } from './cvLanguage';

// Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CVDataForSummary {
  personalInfo: {
    fullName: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  experience?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
  }>;
  skills?: Array<{
    name: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
  }>;
  cvLanguage?: CVLanguage; // Use CV's language preference
}

/**
 * Generate professional summary using Gemini AI based on CV data
 */
export async function generateProfessionalSummary(cvData: CVDataForSummary): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a comprehensive prompt based on CV data
    const prompt = createSummaryPrompt(cvData);
    
    console.log('🤖 Gemini AI ilə professional summary yaradılır...');
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log('✅ Professional summary yaradıldı:', summary.substring(0, 100) + '...');
    
    return summary.trim();
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    
    // Fallback: Generate basic summary from data
    return generateFallbackSummary(cvData);
  }
}

/**
 * Generate intelligent professional summary with language detection
 */
export async function generateIntelligentProfessionalSummary(cvData: CVDataForSummary): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Use CV's specified language or detect from content
    const cvLanguage = cvData.cvLanguage || detectCVLanguage(cvData);
    
    // Create language-appropriate prompt
    const prompt = createIntelligentSummaryPrompt(cvData, cvLanguage);
    
    console.log(`🤖 Generating professional summary in ${cvLanguage}...`);
    console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log('✅ Intelligent professional summary created:', summary.substring(0, 100) + '...');
    
    return summary.trim();
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    
    // Fallback: Generate basic summary from data
    const language = cvData.cvLanguage || detectCVLanguage(cvData);
    return generateIntelligentFallbackSummary(cvData, language);
  }
}

/**
 * Detect CV language based on content analysis or CV language setting
 */
function detectCVLanguage(cvData: CVDataForSummary): 'english' | 'azerbaijani' {
  // If CV language is explicitly set, use it
  if (cvData.cvLanguage) {
    console.log(`🔍 Using explicit CV language: ${cvData.cvLanguage}`);
    return cvData.cvLanguage;
  }

  // Otherwise, detect from content
  const { experience, education, skills, projects } = cvData;
  
  // Collect all text content for analysis
  let allText = '';
  
  // Experience descriptions
  if (experience) {
    experience.forEach(exp => {
      allText += ` ${exp.position} ${exp.company} ${exp.description || ''}`;
    });
  }
  
  // Education
  if (education) {
    education.forEach(edu => {
      allText += ` ${edu.degree} ${edu.institution}`;
    });
  }
  
  // Skills
  if (skills) {
    allText += ` ${skills.map(s => s.name).join(' ')}`;
  }
  
  // Projects
  if (projects) {
    projects.forEach(proj => {
      allText += ` ${proj.name} ${proj.description || ''}`;
      if (proj.technologies) {
        allText += ` ${proj.technologies.join(' ')}`;
      }
    });
  }
  
  allText = allText.toLowerCase();
  
  // English indicators
  const englishKeywords = [
    'software', 'developer', 'engineer', 'manager', 'university', 'college',
    'experience', 'project', 'technology', 'development', 'programming',
    'analysis', 'design', 'implementation', 'bachelor', 'master', 'degree',
    'javascript', 'python', 'react', 'node', 'database', 'api', 'frontend',
    'backend', 'fullstack', 'web', 'mobile', 'application', 'system'
  ];
  
  // Azerbaijani indicators  
  const azerbaijaniKeywords = [
    'proqramçı', 'mühəndis', 'menecər', 'universitet', 'kollec', 'təcrübə',
    'layihə', 'texnologiya', 'inkişaf', 'proqramlaşdırma', 'təhlil', 'dizayn',
    'bakalavr', 'magistr', 'dərəcə', 'şirkət', 'iş', 'sahə', 'mütəxəssis',
    'bacarıq', 'bilik', 'təhsil', 'ixtisas', 'vəzifə', 'məsul', 'həyata'
  ];
  
  let englishScore = 0;
  let azerbaijaniScore = 0;
  
  englishKeywords.forEach(keyword => {
    if (allText.includes(keyword)) englishScore++;
  });
  
  azerbaijaniKeywords.forEach(keyword => {
    if (allText.includes(keyword)) azerbaijaniScore++;
  });
  
  // Additional English detection - check for common patterns
  if (allText.match(/\b(at|in|of|for|with|from|to|and|the|a|an)\b/g)) {
    englishScore += 5;
  }
  
  // Additional Azerbaijani detection - check for specific characters/patterns
  if (allText.match(/[əçğıöşü]/g)) {
    azerbaijaniScore += 10;
  }
  
  console.log(`🔍 Language detection: English score: ${englishScore}, Azerbaijani score: ${azerbaijaniScore}`);
  
  return englishScore > azerbaijaniScore ? 'english' : 'azerbaijani';
}

/**
 * Create detailed prompt for Gemini AI
 */
function createSummaryPrompt(cvData: CVDataForSummary): string {
  const { personalInfo, experience, education, skills, projects } = cvData;
  
  let prompt = `Aşağıdaki CV məlumatlarına əsasən professional və cəlbedici bir career summary (professional summary) yazın. Summary Azərbaycan dilində olmalıdır və maksimum 3-4 cümlə olmalıdır. Formal və professional ton istifadə edin.

Şəxsi məlumatlar:
- Ad: ${personalInfo.fullName}`;

  if (personalInfo.linkedin) prompt += `\n- LinkedIn: ${personalInfo.linkedin}`;
  if (personalInfo.github) prompt += `\n- GitHub: ${personalInfo.github}`;
  if (personalInfo.website) prompt += `\n- Website: ${personalInfo.website}`;

  if (experience && experience.length > 0) {
    prompt += `\n\nİş təcrübəsi:`;
    experience.slice(0, 3).forEach((exp, index) => {
      prompt += `\n${index + 1}. ${exp.position} - ${exp.company}`;
      if (exp.description) {
        prompt += `\n   Təsvir: ${exp.description.substring(0, 200)}`;
      }
    });
  }

  if (education && education.length > 0) {
    prompt += `\n\nTəhsil:`;
    education.forEach((edu, index) => {
      prompt += `\n${index + 1}. ${edu.degree} - ${edu.institution}`;
    });
  }

  if (skills && skills.length > 0) {
    prompt += `\n\nBacarıqlar: ${skills.map(s => s.name).join(', ')}`;
  }

  if (projects && projects.length > 0) {
    prompt += `\n\nLayihələr:`;
    projects.slice(0, 2).forEach((project, index) => {
      prompt += `\n${index + 1}. ${project.name}`;
      if (project.description) {
        prompt += ` - ${project.description.substring(0, 100)}`;
      }
      if (project.technologies && project.technologies.length > 0) {
        prompt += ` (Texnologiyalar: ${project.technologies.join(', ')})`;
      }
    });
  }

  prompt += `\n\nXahiş edirəm bu məlumatlara əsasən professional və cəlbedici career summary yazın. Summary aşağıdaki kriteriyalara uyğun olmalıdır:
1. Azərbaycan dilində olsun
2. Maksimum 3-4 cümlə olsun
3. Şəxsin əsas bacarıqlarını və təcrübəsini vurğulasın
4. İş axtarışında faydalı olsun
5. Professional və formal ton istifadə edin
6. Məlumatları yaratıcı şəkildə birləşdirin

Yalnız summary mətnini qaytarın, başqa heç nə əlavə etməyin.`;

  return prompt;
}

/**
 * Create intelligent prompt based on detected language
 */
function createIntelligentSummaryPrompt(cvData: CVDataForSummary, language: 'english' | 'azerbaijani'): string {
  const { personalInfo, experience, education, skills, projects } = cvData;
  
  if (language === 'english') {
    // English prompt
    let prompt = `Based on the following CV information, write a professional and compelling career summary in ENGLISH. The summary should be maximum 3-4 sentences and use formal, professional tone.

Personal Information:
- Name: ${personalInfo.fullName}`;

    if (personalInfo.linkedin) prompt += `\n- LinkedIn: ${personalInfo.linkedin}`;
    if (personalInfo.github) prompt += `\n- GitHub: ${personalInfo.github}`;
    if (personalInfo.website) prompt += `\n- Website: ${personalInfo.website}`;

    if (experience && experience.length > 0) {
      prompt += `\n\nWork Experience:`;
      experience.slice(0, 3).forEach((exp, index) => {
        prompt += `\n${index + 1}. ${exp.position} at ${exp.company}`;
        if (exp.description) {
          prompt += `\n   Description: ${exp.description.substring(0, 200)}`;
        }
      });
    }

    if (education && education.length > 0) {
      prompt += `\n\nEducation:`;
      education.forEach((edu, index) => {
        prompt += `\n${index + 1}. ${edu.degree} - ${edu.institution}`;
      });
    }

    if (skills && skills.length > 0) {
      prompt += `\n\nSkills: ${skills.map(s => s.name).join(', ')}`;
    }

    if (projects && projects.length > 0) {
      prompt += `\n\nProjects:`;
      projects.slice(0, 2).forEach((project, index) => {
        prompt += `\n${index + 1}. ${project.name}`;
        if (project.description) {
          prompt += ` - ${project.description.substring(0, 100)}`;
        }
        if (project.technologies && project.technologies.length > 0) {
          prompt += ` (Technologies: ${project.technologies.join(', ')})`;
        }
      });
    }

    prompt += `\n\nPlease write a professional and compelling career summary based on this information. The summary should meet the following criteria:
1. Written in ENGLISH
2. Maximum 3-4 sentences
3. Highlight the person's key skills and experience
4. Be useful for job searching
5. Use professional and formal tone
6. Creatively combine the information
7. Focus on achievements and capabilities
8. Include relevant industry keywords

Return only the summary text, nothing else.`;

    return prompt;
  } else {
    // Azerbaijani prompt (existing logic)
    return createSummaryPrompt(cvData);
  }
}

/**
 * Generate fallback summary when AI fails
 */
function generateFallbackSummary(cvData: CVDataForSummary): string {
  const { personalInfo, experience, education, skills } = cvData;
  
  let summary = `${personalInfo.fullName} - `;
  
  // Add experience info
  if (experience && experience.length > 0) {
    const latestJob = experience[0];
    summary += `${latestJob.position} sahəsində təcrübəli mütəxəssis. `;
    
    if (experience.length > 1) {
      summary += `${experience.length} müxtəlif şirkətdə iş təcrübəsi var. `;
    }
  }
  
  // Add education
  if (education && education.length > 0) {
    const latestEdu = education[0];
    summary += `${latestEdu.institution}-də təhsil alıb. `;
  }
  
  // Add skills
  if (skills && skills.length > 0) {
    const topSkills = skills.slice(0, 3).map(s => s.name).join(', ');
    summary += `${topSkills} sahələrində bacarıqlıdır. `;
  }
  
  summary += `Yeni imkanlar və qarşıdakı çağırışlar üçün hazırdır.`;
  
  return summary;
}

/**
 * Validate if user has Premium access for AI features
 */
export function canUseAIFeatures(userTier: string): boolean {
  const tier = userTier.toLowerCase();
  return tier === 'premium' || tier === 'medium';
}

/**
 * Generate intelligent fallback summary based on language
 */
function generateIntelligentFallbackSummary(cvData: CVDataForSummary, language: 'english' | 'azerbaijani'): string {
  const { personalInfo, experience, education, skills } = cvData;
  
  if (language === 'english') {
    let summary = `${personalInfo.fullName} is `;
    
    // Add experience info
    if (experience && experience.length > 0) {
      const latestJob = experience[0];
      summary += `an experienced ${latestJob.position} `;
      
      if (experience.length > 1) {
        summary += `with ${experience.length}+ years of professional experience `;
      }
    } else {
      summary += `a motivated professional `;
    }
    
    // Add education info
    if (education && education.length > 0) {
      const latestEducation = education[0];
      summary += `holding a ${latestEducation.degree} from ${latestEducation.institution}. `;
    }
    
    // Add skills
    if (skills && skills.length > 0) {
      const topSkills = skills.slice(0, 3).map(s => s.name).join(', ');
      summary += `Specialized in ${topSkills}. `;
    }
    
    summary += `Seeking new opportunities for professional growth and development.`;
    
    return summary;
  } else {
    // Return Azerbaijani fallback
    return generateFallbackSummary(cvData);
  }
}

/**
 * Get AI feature availability message for user
 */
export function getAIFeatureMessage(userTier: string): string {
  if (canUseAIFeatures(userTier)) {
    return 'AI-powered professional summary mövcuddur!';
  }
  
  return 'AI professional summary Premium istifadəçilər üçün mövcuddur. Planınızı yüksəldin!';
}

/**
 * Translate CV content to target language using AI
 */
export async function translateCVContent(cvData: any, targetLanguage: CVLanguage): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create translation prompt
    const prompt = createTranslationPrompt(cvData, targetLanguage);
    
    console.log(`🌐 Translating CV content to ${targetLanguage}...`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    console.log('✅ CV content translated successfully');
    
    // Parse the JSON response
    const translatedData = JSON.parse(translatedText);
    return { ...cvData, ...translatedData, cvLanguage: targetLanguage };
  } catch (error) {
    console.error('❌ Translation error:', error);
    
    // Fallback: Return original data with language changed
    return { ...cvData, cvLanguage: targetLanguage };
  }
}

/**
 * Create translation prompt for CV content
 */
function createTranslationPrompt(cvData: any, targetLanguage: CVLanguage): string {
  const isToEnglish = targetLanguage === 'english';
  const targetLang = isToEnglish ? 'English' : 'Azerbaijani';
  const sourceLang = isToEnglish ? 'Azerbaijani' : 'English';

  const prompt = `Translate the following CV content from ${sourceLang} to ${targetLang}. 
Maintain professional tone and preserve formatting. Return ONLY a valid JSON object with the translated fields.

Current CV data:
${JSON.stringify(cvData, null, 2)}

Please translate the following fields while keeping the structure intact:
- personalInfo.professionalSummary
- experience[].position
- experience[].company  
- experience[].description
- education[].degree
- education[].institution
- education[].description
- skills[].name
- projects[].name
- projects[].description
- certifications[].name
- certifications[].issuer
- certifications[].description
- languages[].language
- volunteerExperience[].organization
- volunteerExperience[].role
- volunteerExperience[].description

Important rules:
1. Keep the same JSON structure
2. Translate content naturally and professionally
3. Keep technical terms and proper nouns appropriate for the target language
4. For skills, translate categories but keep technology names in original form
5. Return valid JSON only, no additional text
6. Preserve all IDs, dates, and URLs unchanged

${isToEnglish ? 
  'Translate to professional English suitable for international job applications.' :
  'Azərbaycan dilinə tərcümə edin, professional və formal dil istifadə edin.'
}`;

  return prompt;
}
