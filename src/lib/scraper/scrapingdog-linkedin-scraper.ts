import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  about: string;
  professionalSummary?: string; // AI-generated professional summary
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  profileImage?: string;
  // Əlavə məlumatlar
  contactInfo?: {
    email: string;
    phone: string;
    website: string;
    twitter: string;
    linkedin: string;
  };
  connections?: string;
  followers?: string;
  // ScrapingDog-specific fields
  projects?: Project[];
  awards?: Award[];
  volunteerExperience?: VolunteerExperience[];
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

export interface Project {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string;
  url: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

export interface VolunteerExperience {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  cause: string;
}

class ScrapingDogLinkedInScraper {
  private apiKey: string;
  private baseUrl: string;
  private geminiAI: GoogleGenerativeAI;

  constructor() {
    this.apiKey = '6882894b855f5678d36484c8';
    this.baseUrl = 'https://api.scrapingdog.com/linkedin';
    
    // Gemini AI-ni initialize et
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable tapılmadı');
    }
    this.geminiAI = new GoogleGenerativeAI(geminiApiKey);
  }

  // Gemini AI ilə profil məlumatlarından skills çıxar
  private async extractSkillsWithAI(profile: any): Promise<string[]> {
    try {
      console.log('🤖 Gemini AI ilə skills çıxarılır...');
      
      // Profil məlumatlarını Gemini üçün hazırla
      const profileText = this.prepareProfileTextForAI(profile);
      
      const model = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
LinkedIn profil məlumatlarına əsasən bu şəxsin əsas 5-6 professional skills/bacarıqlarını müəyyən et.

Profil məlumatları:
${profileText}

Qaydalar:
1. Yalnız texniki və professional bacarıqları seç
2. Profilin iş təcrübəsi və təhsilinə uyğun olsun  
3. JavaScript formatlı array olaraq cavab ver
4. Hər skill 1-3 kelimə olsun
5. Azərbaycan, ingilis və ya texniki terminlər istifadə et

Nümunə format: ["JavaScript", "React", "Node.js", "SQL", "Agile", "Testing"]

Skills:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // AI cavabından array çıxar
      const skillsArray = this.parseAISkillsResponse(text);
      
      console.log(`✅ Gemini AI ${skillsArray.length} skills tapıldı:`, skillsArray);
      return skillsArray;
      
    } catch (error) {
      console.error('❌ Gemini AI skills çıxarma xətası:', error);
      // Fallback: boş array
      return [];
    }
  }

  // API data-dan skills çıxar (AI olmadan)
  private extractSkillsFromApiData(profile: any): string[] {
    try {
      // ScrapingDog API-də skills field-i mövcud deyil
      // Boş array qaytar, frontend-də manual əlavə edəcəklər
      console.log('📋 API-dən skills çıxarılır (LinkedIn skills scraping dəstəklənmir)');
      return [];
    } catch (error) {
      console.error('❌ API skills çıxarma xətası:', error);
      return [];
    }
  }

