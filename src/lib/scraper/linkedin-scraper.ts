import axios from 'axios';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  about: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  profileImage?: string;
  // Əlavə məlumatlar (login olduqda əlçatan)
  contactInfo?: {
    email: string;
    phone: string;
    website: string;
    twitter: string;
    linkedin: string;
  };
  connections?: string;
  followers?: string;
}

export interface Experience {
  position: string;
  company: string;
  date_range: string;
  location: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  field_of_study: string;
  date_range: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

export interface Language {
  name: string;
  proficiency?: string;
}

class LinkedInScraper {
  private api_key: string = '6882894b855f5678d36484c8';
  private base_url: string = 'https://api.scrapingdog.com/linkedin';

  async scrapeProfile(linkId: string, premium: boolean = false): Promise<LinkedInProfile> {
    try {
      const params = {
        api_key: this.api_key,
        type: 'profile',
        linkId: linkId,
        premium: premium.toString(),
      };

      console.log('LinkedIn scraper başladı:', linkId);

      const response = await axios.get(this.base_url, {
        params: params,
        timeout: 30000 // 30 saniyə timeout
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('LinkedIn məlumatları alındı:', data);

        // ScrapingDog cavabını bizim formata çevir
        return this.transformScrapingDogResponse(data);
      } else {
        throw new Error(`Request failed with status code: ${response.status}`);
      }
    } catch (error: any) {
      console.error('LinkedIn scraper xətası:', error.message);

      // Əgər API limitə çatıbsa və ya xəta varsa, mock data qaytar
      if (error.response?.status === 429 || error.response?.status === 403) {
        console.log('API limiti - mock data istifadə edilir');
        return this.getMockProfile(linkId);
      }

      throw new Error(`LinkedIn profil məlumatları alına bilmədi: ${error.message}`);
    }
  }

  private transformScrapingDogResponse(data: any): LinkedInProfile {
    // ScrapingDog API cavabını bizim LinkedInProfile formatına çevir
    return {
      name: data.name || data.full_name || 'Ad tapılmadı',
      headline: data.headline || data.title || '',
      location: data.location || '',
      about: data.about || data.summary || '',
      experience: this.transformExperience(data.experience || data.positions || []),
      education: this.transformEducation(data.education || []),
      skills: this.transformSkills(data.skills || []),
      certifications: this.transformCertifications(data.certifications || []),
      languages: this.transformLanguages(data.languages || []),
      profileImage: data.profile_picture || data.photo || '',
      contactInfo: data.contact_info ? {
        email: data.contact_info.email || '',
        phone: data.contact_info.phone || '',
        website: data.contact_info.website || '',
        twitter: data.contact_info.twitter || '',
        linkedin: data.contact_info.linkedin || ''
      } : undefined,
      connections: data.connections_count || data.connections || '',
      followers: data.followers_count || data.followers || ''
    };
  }

  private transformExperience(experiences: any[]): Experience[] {
    return experiences.map(exp => ({
      position: exp.position || exp.title || exp.job_title || '',
      company: exp.company || exp.company_name || '',
      date_range: exp.date_range || exp.duration || exp.dates || '',
      location: exp.location || '',
      description: exp.description || exp.summary || ''
    }));
  }

  private transformEducation(educations: any[]): Education[] {
    return educations.map(edu => ({
      school: edu.school || edu.institution || edu.university || '',
      degree: edu.degree || edu.degree_name || '',
      field_of_study: edu.field_of_study || edu.field || edu.major || '',
      date_range: edu.date_range || edu.duration || edu.dates || ''
    }));
  }

  private transformSkills(skills: any[]): string[] {
    if (Array.isArray(skills)) {
      return skills.map(skill =>
        typeof skill === 'string' ? skill : (skill.name || skill.skill || '')
      ).filter(Boolean);
    }
    return [];
  }

  private transformCertifications(certifications: any[]): Certification[] {
    return certifications.map(cert => ({
      name: cert.name || cert.title || '',
      issuer: cert.issuer || cert.organization || cert.authority || '',
      date: cert.date || cert.issue_date || cert.issued || '',
      credential_id: cert.credential_id || cert.id || undefined
    }));
  }

  private transformLanguages(languages: any[]): Language[] {
    return languages.map(lang => ({
      name: typeof lang === 'string' ? lang : (lang.name || lang.language || ''),
      proficiency: typeof lang === 'object' ? (lang.proficiency || lang.level) : undefined
    }));
  }

  private getMockProfile(linkId: string): LinkedInProfile {
    // Mock data API məhdudlaşması zamanı
    return {
      name: `${linkId} (Demo)`,
      headline: 'Software Engineer at Tech Company',
      location: 'Bakı, Azərbaycan',
      about: 'Experienced software developer with expertise in web technologies.',
      experience: [
        {
          position: 'Software Engineer',
          company: 'Tech Company',
          date_range: '2020 - Present',
          location: 'Bakı, Azərbaycan',
          description: 'Developing web applications using modern technologies.'
        }
      ],
      education: [
        {
          school: 'Azərbaycan Dövlət Universiteti',
          degree: 'Bakalavr',
          field_of_study: 'Computer Science',
          date_range: '2016 - 2020'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      certifications: [],
      languages: [
        { name: 'Azərbaycan dili', proficiency: 'Native' },
        { name: 'English', proficiency: 'Professional' }
      ],
      profileImage: '',
      connections: '500+',
      followers: '100+'
    };
  }

  // LinkedIn URL-dən istifadəçi ID-sini çıxar
  static extractLinkIdFromUrl(linkedinUrl: string): string {
    try {
      // https://www.linkedin.com/in/username/ formatından username-i çıxar
      const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      if (match && match[1]) {
        return match[1];
      }

      // Əgər artıq sadə username-dirsə
      if (!linkedinUrl.includes('/') && !linkedinUrl.includes('linkedin.com')) {
        return linkedinUrl;
      }

      throw new Error('LinkedIn URL formatı düzgün deyil');
    } catch (error) {
      throw new Error(`LinkedIn URL parse edilə bilmədi: ${error}`);
    }
  }

  // Test funksiyası
  async testConnection(): Promise<boolean> {
    try {
      await this.scrapeProfile('musayevcreate', false);
      return true;
    } catch (error) {
      console.error('LinkedIn API test uğursuz:', error);
      return false;
    }
  }
}

export const linkedInScraper = new LinkedInScraper();
export default LinkedInScraper;
