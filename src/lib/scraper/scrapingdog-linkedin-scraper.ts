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

class ScrapingDogLinkedInScraper {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = '6882894b855f5678d36484c8';
    this.baseUrl = 'https://api.scrapingdog.com/linkedin';
  }

  private extractLinkedInId(url: string): string {
    console.log(`🔍 LinkedIn URL-dən ID çıxarılır: ${url}`);
    
    // LinkedIn URL formatları:
    // https://www.linkedin.com/in/username/
    // https://linkedin.com/in/username
    // linkedin.com/in/username
    
    const patterns = [
      /linkedin\.com\/in\/([^\/\?]+)/i,
      /linkedin\.com\/pub\/([^\/\?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const linkedinId = match[1].toLowerCase();
        console.log(`✅ LinkedIn ID tapıldı: ${linkedinId}`);
        return linkedinId;
      }
    }
    
    throw new Error(`Keçersiz LinkedIn URL formatı: ${url}`);
  }

  private transformScrapingDogResponse(data: any): LinkedInProfile {
    console.log('🔄 ScrapingDog response-u LinkedIn profile formatına çevrilir...');
    
    // ScrapingDog API returns an array, so take the first element
    const profileData = Array.isArray(data) ? data[0] : data;
    
    if (!profileData) {
      throw new Error('ScrapingDog API-dan profil məlumatı alınmadı');
    }
    
    const profile: LinkedInProfile = {
      name: profileData.fullName || profileData.full_name || profileData.name || '',
      headline: profileData.headline || profileData.title || profileData.current_position || '',
      location: profileData.location || profileData.current_location || '',
      about: profileData.about || profileData.summary || '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      profileImage: profileData.profile_photo || profileData.profile_picture || profileData.image_url || '',
      contactInfo: {
        email: profileData.email || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        twitter: profileData.twitter || '',
        linkedin: `https://www.linkedin.com/in/${profileData.public_identifier || ''}` || profileData.linkedin_url || profileData.url || ''
      },
      connections: profileData.connections || profileData.connection_count || '',
      followers: profileData.followers || profileData.follower_count || ''
    };

    // Experience məlumatlarını transform et
    if (profileData.experience && Array.isArray(profileData.experience)) {
      profile.experience = profileData.experience.map((exp: any) => ({
        position: exp.position || exp.title || exp.job_title || '',
        company: exp.company_name || exp.company || '',
        date_range: exp.duration || `${exp.starts_at || ''} - ${exp.ends_at || ''}`.trim(),
        location: exp.location || '',
        description: exp.summary || exp.description || ''
      }));
    }

    // Education məlumatlarını transform et
    if (profileData.education && Array.isArray(profileData.education)) {
      profile.education = profileData.education.map((edu: any) => ({
        school: edu.college_name || edu.school || edu.institution || edu.university || '',
        degree: edu.college_degree || edu.degree || edu.qualification || '',
        field_of_study: edu.college_degree_field || edu.field_of_study || edu.field || edu.major || '',
        date_range: edu.college_duration || edu.date_range || edu.duration || edu.dates || ''
      }));
    }

    // Skills məlumatlarını transform et - ScrapingDog-da skills ayrıca olmaya bilər
    if (profileData.skills && Array.isArray(profileData.skills)) {
      profile.skills = profileData.skills.map((skill: any) => 
        typeof skill === 'string' ? skill : (skill.name || skill.skill || '')
      ).filter((skill: string) => skill.length > 0);
    }

    // Certifications məlumatlarını transform et
    if (profileData.certification && Array.isArray(profileData.certification)) {
      profile.certifications = profileData.certification.map((cert: any) => ({
        name: cert.name || cert.title || cert.certification || '',
        issuer: cert.issuer || cert.organization || cert.authority || '',
        date: cert.date || cert.issue_date || cert.issued || cert.duration || '',
        credential_id: cert.credential_id || cert.id || ''
      }));
    }

    // Awards-i certifications kimi əlavə et
    if (profileData.awards && Array.isArray(profileData.awards)) {
      const awardsAsCerts = profileData.awards.map((award: any) => ({
        name: award.name || award.title || '',
        issuer: award.organization || 'Award',
        date: award.duration || '',
        credential_id: ''
      }));
      profile.certifications = [...profile.certifications, ...awardsAsCerts];
    }

    // Languages məlumatlarını transform et
    if (profileData.languages && Array.isArray(profileData.languages)) {
      profile.languages = profileData.languages.map((lang: any) => ({
        name: typeof lang === 'string' ? lang : (lang.name || lang.language || ''),
        proficiency: typeof lang === 'object' ? (lang.proficiency || lang.level || '') : ''
      }));
    }

    console.log('✅ ScrapingDog response uğurla transform edildi');
    console.log(`📊 Profile summary: ${profile.name}, ${profile.experience.length} exp, ${profile.education.length} edu, ${profile.skills.length} skills`);
    
    return profile;
  }

  async scrapeProfile(linkedinUrl: string, premium: boolean = false): Promise<LinkedInProfile> {
    try {
      console.log(`🚀 ScrapingDog API ilə LinkedIn profil scraping başlayır: ${linkedinUrl}`);
      
      // LinkedIn ID-ni çıxar
      const linkedinId = this.extractLinkedInId(linkedinUrl);
      
      // API parametrləri
      const params = {
        api_key: this.apiKey,
        type: 'profile',
        linkId: linkedinId,
        premium: premium ? 'true' : 'false'
      };

      console.log('📡 ScrapingDog API-yə sorğu göndərilir...');
      console.log('🔧 Parametrlər:', { ...params, api_key: '***hidden***' });

      // API sorğusu
      const response = await axios.get(this.baseUrl, { 
        params: params,
        timeout: 60000, // 60 saniyə timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      console.log(`📨 API Response Status: ${response.status}`);

      if (response.status !== 200) {
        throw new Error(`ScrapingDog API xətası: ${response.status} - ${response.statusText}`);
      }

      const apiData = response.data;
      console.log('✅ ScrapingDog API-dan məlumat alındı');
      
      // API response-un strukturunu yoxla
      if (!apiData) {
        throw new Error('ScrapingDog API-dan boş cavab alındı');
      }

      // Xəta mesajlarını yoxla
      if (apiData.error || apiData.message) {
        throw new Error(`ScrapingDog API xətası: ${apiData.error || apiData.message}`);
      }

      // Rate limit yoxlaması
      if (apiData.remaining_requests !== undefined) {
        console.log(`📊 Qalan sorğu sayı: ${apiData.remaining_requests}`);
      }

      // Profile məlumatlarını transform et
      const profile = this.transformScrapingDogResponse(apiData);

      // Minimum məlumat yoxlaması
      if (!profile.name && !profile.headline) {
        console.warn('⚠️ Minimum profil məlumatları tapılmadı');
        console.log('🔍 Raw API response:', JSON.stringify(apiData, null, 2));
      }

      console.log('✅ LinkedIn profil scraping uğurla tamamlandı!');
      return profile;

    } catch (error) {
      console.error('❌ ScrapingDog LinkedIn scraping xətası:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('📡 API Response Error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
          
          // Spesifik xətalar
          switch (error.response.status) {
            case 401:
              throw new Error('ScrapingDog API açarı yanlışdır və ya vaxtı keçmişdir');
            case 402:
              throw new Error('ScrapingDog API limitiniz bitib. Premium plan lazımdır');
            case 403:
              throw new Error('ScrapingDog API-yə giriş qadağandır');
            case 404:
              throw new Error('LinkedIn profili tapılmadı və ya mövcud deyil');
            case 429:
              throw new Error('ScrapingDog API limiti keçildi. Bir az gözləyin');
            case 500:
              throw new Error('ScrapingDog API server xətası');
            default:
              throw new Error(`ScrapingDog API xətası: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
          }
        } else if (error.request) {
          throw new Error('ScrapingDog API-yə əlaqə yaradıla bilmədi. İnternet bağlantınızı yoxlayın');
        }
      }
      
      throw new Error(`LinkedIn scraping xətası: ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
    }
  }

  async scrapeOwnProfile(linkedinId: string, premium: boolean = false): Promise<LinkedInProfile> {
    console.log(`🔐 Öz LinkedIn profiliniz scraping edilir: ${linkedinId}`);
    
    // LinkedIn URL formatına çevir
    const linkedinUrl = `https://www.linkedin.com/in/${linkedinId}`;
    
    return await this.scrapeProfile(linkedinUrl, premium);
  }

  // Batch scraping - çoxlu profil üçün
  async scrapeMultipleProfiles(urls: string[], premium: boolean = false): Promise<LinkedInProfile[]> {
    console.log(`🔄 ${urls.length} LinkedIn profili batch scraping edilir...`);
    
    const results: LinkedInProfile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`📋 Progress: ${i + 1}/${urls.length} - ${url}`);
      
      try {
        const profile = await this.scrapeProfile(url, premium);
        results.push(profile);
        
        // Rate limiting üçün gözləmə (ScrapingDog API limiti)
        if (i < urls.length - 1) {
          console.log('⏳ Rate limiting üçün 2 saniyə gözlənilir...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        const errorMsg = `${url}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`✅ Batch scraping tamamlandı: ${results.length} uğurlu, ${errors.length} xəta`);
    
    if (errors.length > 0) {
      console.log('❌ Xətalar:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    return results;
  }

  // API status yoxlaması
  async checkApiStatus(): Promise<{ status: string; remaining_requests?: number; message?: string }> {
    try {
      console.log('📡 ScrapingDog API status yoxlanır...');
      
      // Test profili ilə API-ni yoxla
      const testParams = {
        api_key: this.apiKey,
        type: 'profile',
        linkId: 'test',
        premium: 'false'
      };

      const response = await axios.get(this.baseUrl, { 
        params: testParams,
        timeout: 10000
      });

      return {
        status: 'active',
        remaining_requests: response.data?.remaining_requests,
        message: 'API işləyir'
      };

    } catch (error) {
      console.error('❌ API status yoxlaması xətası:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: 'error',
          message: `API xətası: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`
        };
      }

      return {
        status: 'error',
        message: 'API-yə əlaqə yaradıla bilmədi'
      };
    }
  }
}

// Export single instance
const scrapingDogScraper = new ScrapingDogLinkedInScraper();

// Main export functions
export async function scrapeLinkedInProfile(url: string, email?: string, password?: string): Promise<LinkedInProfile> {
  console.log(`🚀 LinkedIn profile scraping: ${url}`);
  console.log('📡 ScrapingDog API istifadə olunur');
  
  try {
    // ScrapingDog API email/password istəmir, yalnız URL lazımdır
    const profile = await scrapingDogScraper.scrapeProfile(url, false);
    
    console.log('✅ LinkedIn profil scraping tamamlandı');
    return profile;
    
  } catch (error) {
    console.error('❌ LinkedIn scraping xətası:', error);
    throw error;
  }
}

export async function scrapeOwnLinkedInProfile(linkedinId: string): Promise<LinkedInProfile> {
  console.log(`🔐 Öz LinkedIn profil scraping: ${linkedinId}`);
  console.log('📡 ScrapingDog API istifadə olunur');
  
  try {
    const profile = await scrapingDogScraper.scrapeOwnProfile(linkedinId);
    
    console.log('✅ Öz LinkedIn profil scraping tamamlandı');
    return profile;
    
  } catch (error) {
    console.error('❌ Öz LinkedIn scraping xətası:', error);
    throw error;
  }
}

export async function scrapeLinkedInProfileWithManualLogin(): Promise<LinkedInProfile> {
  // ScrapingDog API manual login tələb etmir
  console.log('📡 ScrapingDog API manual login tələb etmir');
  console.log('💡 Əvəzinə scrapeOwnLinkedInProfile() istifadə edin');
  
  throw new Error('ScrapingDog API ilə manual login lazım deyil. scrapeOwnLinkedInProfile() istifadə edin');
}

// Batch scraping utility
export async function scrapeMultipleLinkedInProfiles(urls: string[]): Promise<LinkedInProfile[]> {
  console.log(`🔄 Çoxlu LinkedIn profil scraping: ${urls.length} profil`);
  
  try {
    const profiles = await scrapingDogScraper.scrapeMultipleProfiles(urls);
    
    console.log(`✅ Batch scraping tamamlandı: ${profiles.length} profil`);
    return profiles;
    
  } catch (error) {
    console.error('❌ Batch scraping xətası:', error);
    throw error;
  }
}

// API status utility
export async function checkScrapingDogApiStatus(): Promise<{ status: string; remaining_requests?: number; message?: string }> {
  console.log('📡 ScrapingDog API status yoxlanır...');
  
  try {
    const status = await scrapingDogScraper.checkApiStatus();
    
    console.log(`📊 API Status: ${status.status}`);
    if (status.remaining_requests) {
      console.log(`📈 Remaining requests: ${status.remaining_requests}`);
    }
    
    return status;
    
  } catch (error) {
    console.error('❌ API status yoxlama xətası:', error);
    throw error;
  }
}

// Export the scraper class if needed
export { ScrapingDogLinkedInScraper };