  // Gemini AI ilə professional summary generasiya et
  /**
   * Generate professional summary using AI - Public method for API endpoints
   */
  public async generateProfessionalSummaryPublic(profileText: string): Promise<string> {
    try {
      console.log('🤖 Gemini AI ilə Professional Summary generasiya edilir...');
      
      const model = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
Based on this LinkedIn profile information, create a professional CV summary in English.

Profile Data:
${profileText}

Requirements:
1. Write in English only
2. 3-4 sentences (80-120 words)
3. Professional tone suitable for CV/Resume
4. Highlight key expertise, experience level, and value proposition
5. Include specific technical skills and industry experience
6. Use active voice and strong action words
7. Focus on achievements and impact
8. Make it compelling for employers

Format: Return only the professional summary text, no extra formatting or quotes.

Professional Summary:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let summary = response.text().trim();
      
      // Clean up the response
      summary = summary.replace(/^["']|["']$/g, ''); // Remove quotes
      summary = summary.replace(/^Professional Summary:\s*/i, ''); // Remove prefix if present
      
      console.log('✅ Professional Summary generasiya edildi');
      console.log(`📊 Uzunluq: ${summary.length} simvol`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Gemini AI Professional Summary xətası:', error);
      // Fallback summary
      return 'Experienced professional with a strong background in technology and business development. Proven track record of delivering results and driving innovation in fast-paced environments.';
    }
  }

  // Original private method for internal usage
  private async generateProfessionalSummary(profile: any): Promise<string> {
    try {
      console.log('📝 Gemini AI ilə Professional Summary generasiya edilir...');
      
      // Profil məlumatlarını hazırla
      const profileText = this.prepareProfileTextForAI(profile);
      
      const model = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
Based on the LinkedIn profile information below, create a professional CV summary in English.

Profile Information:
${profileText}

Requirements:
1. Write in English only
2. 3-4 sentences (80-120 words)
3. Professional tone suitable for CV/Resume
4. Highlight key expertise, experience level, and value proposition
5. Include specific technical skills and industry experience
6. Use active voice and strong action words
7. Focus on achievements and impact
8. Make it compelling for employers

Format: Return only the professional summary text, no extra formatting or quotes.

Professional Summary:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let summary = response.text().trim();
      
      // Clean up the response
      summary = summary.replace(/^["']|["']$/g, ''); // Remove quotes
      summary = summary.replace(/^Professional Summary:?\s*/i, ''); // Remove "Professional Summary:" prefix
      summary = summary.replace(/\n+/g, ' '); // Replace newlines with spaces
      summary = summary.replace(/\s+/g, ' '); // Multiple spaces to single space
      
      console.log('✅ Professional Summary generasiya edildi');
      console.log(`📊 Uzunluq: ${summary.length} simvol`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Professional Summary generasiya xətası:', error);
      // Fallback: Create basic summary from existing data
      return this.createFallbackSummary(profile);
    }
  }

  // Fallback professional summary (AI olmadan)
  private createFallbackSummary(profile: any): string {
    const parts = [];
    
    // Experience based summary
    if (profile.experience && profile.experience.length > 0) {
      const latestJob = profile.experience[0];
      const yearsExp = profile.experience.length > 3 ? "experienced" : "skilled";
      parts.push(`${yearsExp} ${latestJob.position || 'professional'}`);
      
      if (latestJob.company_name || latestJob.company) {
        parts.push(`at ${latestJob.company_name || latestJob.company}`);
      }
    }
    
    // Education/Field
    if (profile.education && profile.education.length > 0) {
      const education = profile.education[0];
      if (education.college_degree_field || education.field_of_study) {
        parts.push(`with background in ${education.college_degree_field || education.field_of_study}`);
      }
    }
    
    // Basic summary
    const summary = parts.length > 0 
      ? parts.join(' ') + '. Focused on delivering high-quality solutions and driving business growth through technical expertise.'
      : 'Experienced professional with strong technical skills and proven track record of delivering results in dynamic environments.';
    
    return summary;
  }

  // Profil mətnini AI üçün hazırla
  private prepareProfileTextForAI(profile: any): string {
    const sections = [];
    
    // Şəxsi məlumatlar
    if (profile.fullName) sections.push(`Ad: ${profile.fullName}`);
    if (profile.headline) sections.push(`Başlıq: ${profile.headline}`);
    if (profile.about) sections.push(`Haqqında: ${profile.about.substring(0, 500)}`);
    
    // İş təcrübəsi
    if (profile.experience && profile.experience.length > 0) {
      sections.push('\nİş Təcrübəsi:');
      profile.experience.slice(0, 3).forEach((exp: any, index: number) => {
        sections.push(`${index + 1}. ${exp.position} - ${exp.company_name || exp.company}`);
        if (exp.summary) {
          sections.push(`   Təsvir: ${exp.summary.substring(0, 200)}`);
        }
      });
    }
    
    // Təhsil
    if (profile.education && profile.education.length > 0) {
      sections.push('\nTəhsil:');
      profile.education.slice(0, 2).forEach((edu: any, index: number) => {
        sections.push(`${index + 1}. ${edu.college_degree || edu.degree} - ${edu.college_name || edu.school}`);
        if (edu.college_degree_field || edu.field_of_study) {
          sections.push(`   Sahə: ${edu.college_degree_field || edu.field_of_study}`);
        }
      });
    }
    
    // Layihələr
    if (profile.projects && profile.projects.length > 0) {
      sections.push('\nLayihələr:');
      profile.projects.slice(0, 3).forEach((project: any, index: number) => {
        sections.push(`${index + 1}. ${project.title}`);
      });
    }
    
    // Mükafatlar/Sertifikatlar
    if (profile.awards && profile.awards.length > 0) {
      sections.push('\nMükafatlar:');
      profile.awards.slice(0, 3).forEach((award: any, index: number) => {
        sections.push(`${index + 1}. ${award.name}`);
      });
    }
    
    return sections.join('\n');
  }

  // AI cavabından skills array-ni parse et
  private parseAISkillsResponse(text: string): string[] {
    try {
      // JSON array axtarışı
      const jsonMatch = text.match(/\[([^\]]+)\]/);
      if (jsonMatch) {
        const arrayString = jsonMatch[0];
        const skills = JSON.parse(arrayString);
        if (Array.isArray(skills)) {
          return skills.map(skill => skill.toString().replace(/['"]/g, '').trim()).filter(skill => skill.length > 0);
        }
      }
      
      // Sadə string parse
      const lines = text.split('\n');
      const skills: string[] = [];
      
      for (const line of lines) {
        // Bullet points və ya nömrələnmiş siyahı
        const match = line.match(/^[\d\-\*\•]\s*([^,\n]+)/);
        if (match) {
          const skill = match[1].trim().replace(/['"]/g, '');
          if (skill.length > 0 && skills.length < 6) {
            skills.push(skill);
          }
        }
        
        // Vergüllə ayrılmış
        if (line.includes(',')) {
          const commaSeparated = line.split(',');
          commaSeparated.forEach(item => {
            const skill = item.trim().replace(/['"]/g, '').replace(/^\d+\.\s*/, '');
            if (skill.length > 0 && skills.length < 6) {
              skills.push(skill);
            }
          });
        }
      }
      
      return skills.slice(0, 6); // Maksimum 6 skills
      
    } catch (error) {
      console.error('❌ AI cavabını parse etmə xətası:', error);
      return [];
    }
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

  private async transformScrapingDogData(rawData: any, generateAI: boolean = false): Promise<LinkedInProfile> {
    // ScrapingDog returns an array with a single profile object
    const profile = Array.isArray(rawData) ? rawData[0] : rawData;
    
    if (!profile) {
      throw new Error('ScrapingDog API boş məlumat qaytardı');
    }

    console.log('🔄 ScrapingDog məlumatları çevrilir...');
    console.log('📊 Yalnız vacib sahələr işlənir (server performansı üçün optimize edilib)');
    console.log('✅ Əldə edilən sahələr: Şəxsi Məlumatlar, İş Təcrübəsi, Təhsil, Bacarıqlar, Dillər, Layihələr, Sertifikatlar, Könüllü Təcrübə');

    // AI ilə skills və professional summary generasiya et (opsional)
    let skills: string[] = [];
    let professionalSummary: string = '';
    
    if (generateAI) {
      console.log('🤖 Generating AI content...');
      [skills, professionalSummary] = await Promise.all([
        this.extractSkillsWithAI(profile),
        this.generateProfessionalSummary(profile)
      ]);
      console.log('✅ AI content generated');
    } else {
      console.log('⚠️  AI content generation skipped (generateAI = false)');
      // Extract skills from API data or empty array
      skills = this.extractSkillsFromApiData(profile);
    }

    return {
      name: profile.fullName || profile.name || '',
      headline: profile.headline || '',
      location: profile.location || '',
      about: profile.about || '',
      professionalSummary: professionalSummary,
      
      // Experience mapping with ScrapingDog field names
      experience: (profile.experience || []).map((exp: any) => ({
        position: exp.position || '',
        company: exp.company_name || exp.company || '',
        date_range: exp.duration || `${exp.starts_at || ''} - ${exp.ends_at || ''}`,
        location: exp.location || '',
        description: exp.summary || exp.description || ''
      })),
      
      // Education mapping with ScrapingDog field names
      education: (profile.education || []).map((edu: any) => ({
        school: edu.college_name || edu.school || edu.institution || '',
        degree: edu.college_degree || edu.degree || '',
        field_of_study: edu.college_degree_field || edu.field_of_study || '',
        date_range: edu.college_duration || edu.duration || edu.date_range || ''
      })),
      
      // Skills - Gemini AI ilə profil məlumatlarından çıxarılır
      skills: skills,
      
      // Languages - direct mapping from ScrapingDog
      languages: (profile.languages || []).map((lang: any) => ({
        name: typeof lang === 'string' ? lang : (lang.name || lang.language || ''),
        proficiency: typeof lang === 'string' ? 'Professional' : (lang.proficiency || lang.level || 'Professional')
      })),
      
      // Projects - direct mapping from ScrapingDog
      projects: (profile.projects || []).map((proj: any) => ({
        name: proj.title || proj.name || '',
        description: proj.summary || proj.description || '',
        startDate: proj.starts_at || proj.start_date || '',
        endDate: proj.ends_at || proj.end_date || '',
        skills: '',
        url: proj.url || proj.link || ''
      })),
      
      // Certifications - ScrapingDog calls it 'certification'
      certifications: (profile.certification || profile.certifications || []).map((cert: any) => ({
        name: cert.name || cert.title || '',
        issuer: cert.organization || cert.authority || cert.issuer || '',
        date: cert.duration || cert.date || cert.issued_date || '',
        credential_id: cert.credential_id || ''
      })),
      
      // Awards as certifications (ScrapingDog specific)
      awards: (profile.awards || []).map((award: any) => ({
        name: award.name || award.title || '',
        issuer: award.organization || award.authority || '',
        date: award.duration || award.date || '',
        credential_id: ''
      })),
      
      // Volunteer experience - ScrapingDog calls it 'volunteering'
      volunteerExperience: (profile.volunteering || profile.volunteer_experience || []).map((vol: any) => ({
        organization: vol.organization || vol.company || '',
        role: vol.role || vol.position || vol.title || '',
        startDate: vol.starts_at || vol.start_date || '',
        endDate: vol.ends_at || vol.end_date || '',
        description: vol.summary || vol.description || '',
        cause: vol.cause || vol.field || ''
      })),
      
      profileImage: profile.profile_photo || profile.profileImage || '',
      
      contactInfo: {
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        linkedin: profile.public_profile_url || `https://www.linkedin.com/in/${profile.public_identifier}` || ''
      },
      
      connections: profile.connections || '',
      followers: profile.followers || ''
    };
  }

  async scrapeProfile(linkedinUrl: string, premium: boolean = false, generateAI: boolean = false): Promise<LinkedInProfile> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 ScrapingDog API ilə LinkedIn profil scraping başlayır: ${linkedinUrl} (Cəhd: ${attempt}/${maxRetries})`);
        
        // LinkedIn ID-ni çıxar
        const linkedinId = this.extractLinkedInId(linkedinUrl);
        
        // API parametrləri - yalnız vacib sahələr (server yükünü azaltmaq üçün)
        const params = {
          api_key: this.apiKey,
          type: 'profile',
          linkId: linkedinId,
          premium: premium ? 'true' : 'false',
          // Yalnız bu sahələri əldə et:
          // Şəxsi Məlumatlar, İş Təcrübəsi, Təhsil, Bacarıqlar, Dillər, Layihələr, Sertifikatlar, Könüllü Təcrübə
          fields: 'name,headline,location,about,experience,education,skills,certifications,languages,projects,volunteer_experience'
        };

        console.log('📡 ScrapingDog API-yə sorğu göndərilir...');
        console.log('🔧 Parametrlər:', { ...params, api_key: '***hidden***' });

        // Vercel üçün optimize edilmiş timeout
        const timeout = process.env.VERCEL ? 45000 : 60000; // Vercel-də 45s, local-da 60s
        
        // API sorğusu
        const response = await axios.get(this.baseUrl, { 
          params: params,
          timeout: timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          // Vercel üçün əlavə konfigrasiya
          validateStatus: function (status) {
            return status >= 200 && status < 500; // 500+ xətaları throw etmə
          }
        });

        console.log(`📨 API Response Status: ${response.status}`);

        if (response.status !== 200) {
          // Rate limit və ya müvəqqəti xətalar üçün retry
          if (response.status === 429 || response.status >= 500) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
              console.log(`⏳ ${delay}ms gözləyir və yenidən cəhd edəcək...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
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

        // Profile məlumatlarını transform et (AI parametri ilə)
        const profile = await this.transformScrapingDogData(apiData, generateAI);

        // Minimum məlumat yoxlaması
        if (!profile.name && !profile.headline) {
          console.warn('⚠️ Minimum profil məlumatları tapılmadı');
          console.log('🔍 Raw API response:', JSON.stringify(apiData, null, 2));
        }

        console.log('✅ LinkedIn profil scraping uğurla tamamlandı!');
        return profile;

      } catch (error) {
        console.error(`❌ ScrapingDog LinkedIn scraping xətası (Cəhd ${attempt}/${maxRetries}):`, error);
        
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
                // Rate limit - retry etməyə davam et
                if (attempt < maxRetries) {
                  const delay = baseDelay * Math.pow(2, attempt);
                  console.log(`⏳ Rate limit - ${delay}ms gözləyir və yenidən cəhd edəcək...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                }
                throw new Error('ScrapingDog API rate limit keçildi. Bir az gözləyin');
              case 500:
              case 502:
              case 503:
                // Server xətaları - retry et
                if (attempt < maxRetries) {
                  const delay = baseDelay * Math.pow(2, attempt);
                  console.log(`⏳ Server xətası - ${delay}ms gözləyir və yenidən cəhd edəcək...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                }
                throw new Error('ScrapingDog API server xətası');
              default:
                throw new Error(`ScrapingDog API xətası: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            }
          } else if (error.request) {
            // Network xətası - retry et
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt);
              console.log(`⏳ Şəbəkə xətası - ${delay}ms gözləyir və yenidən cəhd edəcək...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error('ScrapingDog API-yə əlaqə yaradıla bilmədi. Şəbəkə bağlantısını yoxlayın');
          } else if (error.code === 'ENOTFOUND') {
            throw new Error('ScrapingDog API server tapılmadı. DNS xətası ola bilər');
          } else if (error.code === 'ECONNABORTED') {
            // Timeout xətası - retry et
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt);
              console.log(`⏳ Timeout xətası - ${delay}ms gözləyir və yenidən cəhd edəcək...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error('ScrapingDog API timeout. Sorğu çox vaxt aldı');
          }
        }
        
        // Son cəhd idi və hələ də xəta var
        if (attempt === maxRetries) {
          throw new Error(`LinkedIn scraping xətası (${maxRetries} cəhddən sonra): ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
        }
      }
    }
    
    // Bu nöqtəyə çatmamalı, amma TypeScript üçün
    throw new Error('LinkedIn scraping xətası: Bütün cəhdlər uğursuz oldu');
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
    // generateAI = false - AI summary manual olaraq yaradılacaq (Medium/Premium feature)
    const profile = await scrapingDogScraper.scrapeProfile(url, false, false);
    
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
