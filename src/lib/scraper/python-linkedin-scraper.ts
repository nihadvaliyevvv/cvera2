import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

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

class PythonLinkedInScraper {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(process.cwd(), 'linkedin_python_scraper.py');
  }

  private async runPythonScript(args: string[]): Promise<LinkedInProfile> {
    return new Promise((resolve, reject) => {
      console.log('🐍 Python LinkedIn scraper çalışdırılır...');
      console.log('📋 Arqumentlər:', args);

      const pythonProcess = spawn('python3', [this.pythonScriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('🐍 Python output:', output);
        stdout += output;
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('🐍 Python error:', error);
        stderr += error;
      });

      pythonProcess.on('close', (code) => {
        console.log(`🐍 Python proses bitdi, kod: ${code}`);

        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          // JSON output-u stdout-dan çıxar
          const jsonStart = stdout.indexOf('{"name"');
          const jsonEnd = stdout.lastIndexOf('}') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            // JSON faylından oxu
            const outputFile = path.join(process.cwd(), 'linkedin_profile_output.json');
            if (fs.existsSync(outputFile)) {
              const jsonData = fs.readFileSync(outputFile, 'utf-8');
              const profileData = JSON.parse(jsonData);
              resolve(profileData);
            } else {
              reject(new Error('LinkedIn profile data not found in output'));
            }
          } else {
            const jsonString = stdout.substring(jsonStart, jsonEnd);
            const profileData = JSON.parse(jsonString);
            resolve(profileData);
          }
        } catch (error) {
          console.error('❌ JSON parse xətası:', error);
          reject(new Error(`Failed to parse LinkedIn profile data: ${error}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Python proses xətası:', error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  async manualLoginAndScrapeOwnProfile(): Promise<LinkedInProfile> {
    console.log('🚀 Manuel LinkedIn login + scraping başladılır...');
    console.log('📋 Python script browser açacaq - manual giriş lazımdır');
    
    try {
      const profileData = await this.runPythonScript(['manual']);
      
      console.log('✅ Python LinkedIn scraper uğurla tamamlandı!');
      console.log(`📊 Profil: ${profileData.name || 'Ad tapılmadı'}`);
      console.log(`💼 Başlıq: ${profileData.headline || 'Başlıq tapılmadı'}`);
      console.log(`📍 Yer: ${profileData.location || 'Yer tapılmadı'}`);
      console.log(`📋 Təcrübə: ${profileData.experience?.length || 0} dənə`);
      console.log(`🎓 Təhsil: ${profileData.education?.length || 0} dənə`);
      console.log(`💪 Bacarıqlar: ${profileData.skills?.length || 0} dənə`);
      
      return profileData;
    } catch (error) {
      console.error('❌ Python LinkedIn scraper xətası:', error);
      throw new Error(`Python LinkedIn scraping failed: ${error}`);
    }
  }

  async loginAndScrapeOwnProfile(email: string, password: string): Promise<LinkedInProfile> {
    console.log('🚀 Avtomatik LinkedIn login + scraping başladılır...');
    console.log('🔐 Email və password ilə giriş...');
    
    try {
      const profileData = await this.runPythonScript(['auto', email, password]);
      
      console.log('✅ Python LinkedIn scraper uğurla tamamlandı!');
      console.log(`📊 Profil: ${profileData.name || 'Ad tapılmadı'}`);
      console.log(`💼 Başlıq: ${profileData.headline || 'Başlıq tapılmadı'}`);
      
      return profileData;
    } catch (error) {
      console.error('❌ Python LinkedIn scraper xətası:', error);
      throw new Error(`Python LinkedIn scraping failed: ${error}`);
    }
  }

  async scrapeProfile(url: string, email?: string, password?: string): Promise<LinkedInProfile> {
    console.log(`🚀 LinkedIn profil scraping: ${url}`);
    
    if (email && password) {
      console.log('🔐 Təyin edilmiş profil və credentials ilə scraping...');
      
      try {
        const profileData = await this.runPythonScript(['auto', email, password, url]);
        
        console.log('✅ Python LinkedIn scraper uğurla tamamlandı!');
        return profileData;
      } catch (error) {
        console.error('❌ Python LinkedIn scraper xətası:', error);
        throw new Error(`Python LinkedIn scraping failed: ${error}`);
      }
    } else {
      throw new Error('Bu profil scraping üçün email və password lazımdır');
    }
  }

  async initialize(): Promise<void> {
    // Python scraper üçün initialization lazım deyil
    console.log('🐍 Python LinkedIn scraper hazırdır');
  }

  async close(): Promise<void> {
    // Python scraper öz browser-ini bağlayır
    console.log('🐍 Python LinkedIn scraper bağlandı');
  }
}

// Export new Python-based scraper
export { PythonLinkedInScraper as LinkedInScraper };

// Manuel giriş ilə scraping funksiyası
export async function scrapeLinkedInProfileWithManualLogin(): Promise<LinkedInProfile> {
  const scraper = new PythonLinkedInScraper();
  try {
    console.log('🔐 Manuel LinkedIn profil scraping başladılır...');
    await scraper.initialize();
    const profile = await scraper.manualLoginAndScrapeOwnProfile();
    return profile;
  } finally {
    await scraper.close();
  }
}

// Avtomatik giriş ilə scraping funksiyası
export async function scrapeOwnLinkedInProfile(email: string, password: string): Promise<LinkedInProfile> {
  const scraper = new PythonLinkedInScraper();
  
  try {
    console.log('🔐 Öz LinkedIn profil scraping başladılır...');
    await scraper.initialize();
    const profile = await scraper.loginAndScrapeOwnProfile(email, password);
    return profile;
  } finally {
    await scraper.close();
  }
}

// Ümumi profil scraping funksiyası
export async function scrapeLinkedInProfile(url: string, email?: string, password?: string): Promise<LinkedInProfile> {
  const scraper = new PythonLinkedInScraper();
  
  try {
    await scraper.initialize();
    const profile = await scraper.scrapeProfile(url, email, password);
    return profile;
  } finally {
    await scraper.close();
  }
}
