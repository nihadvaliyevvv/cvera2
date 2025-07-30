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
  experience: Array<{
    title: string;
    company: string;
    duration: string;
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
}

export interface LinkedInImportResult {
  success: boolean;
  profile?: LinkedInProfile;
  cvId?: string;
  error?: string;
  remainingImports?: number;
}

export class LinkedInImportService {
  private readonly SCRAPINGDOG_API_KEY = '6882894b855f5678d36484c8';
  private readonly SCRAPINGDOG_URL = 'https://api.scrapingdog.com/linkedin';

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

      const params = {
        api_key: this.SCRAPINGDOG_API_KEY,
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

      // Try to get first and last name separately
      if (data.first_name && data.last_name) {
        firstName = data.first_name.trim();
        lastName = data.last_name.trim();
        fullName = `${firstName} ${lastName}`.trim();
      }
      // If we have fullName but not separate names, try to split
      else if (data.fullName || data.name) {
        fullName = (data.fullName || data.name).trim();
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = fullName;
          lastName = '';
        }
      }

      const profile: LinkedInProfile = {
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        headline: data.headline || data.sub_title || '',
        summary: data.about || data.summary || '',
        location: data.location || data.geo_location || '',
        experience: this.parseExperience(data.experience),
        education: this.parseEducation(data.education),
        skills: this.parseSkills(data),
        languages: Array.isArray(data.languages) ? data.languages : []
      };

      return profile;
    } catch (error) {
      console.error('💥 LinkedIn scraping error:', error);
      return null;
    }
  }

  /**
   * Parse experience data from ScrapingDog response
   */
  private parseExperience(experienceData: any[]): LinkedInProfile['experience'] {
    if (!Array.isArray(experienceData)) return [];

    return experienceData.map(exp => ({
      title: exp.title || exp.position || '',
      company: exp.company || exp.company_name || '',
      duration: exp.duration || exp.date_range || '',
      description: exp.description || exp.summary || ''
    }));
  }

  /**
   * Parse education data from ScrapingDog response
   */
  private parseEducation(educationData: any[]): LinkedInProfile['education'] {
    if (!Array.isArray(educationData)) return [];

    return educationData.map(edu => ({
      school: edu.school || edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || edu.field_of_study || '',
      duration: edu.duration || edu.date_range || ''
    }));
  }

  /**
   * Parse skills from various possible fields in ScrapingDog response
   */
  private parseSkills(data: any): string[] {
    const skillSources = [
      data.skills,
      data.skillsArray,
      data.skill,
      data.endorsements,
      data.competencies
    ];

    for (const source of skillSources) {
      if (Array.isArray(source) && source.length > 0) {
        return source.filter(skill => typeof skill === 'string' && skill.trim());
      }
    }

    return [];
  }

  /**
   * Generate AI-enhanced professional summary using Gemini
   */
  private async generateProfessionalSummary(profile: LinkedInProfile): Promise<string> {
    try {
      const model = geminiAI.getGenerativeModel({ model: 'gemini-pro' });

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
    const professionalSummary = await this.generateProfessionalSummary(profile);

    const cvData = {
      personalInfo: {

        fullName: profile.name,
        email: '', // Will be filled by user later
        phone: '', // Will be filled by user later
        address: profile.location,
        location: profile.location,
        linkedin: `https://linkedin.com/in/${linkedinUsername}`,
        summary: professionalSummary
      },
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      languages: profile.languages,
      source: 'linkedin_import',
      importedAt: new Date().toISOString()
    };

    const cv = await prisma.cV.create({
      data: {
        userId,
        title: `${profile.name} - LinkedIn Import`,
        cv_data: cvData,
        templateId: 'professional',
        createdAt: new Date()
      }
    });

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
          error: `Daily LinkedIn import limit reached. Your ${limitCheck.userTier} plan allows ${
            LINKEDIN_LIMITS[limitCheck.userTier as keyof typeof LINKEDIN_LIMITS]
          } imports per day.`,
          remainingImports: limitCheck.remainingImports
        };
      }

      // Extract LinkedIn username
      const linkedinUsername = this.extractLinkedInUsername(linkedinInput);
      if (!linkedinUsername) {
        return {
          success: false,
          error: 'Invalid LinkedIn URL or username format',
          remainingImports: limitCheck.remainingImports
        };
      }

      // Scrape LinkedIn profile
      const profile = await this.scrapeLinkedInProfile(linkedinUsername);
      if (!profile) {
        await this.saveImportSession(userId, linkedinUsername, false);
        return {
          success: false,
          error: 'Failed to fetch LinkedIn profile. Please check the username/URL and try again.',
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
        error: 'An unexpected error occurred during LinkedIn import',
        remainingImports: 0
      };
    }
  }
}

export const linkedInImportService = new LinkedInImportService();
