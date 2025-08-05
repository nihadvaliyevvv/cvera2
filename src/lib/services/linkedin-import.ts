import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Plan-based LinkedIn import limits
export const LINKEDIN_LIMITS = {
  Free: 2,
  Medium: 5,
  Premium: -1 // unlimited
} as const;

export interface LinkedInProfile {
  name: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  website?: string;
  profilePicture?: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills: string[];
  languages: string[];
  projects?: Array<{
    title: string;
    name?: string;
    description?: string;
    duration?: string;
    link?: string;
    url?: string;
    skills?: string;
    technologies?: string;
  }>;
  awards?: Array<{
    name: string;
    title?: string;
    organization?: string;
    duration?: string;
    date?: string;
    summary?: string;
    description?: string;
  }>;
  volunteering?: Array<{
    organization?: string;
    company?: string;
    role?: string;
    position?: string;
    cause?: string;
    field?: string;
    duration?: string;
    description?: string;
    summary?: string;
    current?: boolean;
  }>;
}

export interface LinkedInImportResult {
  success: boolean;
  profile?: LinkedInProfile;
  cvId?: string;
  error?: string;
  remainingImports?: number;
}

export class LinkedInImportService {
  // Remove hardcoded API key and use database instead
  private readonly SCRAPINGDOG_URL = 'https://api.scrapingdog.com/linkedin';

  /**
   * Get active ScrapingDog API key from database
   */
  private async getActiveScrapingDogApiKey(): Promise<string> {
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
        console.warn('❌ No active ScrapingDog API key found in database, using fallback');
        // Fallback to your working key if no active key in database
        return '6882894b855f5678d36484c8';
      }

