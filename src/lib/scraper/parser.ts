import { LinkedInProfile, Experience, Education } from './scrapingdog-linkedin-scraper';

export interface ParsedCVData {
  personalInfo: {
    name: string;
    headline: string;
    location: string;
    about: string;
    profileImage?: string;
  };
  workExperience: WorkExperience[];
  education: EducationEntry[];
  skills: string[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  duration: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface LanguageEntry {
  name: string;
  proficiency: string;
}

export class LinkedInParser {
  
  static parseProfile(profile: LinkedInProfile): ParsedCVData {
    return {
      personalInfo: this.parsePersonalInfo(profile),
      workExperience: this.parseWorkExperience(profile.experience),
      education: this.parseEducation(profile.education),
      skills: this.parseSkills(profile.skills),
      certifications: this.parseCertifications(profile.certifications),
      languages: this.parseLanguages(profile.languages)
    };
  }

  private static parsePersonalInfo(profile: LinkedInProfile) {
    return {
      name: this.cleanText(profile.name),
      headline: this.cleanText(profile.headline),
      location: this.cleanText(profile.location),
      about: this.cleanText(profile.about),
      profileImage: profile.profileImage
    };
  }

  private static parseWorkExperience(experiences: Experience[]): WorkExperience[] {
    return experiences.map(exp => {
      const { startDate, endDate } = this.parseDateRange(exp.date_range);
      
      return {
        title: this.cleanText(exp.position),
        company: this.cleanText(exp.company),
        duration: this.cleanText(exp.date_range),
        location: this.cleanText(exp.location),
        description: this.cleanText(exp.description),
        startDate,
        endDate
      };
    }).filter(exp => exp.title); // Filter out empty entries
  }

  private static parseEducation(educations: Education[]): EducationEntry[] {
    return educations.map(edu => {
      const { startDate, endDate } = this.parseDateRange(edu.date_range);
      
      return {
        institution: this.cleanText(edu.school),
        degree: this.cleanText(edu.degree),
        fieldOfStudy: this.cleanText(edu.field_of_study),
        duration: this.cleanText(edu.date_range),
        startDate,
        endDate
      };
    }).filter(edu => edu.institution); // Filter out empty entries
  }

  private static parseSkills(skills: string[]): string[] {
    return skills
      .map(skill => this.cleanText(skill))
      .filter(skill => skill.length > 0)
      .slice(0, 50); // Limit to top 50 skills
  }

  private static parseCertifications(certifications: any[]): CertificationEntry[] {
    return certifications.map(cert => ({
      name: this.cleanText(cert.name),
      issuer: this.cleanText(cert.issuer),
      date: this.cleanText(cert.date),
      credentialId: cert.credential_id ? this.cleanText(cert.credential_id) : undefined
    })).filter(cert => cert.name); // Filter out empty entries
  }

  private static parseLanguages(languages: any[]): LanguageEntry[] {
    return languages.map(lang => ({
      name: this.cleanText(lang.name),
      proficiency: this.cleanText(lang.proficiency || 'Not specified')
    })).filter(lang => lang.name); // Filter out empty entries
  }

  private static parseDateRange(dateRange: string): { startDate?: string; endDate?: string } {
    if (!dateRange) return {};

    const cleanRange = this.cleanText(dateRange);
    
    // Common date patterns
    const patterns = [
      // "Jan 2020 - Present" or "Jan 2020 - Dec 2023"
      /(\w{3}\s+\d{4})\s*[-–]\s*(\w{3}\s+\d{4}|Present)/i,
      // "2020 - 2023" or "2020 - Present"
      /(\d{4})\s*[-–]\s*(\d{4}|Present)/i,
      // "Jan 2020" (single date)
      /(\w{3}\s+\d{4})/i,
      // "2020" (year only)
      /(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = cleanRange.match(pattern);
      if (match) {
        const startDate = match[1];
        const endDate = match[2] && match[2].toLowerCase() !== 'present' ? match[2] : undefined;
        
        return {
          startDate: this.standardizeDate(startDate),
          endDate: endDate ? this.standardizeDate(endDate) : undefined
        };
      }
    }

    return {};
  }

  private static standardizeDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Convert month abbreviations to numbers
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    const cleanDate = dateStr.toLowerCase().trim();
    
    // Handle "MMM YYYY" format
    const monthYearMatch = cleanDate.match(/(\w{3})\s+(\d{4})/);
    if (monthYearMatch) {
      const month = monthMap[monthYearMatch[1]];
      const year = monthYearMatch[2];
      return month ? `${year}-${month}` : dateStr;
    }

    // Handle "YYYY" format
    const yearMatch = cleanDate.match(/^(\d{4})$/);
    if (yearMatch) {
      return yearMatch[1];
    }

    return dateStr;
  }

  private static cleanText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/[\r\t]/g, ' ')
      .trim();
  }

  // Convert parsed data to CV format compatible with existing system
  static toCVFormat(parsedData: ParsedCVData): any {
    return {
      personalInfo: {
        fullName: parsedData.personalInfo.name,
        title: parsedData.personalInfo.headline,
        location: parsedData.personalInfo.location,
        summary: parsedData.personalInfo.about,
        profileImage: parsedData.personalInfo.profileImage
      },
      experience: parsedData.workExperience.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate || 'Present',
        location: exp.location,
        description: exp.description
      })),
      education: parsedData.education.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate
      })),
      skills: parsedData.skills,
      certifications: parsedData.certifications,
      languages: parsedData.languages
    };
  }
}

// Utility functions
export function validateLinkedInUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_.]+\/?$/,
    /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/?$/
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

export function extractUsernameFromUrl(url: string): string | null {
  const patterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9\-_.]+)/,
    /linkedin\.com\/pub\/([a-zA-Z0-9\-_.]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}