      console.log('✅ Active ScrapingDog API key found:', activeApiKey.apiKey.substring(0, 8) + '***');
      return activeApiKey.apiKey;
    } catch (error) {
      console.error('❌ API key lookup failed:', error);
      // Fallback to your working key
      return '6882894b855f5678d36484c8';
    }
  }

  /**
   * Update API key usage statistics
   */
  private async updateApiKeyUsage(apiKey: string, success: boolean): Promise<void> {
    try {
      await prisma.apiKey.updateMany({
        where: { apiKey: apiKey },
        data: {
          usageCount: { increment: 1 },
          dailyUsage: { increment: 1 },
          lastUsed: new Date(),
          lastResult: success ? 'success' : 'error'
        }
      });
    } catch (error) {
      console.log('Usage update failed:', error);
    }
  }

  /**
   * Check if user can import more LinkedIn profiles based on their tier
   */
  async checkImportLimit(userId: string): Promise<{
    canImport: boolean;
    remainingImports: number;
    userTier: string;
  }> {
    try {
      // Get user and their tier
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const maxImports = LINKEDIN_LIMITS[user.tier as keyof typeof LINKEDIN_LIMITS] || LINKEDIN_LIMITS.Free;

      // If premium (unlimited), always allow
      if (maxImports === -1) {
        return {
          canImport: true,
          remainingImports: -1,
          userTier: user.tier
        };
      }

      // Count LinkedIn imports for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayImports = await prisma.importSession.count({
        where: {
          userId,
          type: 'linkedin_success',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      const remainingImports = Math.max(0, maxImports - todayImports);

      return {
        canImport: remainingImports > 0,
        remainingImports,
        userTier: user.tier
      };
    } catch (error) {
      console.error('Error checking import limit:', error);
      return {
        canImport: false,
        remainingImports: 0,
        userTier: 'Free'
      };
    }
  }

  /**
   * Extract LinkedIn username from URL or return as-is if already a username
   */
  private extractLinkedInUsername(input: string): string | null {
    if (!input?.trim()) return null;

    const cleanInput = input.trim();

    // If it's already just a username (no URL), return it
    if (!cleanInput.includes('/') && !cleanInput.includes('linkedin.com')) {
      return cleanInput;
    }

    // Extract from LinkedIn URL patterns
    const patterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_.]+)/i,
      /linkedin\.com\/pub\/([a-zA-Z0-9\-_.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanInput.match(pattern);
      if (match?.[1]) {
        return match[1].replace(/\/$/, '').split('?')[0].split('#')[0];
      }
    }

    return null;
  }

  /**
   * Scrape LinkedIn profile using ScrapingDog API
   */
  private async scrapeLinkedInProfile(linkedinUsername: string): Promise<LinkedInProfile | null> {
    try {
      console.log(`🔍 Scraping LinkedIn profile: ${linkedinUsername}`);

      const apiKey = await this.getActiveScrapingDogApiKey();

      const params = {
        api_key: apiKey,
        type: 'profile',
        linkId: linkedinUsername,
        premium: 'false',
      };

      const response = await axios.get(this.SCRAPINGDOG_URL, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'CVERA-LinkedIn-Scraper/2.0'
        }
      });

      if (response.status !== 200) {
        console.error(`❌ ScrapingDog API error: Status ${response.status}`);
        return null;
      }

      let data = response.data;
      console.log('🔍 ScrapingDog full response:', JSON.stringify(data, null, 2));

      // Handle different response formats from ScrapingDog
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      } else if (data['0']) {
        data = data['0'];
      }

      // Transform to our standard format with better name parsing
      let firstName = '';
      let lastName = '';
      let fullName = '';

      // FIXED: Use correct ScrapingDog field names
      if (data.first_name && data.last_name) {
        firstName = data.first_name.trim();
        lastName = data.last_name.trim();
        fullName = `${firstName} ${lastName}`.trim();
      }
      // If we have fullName but not separate names, try to split
      else if (data.fullName) {
        fullName = data.fullName.trim();
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = fullName;
          lastName = '';
        }
      }
      // Fallback to other possible field names
      else if (data.name) {
        fullName = data.name.trim();
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = fullName;
          lastName = '';
        }
      }

      // Get ALL skills - from ScrapingDog AND RapidAPI
      console.log(`🔍 Getting skills from both APIs for: ${linkedinUsername}`);
      const scrapingDogSkills = this.parseSkills(data);
      const rapidApiSkills = await this.fetchSkillsWithRapidAPI(linkedinUsername);

      // Combine and deduplicate skills
      const allSkills = [...scrapingDogSkills, ...rapidApiSkills];
      const uniqueSkills = [...new Set(allSkills.map(skill => skill.toLowerCase()))]
        .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1))
        .slice(0, 30); // Increase limit to 30 skills

      console.log(`✅ Combined skills (${uniqueSkills.length}):`, uniqueSkills);

      const profile: LinkedInProfile = {
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        headline: data.headline || data.sub_title || '',
        summary: data.about || data.summary || '',
        location: data.location || data.geo_location || '',
        experience: this.parseExperience(data.experience),
        education: this.parseEducation(data.education),
        skills: uniqueSkills,
        languages: Array.isArray(data.languages) ? data.languages : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        awards: Array.isArray(data.awards) ? data.awards : [],
        volunteering: this.parseVolunteerExperience(data) // Use enhanced volunteer parsing
      };

      console.log('✅ Final profile data:', {
        name: profile.name,
        experienceCount: profile.experience.length,
        educationCount: profile.education.length,
        skillsCount: profile.skills.length,
        languagesCount: profile.languages.length
      });

      return profile;
    } catch (error) {
      console.error('💥 LinkedIn scraping error:', error);
      return null;
    }
  }

  /**
   * Parse experience data from ScrapingDog response with enhanced date handling
   */
  private parseExperience(experienceData: any[]): LinkedInProfile['experience'] {
    if (!Array.isArray(experienceData)) return [];

    return experienceData.map(exp => {
      let duration = '';
      let startDate = '';
      let endDate = '';

      // Try to extract dates from various possible fields
      if (exp.duration) {
        duration = exp.duration;
        // Parse duration string into start/end dates
        const parsedDates = this.parseDurationToStartEnd(duration);
        startDate = parsedDates.startDate;
        endDate = parsedDates.endDate;
      } else if (exp.date_range) {
        duration = exp.date_range;
        const parsedDates = this.parseDurationToStartEnd(duration);
        startDate = parsedDates.startDate;
        endDate = parsedDates.endDate;
      } else if (exp.start_date || exp.end_date || exp.starts_at || exp.ends_at) {
        // If we have separate start/end dates, use them directly
        startDate = exp.start_date || exp.starts_at || '';
        endDate = exp.end_date || exp.ends_at || (exp.current ? 'Present' : '');
        duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      } else if (exp.from_date || exp.to_date) {
        // Alternative field names
        startDate = exp.from_date || '';
        endDate = exp.to_date || (exp.current ? 'Present' : '');
        duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      }

      // If we still don't have dates but have years/months info, calculate dates
      if (!startDate && !endDate && (exp.years || exp.months)) {
        const calculatedDates = this.calculateDatesFromDuration(exp.years, exp.months);
        startDate = calculatedDates.startDate;
        endDate = calculatedDates.endDate;
        duration = `${startDate} - ${endDate}`;
      }

      return {
        title: exp.title || exp.position || exp.job_title || '',
        company: exp.company || exp.company_name || exp.organization || '',
        duration: duration || '',
        startDate: startDate || '',
        endDate: endDate || '',
        description: exp.description || exp.summary || exp.about || ''
      };
    });
  }

  /**
   * Parse duration string into start and end dates
   */
  private parseDurationToStartEnd(duration: string): { startDate: string; endDate: string } {
    if (!duration || typeof duration !== 'string') {
      return { startDate: '', endDate: '' };
    }

    const cleanDuration = duration.trim().toLowerCase();

    // Handle direct date ranges like "Jan 2020 - Dec 2022"
    if (cleanDuration.includes(' - ')) {
      const parts = cleanDuration.split(' - ');
      const startDate = parts[0]?.trim() || '';
      let endDate = parts[1]?.trim() || '';

      // Check if it's a current position
      if (endDate.includes('present') || endDate.includes('hazırda') || endDate.includes('current')) {
        endDate = 'Present';
      }

      return {
        startDate: this.capitalizeFirstLetter(startDate),
        endDate: endDate === 'Present' ? 'Present' : this.capitalizeFirstLetter(endDate)
      };
    }

    // Handle duration patterns like "2 years 3 months" or "1 year 5 months"
    const yearMatch = cleanDuration.match(/(\d+)\s*(year|years|yıl)/);
    const monthMatch = cleanDuration.match(/(\d+)\s*(month|months|ay)/);

    if (yearMatch || monthMatch) {
      const years = yearMatch ? parseInt(yearMatch[1]) : 0;
      const months = monthMatch ? parseInt(monthMatch[1]) : 0;

      return this.calculateDatesFromDuration(years, months);
    }

    // Handle single year like "2023"
    const singleYearMatch = cleanDuration.match(/^(\d{4})$/);
    if (singleYearMatch) {
      const year = singleYearMatch[1];
      return { startDate: `Jan ${year}`, endDate: `Dec ${year}` };
    }

    // Handle patterns like "Since 2020" or "2020 - Present"
    if (cleanDuration.includes('since') || cleanDuration.includes('present')) {
      const yearMatch = cleanDuration.match(/(\d{4})/);
      if (yearMatch) {
        const startYear = yearMatch[1];
        return { startDate: `Jan ${startYear}`, endDate: 'Present' };
      }
    }

    // If no pattern matches, return the original duration as start date
    return { startDate: this.capitalizeFirstLetter(duration), endDate: '' };
  }

  /**
   * Calculate start and end dates from years and months
   */
  private calculateDatesFromDuration(years: number = 0, months: number = 0): { startDate: string; endDate: string } {
    const currentDate = new Date();
    const totalMonths = (years * 12) + months;

    // Calculate start date by subtracting the duration from current date
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - totalMonths, 1);

    // Format dates
    const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
    const startYear = startDate.getFullYear();
    const endMonth = currentDate.toLocaleString('en-US', { month: 'short' });
    const endYear = currentDate.getFullYear();

    return {
      startDate: `${startMonth} ${startYear}`,
      endDate: `${endMonth} ${endYear}`
    };
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Parse education data from ScrapingDog response
   */
  private parseEducation(educationData: any[]): LinkedInProfile['education'] {
    if (!Array.isArray(educationData)) return [];

    return educationData.map(edu => ({
      school: edu.college_name || edu.school || edu.institution || '',
      degree: edu.college_degree || edu.degree || '',
      field: edu.college_degree_field || edu.field_of_study || edu.field || '',
      duration: edu.college_duration || edu.duration || edu.date_range || ''
    }));
  }

  /**
   * Parse skills from various possible fields in ScrapingDog response
   * Enhanced with additional skills fetching using ScrapingDog API
   */
  private parseSkills(data: any): string[] {
    const skillSources = [
      data.skills,
      data.skillsArray,
      data.skill,
      data.endorsements,
      data.competencies,
      data.skill_list,
      data.skills_list
    ];

    for (const source of skillSources) {
      if (Array.isArray(source) && source.length > 0) {
        return source.filter(skill => typeof skill === 'string' && skill.trim());
      }
    }

    return [];
  }

  /**
   * Fetch additional skills using RapidAPI with correct endpoint
   */
  private async fetchSkillsWithRapidAPI(linkedinUsername: string): Promise<string[]> {
    try {
      console.log(`🔍 Fetching skills for: ${linkedinUsername}`);

      const response = await axios.get('https://fresh-linkedin-profile-data.p.rapidapi.com/get-extra-profile-data', {
        params: {
          linkedin_url: `https://www.linkedin.com/in/${linkedinUsername}`
        },
        headers: {
          'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
          'x-rapidapi-key': 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4'
        },
        timeout: 15000
      });

      console.log('🔍 RapidAPI Response status:', response.status);
      console.log('🔍 RapidAPI Response data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.data) {
        let skills: string[] = [];
        const data = response.data.data; // Get the nested data object

        // Check multiple possible skill field names in the nested data
        const skillFields = [
          'skills',
          'skill',
          'skillsArray',
          'skills_list',
          'skill_list',
          'competencies',
          'endorsements'
        ];

        for (const field of skillFields) {
          if (data[field]) {
            console.log(`📋 Found skills in data.${field}:`, data[field]);

            if (Array.isArray(data[field])) {
              skills = data[field];
              break;
            } else if (typeof data[field] === 'string') {
              skills = data[field].split(',').map((s: string) => s.trim());
              break;
            }
          }
        }

        // If still no skills, check nested objects within data
        if (skills.length === 0 && data.profile) {
          for (const field of skillFields) {
            if (data.profile[field]) {
              console.log(`📋 Found skills in data.profile.${field}:`, data.profile[field]);

              if (Array.isArray(data.profile[field])) {
                skills = data.profile[field];
                break;
              } else if (typeof data.profile[field] === 'string') {
                skills = data.profile[field].split(',').map((s: string) => s.trim());
                break;
              }
            }
          }
        }

        const validSkills = skills.filter(skill => typeof skill === 'string' && skill.trim());
        console.log(`✅ Found ${validSkills.length} skills via RapidAPI:`, validSkills);
        return validSkills;
      }

      console.log('❌ No skills data found in RapidAPI response');
      return [];
    } catch (error) {
      console.error('❌ RapidAPI skills fetch error:', error);
      return [];
    }
  }

  /**
   * Generate AI-enhanced professional summary using Gemini
   */
  private async generateProfessionalSummary(profile: LinkedInProfile): Promise<string> {
    try {
      const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Based on the following LinkedIn profile information, create a professional summary for a CV:

        Name: ${profile.name}
        Headline: ${profile.headline}
        Current Summary: ${profile.summary}
        Location: ${profile.location}
        
        Experience:
        ${profile.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.duration})`).join('\n')}
        
        Education:
        ${profile.education.map(edu => `- ${edu.degree} in ${edu.field} from ${edu.school}`).join('\n')}
        
        Skills: ${profile.skills.join(', ')}

        Create a concise, professional summary (2-3 sentences) that highlights key strengths and experience.
      `;

      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();

      return summary || profile.summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return profile.summary || `${profile.headline}. Based in ${profile.location}.`;
    }
  }

  /**
   * Create CV from LinkedIn profile data
   */
  private async createCVFromProfile(userId: string, profile: LinkedInProfile, linkedinUsername: string): Promise<string> {
    // Use original LinkedIn summary instead of generating AI summary automatically
    const originalSummary = profile.summary || profile.headline || '';

    console.log('🎯 Creating CV from profile data:', {
      skillsCount: profile.skills.length,
      skills: profile.skills,
      experienceCount: profile.experience.length,
      educationCount: profile.education.length,
      projectsCount: profile.projects?.length || 0,
      certificationsCount: profile.awards?.length || 0
    });

    // Transform projects from ScrapingDog format
    const transformedProjects = Array.isArray(profile.projects) ? profile.projects.map((proj: any, index: number) => ({
      id: `proj-${index}-${Date.now()}`,
      name: proj.title || proj.name || '',
      description: proj.description || `${proj.title || proj.name} layihəsi`,
      startDate: proj.duration?.split(' - ')[0]?.trim() || proj.startDate || '',
      endDate: proj.duration?.split(' - ')[1]?.trim() || proj.endDate || 'Present',
      skills: proj.skills || proj.technologies || '',
      url: proj.link || proj.url || ''
    })) : [];

    // Transform certifications/awards from ScrapingDog format with proper date handling
    const transformedCertifications = Array.isArray(profile.awards) ? profile.awards.map((cert: any, index: number) => {
      let certDate = '';

      // Try to extract date from various possible fields
      if (cert.date) {
        certDate = cert.date;
      } else if (cert.duration) {
        certDate = cert.duration;
      } else if (cert.year) {
        certDate = cert.year.toString();
      } else if (cert.issued_date) {
        certDate = cert.issued_date;
      } else if (cert.completion_date) {
        certDate = cert.completion_date;
      } else if (cert.awarded_date) {
        certDate = cert.awarded_date;
      }

      // If we have a date range, extract the end date (completion date)
      if (certDate && certDate.includes(' - ')) {
        certDate = certDate.split(' - ')[1]?.trim() || certDate;
      }

      return {
        id: `cert-${index}-${Date.now()}`,
        name: cert.name || cert.title || '',
        issuer: cert.organization || cert.issuer || cert.institution || 'Unknown',
        date: certDate || '',
        description: cert.summary || cert.description || ''
      };
    }) : [];

    // Transform volunteer experience from ScrapingDog format with enhanced date parsing
    const transformedVolunteer = Array.isArray(profile.volunteering) ? profile.volunteering.map((vol: any, index: number) => {
      let startDate = '';
      let endDate = '';
      let current = false;

      // Parse volunteer experience dates similar to work experience
      if (vol.duration && typeof vol.duration === 'string') {
        const parsedDates = this.parseDurationToStartEnd(vol.duration);
        startDate = parsedDates.startDate;
        endDate = parsedDates.endDate;
        current = endDate === 'Present';
      } else if (vol.start_date || vol.end_date) {
        startDate = vol.start_date || vol.starts_at || '';
        endDate = vol.end_date || vol.ends_at || (vol.current ? 'Present' : '');
        current = vol.current || endDate === 'Present';
      } else if (vol.years || vol.months) {
        const calculatedDates = this.calculateDatesFromDuration(vol.years, vol.months);
        startDate = calculatedDates.startDate;
        endDate = calculatedDates.endDate;
      }

      return {
        id: `vol-${index}-${Date.now()}`,
        organization: vol.organization || vol.company || vol.org_name || '',
        role: vol.role || vol.position || vol.title || '',
        cause: vol.cause || vol.field || vol.area || '',
        startDate: startDate,
        endDate: endDate,
        current: current,
        description: vol.description || vol.summary || vol.details || ''
      };
    }) : [];

    const cvData = {
      personalInfo: {
        fullName: profile.name,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: '', // Will be filled by user later
        phone: '', // Will be filled by user later
        website: profile.website || '',
        address: profile.location,
        location: profile.location,
        linkedin: `https://linkedin.com/in/${linkedinUsername}`,
        summary: originalSummary, // Use original summary, not AI-generated
        profileImage: profile.profilePicture || ''
      },
      experience: profile.experience.map((exp: any, index: number) => ({
        id: exp.id || `exp-${index}-${Date.now()}`,
        company: exp.company,
        position: exp.title || exp.position,
        startDate: exp.startDate || exp.duration?.split(' - ')[0] || '',
        endDate: exp.endDate || exp.duration?.split(' - ')[1] || '',
        current: exp.current || false,
        description: exp.description,
        location: exp.location || ''
      })),
      education: profile.education.map((edu: any, index: number) => ({
        id: edu.id || `edu-${index}-${Date.now()}`,
        institution: edu.school || edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate || edu.duration?.split(' - ')[0] || '',
        endDate: edu.endDate || edu.duration?.split(' - ')[1] || '',
        current: edu.current || false,
        gpa: edu.gpa || '',
        description: edu.description || ''
      })),
      skills: profile.skills.map((skill, index) => ({
        id: `skill-${index}-${Date.now()}`,
        name: skill,
        level: 'Intermediate' as const
      })),
      languages: Array.isArray(profile.languages) ? profile.languages.map((lang: any, index: number) => ({
        id: `lang-${index}-${Date.now()}`,
        name: typeof lang === 'string' ? lang : lang.name,
        proficiency: typeof lang === 'string' ? 'Professional' : (lang.proficiency || 'Professional')
      })) : [],
      projects: transformedProjects,
      certifications: transformedCertifications,
      volunteerExperience: transformedVolunteer,
      publications: [],
      honorsAwards: [],
      testScores: [],
      recommendations: [],
      courses: [],
      source: 'linkedin_import',
      importedAt: new Date().toISOString()
    };

    console.log('💾 Saving CV data with skills:', {
      skillsCount: cvData.skills.length,
      skillsData: cvData.skills
    });

    const cv = await prisma.cV.create({
      data: {
        userId,
        title: `${profile.name} - LinkedIn Import`,
        cv_data: cvData,
        templateId: 'professional',
        createdAt: new Date()
      }
    });

    console.log('✅ CV created successfully with ID:', cv.id);
    return cv.id;
  }

  /**
   * Save import session to track usage
   */
  private async saveImportSession(userId: string, linkedinUsername: string, success: boolean, profileData?: any): Promise<void> {
    try {
      await prisma.importSession.create({
        data: {
          userId,
          type: success ? 'linkedin_success' : 'linkedin_failed',
          data: JSON.stringify({
            platform: 'linkedin',
            profileUsername: linkedinUsername,
            success,
            profileData: profileData || {},
            timestamp: new Date().toISOString()
          }),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });
    } catch (error) {
      console.error('Error saving import session:', error);
    }
  }

  /**
   * Import LinkedIn profile and create CV
   */
  async importLinkedInProfile(userId: string, linkedinInput: string): Promise<LinkedInImportResult> {
    try {
      // Check import limits
      const limitCheck = await this.checkImportLimit(userId);
      if (!limitCheck.canImport) {
        return {
          success: false,
          error: `Günlük LinkedIn idxal limitiniz dolmuşdur. Sizin ${limitCheck.userTier} paketiniz gündə ${
            LINKEDIN_LIMITS[limitCheck.userTier as keyof typeof LINKEDIN_LIMITS]
          } idxal imkanı verir.`,
          remainingImports: limitCheck.remainingImports
        };
      }

      // Extract LinkedIn username
      const linkedinUsername = this.extractLinkedInUsername(linkedinInput);
      if (!linkedinUsername) {
        return {
          success: false,
          error: 'Yanlış LinkedIn URL və ya istifadəçi adı formatı',
          remainingImports: limitCheck.remainingImports
        };
      }

      // Scrape LinkedIn profile
      const profile = await this.scrapeLinkedInProfile(linkedinUsername);
      if (!profile) {
        await this.saveImportSession(userId, linkedinUsername, false);
        return {
          success: false,
          error: 'Linkedin idxal edilə bilmədi. Linki yoxlayın.',
          remainingImports: limitCheck.remainingImports
        };
      }

      // Create CV from profile
      const cvId = await this.createCVFromProfile(userId, profile, linkedinUsername);

      // Save successful import session
      await this.saveImportSession(userId, linkedinUsername, true, profile);

      // Get updated remaining imports
      const updatedLimitCheck = await this.checkImportLimit(userId);

      return {
        success: true,
        profile,
        cvId,
        remainingImports: updatedLimitCheck.remainingImports
      };

    } catch (error) {
      console.error('LinkedIn import error:', error);
      return {
        success: false,
        error: 'LinkedIn idxal zamanı gözlənilməz xəta baş verdi',
        remainingImports: 0
      };
    }
  }

  /**
   * Generate AI-powered professional summary for Medium and Premium users
   * This is now a separate method that can be called manually
   */
  async generateAISummary(userId: string, cvId: string): Promise<{ success: boolean; summary?: string; error?: string }> {
    try {
      // Check user tier
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true }
      });

      if (!user) {
        return { success: false, error: 'İstifadəçi tapılmadı' };
      }

      // Only allow Medium and Premium users to generate AI summaries
      if (user.tier === 'Free') {
        return {
          success: false,
          error: 'AI xülasə yaratma yalnız Orta və Premium abunəçilər üçün mövcuddur. Bu xüsusiyyətə daxil olmaq üçün paketinizi yüksəldin.'
        };
      }

      // Get CV data
      const cv = await prisma.cV.findUnique({
        where: { id: cvId, userId },
        select: { cv_data: true }
      });

      if (!cv) {
        return { success: false, error: 'CV tapılmadı' };
      }

      const cvData = cv.cv_data as any;
      const personalInfo = cvData.personalInfo || {};
      const experience = cvData.experience || [];
      const education = cvData.education || [];
      const skills = cvData.skills || [];
      const projects = cvData.projects || [];
      const awards = cvData.awards || [];
      const languages = cvData.languages || [];

      const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Create different prompts based on user tier
      let prompt = '';

      if (user.tier === 'Medium') {
        prompt = `
          Create a professional summary for this candidate optimized for ATS (Applicant Tracking System) compatibility:

          Personal Information:
          - Name: ${personalInfo.fullName || 'Professional'}
          - Current Title/Role: ${personalInfo.title || experience[0]?.position || 'Professional'}
          - Location: ${personalInfo.location || ''}
          - Current Summary: ${personalInfo.summary || ''}

          Professional Experience:
          ${experience.slice(0, 3).map((exp: any) => 
            `- ${exp.position || exp.title} at ${exp.company} (${exp.startDate || ''} - ${exp.endDate || 'Present'})
             Key responsibilities: ${exp.description || exp.summary || 'Professional role'}`
          ).join('\n')}

          Education:
          ${education.slice(0, 2).map((edu: any) => 
            `- ${edu.degree || edu.qualification} in ${edu.field || edu.fieldOfStudy} from ${edu.institution || edu.school}`
          ).join('\n')}

          Core Skills: ${skills.slice(0, 8).map((skill: any) => skill.name || skill).join(', ')}

          Requirements:
          1. Write 3-4 sentences (80-120 words)
          2. Start with years of experience or professional title
          3. Include 3-4 key technical skills naturally
          4. Mention industry or domain expertise
          5. Include one key achievement or strength
          6. Use action verbs and professional language
          7. Optimize for ATS by using industry keywords
          8. Make it engaging but professional
          9. Focus on value proposition to employers

          Write a compelling professional summary that would make this candidate stand out to recruiters and pass ATS screening.
        `;
      } else if (user.tier === 'Premium') {
        prompt = `
          Create an executive-level professional summary for this candidate, optimized for senior positions and ATS compatibility:

          Personal Information:
          - Name: ${personalInfo.fullName || 'Executive Professional'}
          - Current Title/Role: ${personalInfo.title || experience[0]?.position || 'Senior Professional'}
          - Location: ${personalInfo.location || ''}
          - Current Summary: ${personalInfo.summary || ''}

          Professional Experience:
          ${experience.map((exp: any) => 
            `- ${exp.position || exp.title} at ${exp.company} (${exp.startDate || ''} - ${exp.endDate || 'Present'})
             Key achievements: ${exp.description || exp.summary || 'Leadership role with significant impact'}`
          ).join('\n')}

          Education:
          ${education.map((edu: any) => 
            `- ${edu.degree || edu.qualification} in ${edu.field || edu.fieldOfStudy} from ${edu.institution || edu.school} (${edu.graduationYear || ''})`
          ).join('\n')}

          Technical Skills: ${skills.map((skill: any) => skill.name || skill).join(', ')}

          Key Projects:
          ${projects.slice(0, 3).map((project: any) => 
            `- ${project.title || project.name}: ${project.description || 'Significant project contribution'}`
          ).join('\n')}

          Awards & Recognition:
          ${awards.slice(0, 3).map((award: any) => 
            `- ${award.name || award.title}: ${award.description || award.organization || 'Professional recognition'}`
          ).join('\n')}

          Languages: ${languages.map((lang: any) => `${lang.name || lang} (${lang.proficiency || 'Proficient'})`).join(', ')}

          Premium Requirements:
          1. Write 4-5 sentences (120-180 words) 
          2. Lead with years of experience and seniority level
          3. Highlight leadership experience and team management
          4. Include quantifiable achievements when possible
          5. Mention strategic thinking and business impact
          6. Include 5-6 key technical and soft skills naturally
          7. Reference industry expertise and domain knowledge
          8. Add international experience or multi-cultural competency if applicable
          9. Include innovation, transformation, or growth achievements
          10. Use executive-level language and terminology
          11. Optimize heavily for ATS with industry-specific keywords
          12. Position as a solution-oriented leader and decision maker
          13. Include collaboration and stakeholder management skills

          Create a powerful executive summary that positions this candidate as a strategic leader ready for C-level or senior management roles, while ensuring ATS optimization for maximum visibility.
        `;
      }

      const result = await model.generateContent(prompt);
      const aiSummary = result.response.text().trim();

      // Clean up the AI response (remove any markdown or extra formatting)
      const cleanedSummary = aiSummary
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/\*/g, '') // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
        .trim();

      // Update CV with AI-generated summary
      const updatedCvData = {
        ...cvData,
        personalInfo: {
          ...personalInfo,
          summary: cleanedSummary
        }
      };

      await prisma.cV.update({
        where: { id: cvId },
        data: { cv_data: updatedCvData }
      });

      // Log the AI summary generation for analytics
      await prisma.importSession.create({
        data: {
          userId,
          type: 'ai_summary_generated',
          data: JSON.stringify({
            tier: user.tier,
            cvId,
            summaryLength: cleanedSummary.length,
            timestamp: new Date().toISOString()
          }),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      return { success: true, summary: cleanedSummary };
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return { success: false, error: 'AI xülasəsi yaratmaq mümkün olmadı. Zəhmət olmasa, yenidən cəhd edin.' };
    }
  }

  /**
   * Parse volunteer experience data from ScrapingDog response with enhanced field mapping
   */
  private parseVolunteerExperience(data: any): LinkedInProfile['volunteering'] {
    console.log('❤️ Parsing volunteer experience data:', data);

    // Check multiple possible volunteer field names
    const volunteerSources = [
      data.volunteering,
      data.volunteer_experience,
      data.volunteer,
      data.volunteers,
      data.volunteer_work,
      data.community_service,
      data.social_work
    ];

    let volunteerData: any[] = [];

    // Find volunteer data from available sources
    for (const source of volunteerSources) {
      if (Array.isArray(source) && source.length > 0) {
        volunteerData = source;
        console.log('✅ Found volunteer data in source:', source);
        break;
      }
    }

    // If no dedicated volunteer fields, check experience array for volunteer entries
    if (volunteerData.length === 0 && Array.isArray(data.experience)) {
      console.log('🔍 Searching for volunteer entries in experience array...');

      volunteerData = data.experience.filter((exp: any) => {
        const title = (exp.title || exp.position || '').toLowerCase();
        const company = (exp.company || exp.company_name || '').toLowerCase();
        const description = (exp.description || '').toLowerCase();

        const volunteerKeywords = [
          'volunteer', 'voluntary', 'könüllü', 'community', 'charity', 'non-profit',
          'nonprofit', 'ngo', 'foundation', 'social', 'humanitarian', 'civic',
          'community service', 'volunteer work', 'social work'
        ];

        return volunteerKeywords.some(keyword =>
          title.includes(keyword) ||
          company.includes(keyword) ||
          description.includes(keyword)
        );
      });

      if (volunteerData.length > 0) {
        console.log(`🎯 Found ${volunteerData.length} volunteer entries in experience`);
      }
    }

    if (volunteerData.length === 0) {
      console.log('❌ No volunteer experience data found');
      return [];
    }

    // Parse and transform volunteer data
    return volunteerData.map((vol: any, index: number) => {
      let duration = '';
      let startDate = '';
      let endDate = '';
      let current = false;

      // Parse dates using the same logic as work experience
      if (vol.duration && typeof vol.duration === 'string') {
        duration = vol.duration;
        const parsedDates = this.parseDurationToStartEnd(duration);
        startDate = parsedDates.startDate;
        endDate = parsedDates.endDate;
        current = endDate === 'Present';
      } else if (vol.start_date || vol.end_date || vol.starts_at || vol.ends_at) {
        startDate = vol.start_date || vol.starts_at || '';
        endDate = vol.end_date || vol.ends_at || (vol.current ? 'Present' : '');
        current = vol.current || endDate === 'Present';
        duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      } else if (vol.years || vol.months) {
        const calculatedDates = this.calculateDatesFromDuration(vol.years, vol.months);
        startDate = calculatedDates.startDate;
        endDate = calculatedDates.endDate;
        duration = `${startDate} - ${endDate}`;
      }

      const volunteerEntry = {
        organization: vol.organization || vol.company || vol.company_name || vol.org_name ||
                     vol.institution || vol.foundation || '',
        role: vol.role || vol.position || vol.title || vol.job_title || 'Volunteer',
        cause: vol.cause || vol.field || vol.area || vol.sector || vol.focus_area ||
               vol.mission || vol.purpose || '',
        duration: duration,
        startDate: startDate,
        endDate: endDate,
        current: current,
        description: vol.description || vol.summary || vol.details || vol.about ||
                    vol.responsibilities || ''
      };

      console.log(`🔧 Transformed volunteer entry ${index + 1}:`, volunteerEntry);
      return volunteerEntry;
    }).filter((vol: any) => vol.organization.trim() !== '' || vol.role.trim() !== '');
  }
}

export const linkedInImportService = new LinkedInImportService();
