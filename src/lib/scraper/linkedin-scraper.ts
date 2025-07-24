import puppeteer, { Browser, Page } from 'puppeteer';

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

export class LinkedInScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  constructor() {}

  async initialize(forceVisible: boolean = false): Promise<void> {
    try {
      console.log('🚀 Browser başladılır...');
      
      // Linux üçün daha uyğun konfiqurasiya
      const browserArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];

      // Debug və manual login üçün headless false
      const isProduction = process.env.NODE_ENV === 'production';
      const forceVisible = process.env.LINKEDIN_MANUAL_LOGIN === 'true';
      
      // Chrome executable path-ni tapın
      const fs = await import('fs');
      const chromePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
      ];
      
      let executablePath = undefined;
      for (const path of chromePaths) {
        if (fs.existsSync(path)) {
          executablePath = path;
          console.log(`✅ Chrome tapıldı: ${path}`);
          break;
        }
      }
      
      this.browser = await puppeteer.launch({
        headless: forceVisible ? false : (isProduction ? true : false), // Manual login üçün görünür
        args: browserArgs,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: executablePath, // Sistem Chrome istifadə et
        timeout: 30000
      });

      console.log('✅ Browser uğurla başladıldı');

      this.page = await this.browser.newPage();
      
      // Set viewport and additional headers
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });

      // Disable automation indicators
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Set languages and plugins
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
        
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      });

      // Block unnecessary resources to speed up loading
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

    } catch (error) {
      console.error('❌ Browser başlatma xətası:', error);
      
      // Daha detallı error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Chrome path yoxla
      console.log('🔍 Chrome path yoxlanır...');
      const fs = await import('fs');
      const chromePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
      ];
      
      const availablePaths = chromePaths.filter(path => {
        try {
          return fs.existsSync(path);
        } catch {
          return false;
        }
      });
      
      console.log('📍 Mövcud Chrome paths:', availablePaths);
      
      throw new Error(`Browser initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Available Chrome paths: ${availablePaths.join(', ')}`);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log('🔐 LinkedIn-ə giriş edilir...');
      
      // LinkedIn login səhifəsinə gedin
      await this.page.goto('https://www.linkedin.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      console.log('📝 Login məlumatları daxil edilir...');
      
      // Email daxil edin - daha etibarlı selector
      const emailSelectors = [
        'input[name="session_key"]',
        'input[id="username"]',
        'input[type="email"]',
        '#session_key'
      ];
      
      let emailInput = null;
      for (const selector of emailSelectors) {
        emailInput = await this.page.$(selector);
        if (emailInput) {
          console.log(`✅ Email input tapıldı: ${selector}`);
          break;
        }
      }
      
      if (!emailInput) {
        throw new Error('Email input tapılmadı');
      }
      
      await emailInput.type(email, { delay: 100 });

      // Password daxil edin - daha etibarlı selector  
      const passwordSelectors = [
        'input[name="session_password"]',
        'input[id="password"]',
        'input[type="password"]',
        '#session_password'
      ];
      
      let passwordInput = null;
      for (const selector of passwordSelectors) {
        passwordInput = await this.page.$(selector);
        if (passwordInput) {
          console.log(`✅ Password input tapıldı: ${selector}`);
          break;
        }
      }
      
      if (!passwordInput) {
        throw new Error('Password input tapılmadı');
      }
      
      await passwordInput.type(password, { delay: 100 });

      // Login düyməsini tap və bas
      const submitSelectors = [
        'button[type="submit"]',
        '.btn-primary[type="submit"]',
        '[data-litms-control-urn="login-submit"]',
        '.sign-in-form__submit-button'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = await this.page.$(selector);
        if (submitButton) {
          console.log(`✅ Submit button tapıldı: ${selector}`);
          break;
        }
      }
      
      if (!submitButton) {
        throw new Error('Submit button tapılmadı');
      }
      
      await submitButton.click();
      
      console.log('⏳ Giriş təsdiq edilir...');
      
      // Giriş uğurlu olduğunu yoxlayın
      try {
        await this.page.waitForNavigation({ 
          waitUntil: 'networkidle2', 
          timeout: 15000 
        });
        
        const currentUrl = this.page.url();
        console.log('🔗 Yönləndirmə URL-i:', currentUrl);
        
        // LinkedIn feed və ya profile səhifəsinə yönləndirilmişsə giriş uğurludur
        if (currentUrl.includes('linkedin.com/feed') || 
            currentUrl.includes('linkedin.com/in/') ||
            currentUrl.includes('linkedin.com/mynetwork') ||
            !currentUrl.includes('login')) {
          
          this.isLoggedIn = true;
          console.log('✅ LinkedIn-ə uğurla giriş edildi');
          
          // 2FA və ya captcha varsa bir az gözləyin
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          return true;
        } else {
          console.log('❌ Giriş uğursuz - yönləndirmə düzgün deyil');
          return false;
        }
        
      } catch (navigationError) {
        console.log('⚠️ Navigation gözləmə problemi, URL yoxlanır...');
        
        const currentUrl = this.page.url();
        const pageTitle = await this.page.title();
        
        console.log('📄 Hazırki səhifə:', pageTitle);
        console.log('🔗 Hazırki URL:', currentUrl);
        
        // Manual yoxlama - əgər login səhifəsində deyilsə uğurludur
        if (!currentUrl.includes('login') && !currentUrl.includes('challenge')) {
          this.isLoggedIn = true;
          console.log('✅ Giriş uğurlu görünür (manual yoxlama)');
          return true;
        }
        
        // CAPTCHA və ya 2FA yoxlayın
        const hasCaptcha = await this.page.$('.captcha') !== null;
        const has2FA = await this.page.$('[data-test-id="challenge"]') !== null;
        
        if (hasCaptcha) {
          console.log('🤖 CAPTCHA aşkarlandı - manual müdaxilə lazımdır');
          console.log('🔧 Brauzerdə CAPTCHA həll edin və davam edin...');
          
          // CAPTCHA üçün 60 saniyə gözləyin
          await new Promise(resolve => setTimeout(resolve, 60000));
          
          const finalUrl = this.page.url();
          if (!finalUrl.includes('login')) {
            this.isLoggedIn = true;
            console.log('✅ CAPTCHA həll edildikdən sonra giriş uğurlu');
            return true;
          }
        }
        
        if (has2FA) {
          console.log('🔐 2FA aşkarlandı - manual kod daxil etmə lazımdır');
          console.log('🔧 Brauzerdə 2FA kodunu daxil edin...');
          
          // 2FA üçün 90 saniyə gözləyin
          await new Promise(resolve => setTimeout(resolve, 90000));
          
          const finalUrl = this.page.url();
          if (!finalUrl.includes('login') && !finalUrl.includes('challenge')) {
            this.isLoggedIn = true;
            console.log('✅ 2FA tamamlandıqdan sonra giriş uğurlu');
            return true;
          }
        }
        
        console.log('❌ Giriş uğursuz');
        return false;
      }
      
    } catch (error) {
      console.error('Login xətası:', error);
      
      // Screenshot debug üçün
      await this.page.screenshot({ path: 'linkedin-login-error.png' });
      console.log('📸 Login xəta screenshot: linkedin-login-error.png');
      
      throw new Error(`Login uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Yeni metod: Login eden istifadəçinin öz profil URL-ini tap
  async getCurrentUserProfileUrl(): Promise<string> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Login olunmamış. Əvvəlcə login() çağırın.');
    }

    try {
      console.log('🔍 Hazırki istifadəçinin profil URL-i axtarılır...');
      
      // LinkedIn feed səhifəsinə gedin (əgər orada deyilsə)
      const currentUrl = this.page.url();
      if (!currentUrl.includes('linkedin.com/feed')) {
        await this.page.goto('https://www.linkedin.com/feed/', { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
      }

      // Profil linki üçün selector-lar
      const profileLinkSelectors = [
        'a[href*="/in/"][data-test-id="nav-profile-link"]',
        '.global-nav__me-photo',
        '.global-nav__me-content a[href*="/in/"]',
        '[data-test-id="nav-profile-photo"]',
        '.feed-identity-module a[href*="/in/"]',
        'a[href*="/in/me"]',
        '.nav-item a[href*="/in/"]',
        'a[aria-label*="profile"]'
      ];

      let profileUrl = '';
      
      for (const selector of profileLinkSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const href = await element.evaluate(el => el.getAttribute('href'));
            if (href && href.includes('/in/')) {
              // Relative URL-ni absolute URL-ə çevir
              profileUrl = href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
              console.log(`✅ Profil URL tapıldı (${selector}): ${profileUrl}`);
              break;
            }
          }
        } catch (selectorError) {
          console.log(`⚠️ Selector uğursuz: ${selector}`);
        }
      }

      // Əgər yuxarıda tapılmadısa, səhifədəki bütün linkləri yoxla
      if (!profileUrl) {
        console.log('🔍 Səhifədəki bütün /in/ linkləri yoxlanır...');
        
        const allProfileLinks = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/in/"]'));
          return links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.includes('/in/') && !href.includes('/company/'))
            .map(href => href?.startsWith('http') ? href : `https://www.linkedin.com${href}`);
        });

        console.log('🔗 Tapılan profil linkləri:', allProfileLinks.slice(0, 5));
        
        if (allProfileLinks.length > 0) {
          // İlk uyğun linki götür
          profileUrl = allProfileLinks[0] || '';
        }
      }

      // Son çarə: Me səhifəsinə get və URL-i əldə et
      if (!profileUrl) {
        console.log('🔄 /me səhifəsinə yönləndirilir...');
        try {
          await this.page.goto('https://www.linkedin.com/in/me/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          const finalUrl = this.page.url();
          if (finalUrl.includes('/in/') && !finalUrl.includes('/me')) {
            profileUrl = finalUrl;
            console.log(`✅ Me səhifəsindən profil URL əldə edildi: ${profileUrl}`);
          }
        } catch (meError) {
          console.log('⚠️ /me səhifəsinə getmə uğursuz:', meError);
        }
      }

      if (!profileUrl) {
        throw new Error('İstifadəçinin profil URL-i tapıla bilmədi');
      }

      // URL-i təmizləyib normalize et
      profileUrl = profileUrl.split('?')[0]; // Query parametrlərini sil
      profileUrl = profileUrl.replace(/\/$/, ''); // Son slash-i sil
      
      console.log(`🎯 Son profil URL: ${profileUrl}`);
      return profileUrl;

    } catch (error) {
      console.error('Profil URL əldə etmə xətası:', error);
      throw new Error(`Profil URL tapıla bilmədi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Yeni metod: Manual login + öz profil məlumatlarını çək
  async manualLoginAndScrapeOwnProfile(): Promise<LinkedInProfile> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log('🚀 Manual LinkedIn login + öz profil scraping başladılır...');
      console.log('📋 Browser açılacaq - manual olaraq LinkedIn-ə giriş edin...');
      
      // LinkedIn login səhifəsinə gedin
      await this.page.goto('https://www.linkedin.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      console.log('⏳ Manual giriş gözlənilir...');
      console.log('🔐 Zəhmət olmasa brauzerdə LinkedIn-ə giriş edin və davam etmək üçün gözləyin...');
      
      // Giriş edilənə qədər gözləyin - hər 5 saniyədə yoxlayın
      let loginAttempts = 0;
      const maxAttempts = 120; // 10 dəqiqə gözləyək
      
      while (loginAttempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniyə gözlə
        
        const currentUrl = this.page.url();
        console.log(`🔍 Yoxlama ${loginAttempts + 1}/${maxAttempts}: ${currentUrl}`);
        
        // Əgər feed səhifəsindəsə və ya profil səhifəsindəsə login uğurludur
        if (currentUrl.includes('linkedin.com/feed') || 
            currentUrl.includes('linkedin.com/in/') ||
            currentUrl.includes('linkedin.com/mynetwork') ||
            currentUrl.includes('linkedin.com/jobs') ||
            (!currentUrl.includes('login') && !currentUrl.includes('challenge'))) {
          
          this.isLoggedIn = true;
          console.log('✅ Manual giriş uğurla tamamlandı!');
          break;
        }
        
        loginAttempts++;
        
        // Hər 12 cəhddə (1 dəqiqədə) xatırlatma
        if (loginAttempts % 12 === 0) {
          console.log(`⏰ ${loginAttempts/12} dəqiqə keçdi - hələ də giriş gözlənilir...`);
          console.log('💡 Əgər giriş etmisinizsə, feed səhifəsinə və ya profil səhifəsinə keçin');
        }
      }
      
      if (!this.isLoggedIn) {
        throw new Error('Manual giriş vaxt bitdi (10 dəqiqə). Yenidən cəhd edin.');
      }

      console.log('✅ Login uğurlu, indi öz profil URL-i axtarılır...');
      
      // Öz profil URL-ini tap
      const profileUrl = await this.getCurrentUserProfileUrl();
      
      console.log(`🎯 Öz profil URL tapıldı: ${profileUrl}`);
      console.log('📊 Öz profil məlumatları çıxarılır...');
      
      // Öz profilini scrape et
      const profileData = await this.scrapeProfile(profileUrl);
      
      console.log('✅ Öz profil məlumatları uğurla çıxarıldı!');
      
      return profileData;

    } catch (error) {
      console.error('Manual login + own profile scraping xətası:', error);
      throw new Error(`Manual login və profil scraping uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Köhnə metod - avtomatik login üçün saxlanılır
  async loginAndScrapeOwnProfile(email: string, password: string): Promise<LinkedInProfile> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log('🚀 LinkedIn login + öz profil scraping başladılır...');
      
      // İlk olaraq login et
      const loginSuccess = await this.login(email, password);
      if (!loginSuccess) {
        throw new Error('LinkedIn login uğursuz oldu');
      }

      console.log('✅ Login uğurlu, indi öz profil URL-i axtarılır...');
      
      // Öz profil URL-ini tap
      const profileUrl = await this.getCurrentUserProfileUrl();
      
      console.log(`🎯 Öz profil URL tapıldı: ${profileUrl}`);
      console.log('📊 Öz profil məlumatları çıxarılır...');
      
      // Öz profilini scrape et
      const profileData = await this.scrapeProfile(profileUrl);
      
      console.log('✅ Öz profil məlumatları uğurla çıxarıldı!');
      
      return profileData;

    } catch (error) {
      console.error('Login + own profile scraping xətası:', error);
      throw new Error(`Login və profil scraping uğursuz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async scrapeProfile(url: string, email?: string, password?: string): Promise<LinkedInProfile> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      // Validate LinkedIn URL
      if (!this.isValidLinkedInUrl(url)) {
        throw new Error('Invalid LinkedIn profile URL');
      }

      console.log(`🔗 LinkedIn profil URL-i scraping: ${url}`);
      
      // Navigate to profile
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', // Daha tez yüklənmə
        timeout: 60000 
      });

      // Yoxlayın ki, login səhifəsinə yönləndirilibmi
      const currentUrl = this.page.url();
      if (currentUrl.includes('authwall') || currentUrl.includes('login')) {
        console.log('🔒 Profil qorunur, login lazımdır');
        
        if (email && password && !this.isLoggedIn) {
          console.log('🔐 Login məlumatları ilə giriş cəhdi...');
          const loginSuccess = await this.login(email, password);
          
          if (!loginSuccess) {
            throw new Error('LinkedIn-ə giriş uğursuz oldu');
          }
          
          // Login uğurlu olduqdan sonra yenidən profil URL-ə gedin
          console.log('🔄 Login uğurlu, profil URL-ə yenidən gedin...');
          await this.page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });
          
        } else if (!this.isLoggedIn) {
          throw new Error('Bu profil qorunur və login məlumatları verilməmişdir. Email və password parametrlərini əlavə edin.');
        }
      }

      // Wait for main content to load with multiple attempts
      console.log('⏳ Waiting for page to load...');
      try {
        await this.page.waitForSelector('main', { timeout: 15000 });
        console.log('✅ Main element found');
      } catch {
        console.log('⚠️ Main element not found, trying body...');
        await this.page.waitForSelector('body', { timeout: 10000 });
        console.log('✅ Body element found');
      }

      // Additional wait for dynamic content
      console.log('⏳ Waiting for dynamic content...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if we're redirected to login or blocked
      const finalUrl = this.page.url();
      const pageTitle = await this.page.title();
      
      console.log('🔗 Current URL:', finalUrl);
      console.log('📄 Page title:', pageTitle);
      
      if (finalUrl.includes('/login') || finalUrl.includes('/authwall') || pageTitle.includes('Sign In')) {
        throw new Error('LinkedIn redirected to login page - profile may be private or bot detected');
      }

      // Extract profile data
      const profile = await this.extractProfileData();
      
      return profile;

    } catch (error) {
      console.error('Error scraping LinkedIn profile:', error);
      throw new Error(`Failed to scrape profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractProfileData(): Promise<LinkedInProfile> {
    if (!this.page) throw new Error('Page not available');

    try {
      // Wait for page to be fully loaded
      await this.page.waitForSelector('body', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 5000)); // Daha çox gözlə

      // Screenshot debug üçün
      console.log('📸 Taking screenshot for debug...');
      await this.page.screenshot({ path: 'linkedin-debug.png', fullPage: true });

      const profile = await this.page.evaluate(() => {
        // Helper function to clean text
        const cleanText = (text: string | null): string => {
          if (!text) return '';
          return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
        };

        // Debug: Get all h1 elements and their text
        const allH1s = Array.from(document.querySelectorAll('h1')).map(h1 => ({
          text: h1.textContent?.trim(),
          className: h1.className,
          id: h1.id
        }));
        console.log('🔍 All H1 elements found:', allH1s);

        // Debug: Get all elements that might contain profile info
        const possibleNameElements = [
          ...Array.from(document.querySelectorAll('[class*="heading"]')),
          ...Array.from(document.querySelectorAll('[class*="name"]')),
          ...Array.from(document.querySelectorAll('[class*="title"]')),
          ...Array.from(document.querySelectorAll('h1, h2, h3'))
        ].map(el => ({
          text: el.textContent?.trim(),
          tagName: el.tagName,
          className: el.className,
          selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : '')
        })).filter(el => el.text && el.text.length > 2 && el.text.length < 100);

        console.log('🔍 Possible name elements:', possibleNameElements.slice(0, 10));

        // More aggressive name extraction
        let name = '';
        const nameSelectors = [
          // LinkedIn 2024 selectors
          '.text-heading-xlarge',
          '.pv-text-details__left-panel .text-heading-xlarge',
          '.top-card-layout__entity-info h1',
          '.artdeco-entity-lockup__title a',
          
          // Older selectors
          'h1.text-heading-xlarge',
          '.pv-text-details__left-panel h1',
          '.ph5 h1',
          
          // Generic fallbacks
          'h1',
          '[data-generated-suggestion-target]',
          '.pv-top-card h1',
          '.top-card-layout__title',
          '.artdeco-entity-lockup__title',
          'h1[class*="heading"]',
          '[class*="profile"] h1',
          '[class*="name"] h1',
          'main h1',
          'section h1',
          
          // Very broad fallbacks
          '[class*="text-heading"] h1',
          '[class*="entity-lockup"] h1'
        ];

        for (const selector of nameSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            const text = cleanText(element.textContent);
            if (text && text.length > 2 && text.length < 100 && !text.includes('LinkedIn')) {
              name = text;
              console.log(`✅ Name found with selector: ${selector} -> ${name}`);
              break;
            }
          }
        }

        // If still no name, try from possible elements
        if (!name && possibleNameElements.length > 0) {
          // Find the most likely name (longest reasonable text in h1/h2)
          const likelyName = possibleNameElements
            .filter(el => el.tagName === 'H1' || el.tagName === 'H2')
            .sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0))[0];
          
          if (likelyName && likelyName.text) {
            name = likelyName.text;
            console.log(`✅ Name found from likely elements: ${name}`);
          }
        }

        // More aggressive headline extraction  
        let headline = '';
        const headlineSelectors = [
          // LinkedIn 2024 selectors
          '.pv-text-details__left-panel .text-body-medium',
          '.top-card-layout__headline .visually-hidden',
          '.artdeco-entity-lockup__subtitle',
          '.pv-entity__summary-info .pv-entity__summary-info-v2 .t-14',
          
          // Common selectors
          '.text-body-medium.break-words',
          '.ph5 .text-body-medium',
          '.pv-top-card .text-body-medium',
          '.top-card-layout__headline',
          
          // Generic fallbacks
          '[class*="headline"]',
          '[class*="subtitle"]',
          'h1 + div',
          'h1 ~ div .text-body-medium',
          'main .text-body-medium',
          
          // Very broad selectors
          '.text-body-medium',
          '[class*="text-body"]'
        ];

        for (const selector of headlineSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            const text = cleanText(element.textContent);
            if (text && text.length > 5 && text.length < 200) {
              headline = text;
              console.log(`✅ Headline found with selector: ${selector} -> ${headline}`);
              break;
            }
          }
        }

        // Get location with more selectors
        let location = '';
        const locationSelectors = [
          '.text-body-small.inline.t-black--light.break-words',
          '.pv-text-details__left-panel .text-body-small',
          '.ph5 .text-body-small',
          '.pv-top-card .text-body-small',
          '.top-card-layout__first-subline',
          '[class*="location"]',
          // Try elements that might contain location
          'h1 ~ div .text-body-small',
          'main .text-body-small'
        ];

        for (const selector of locationSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            const text = cleanText(element.textContent);
            if (text && text.length > 2 && text.length < 100) {
              location = text;
              console.log(`✅ Location found with selector: ${selector} -> ${location}`);
              break;
            }
          }
        }

        // Extract About section
        let about = '';
        const aboutSelectors = [
          '#about ~ * .inline-show-more-text span[aria-hidden="true"]',
          '#about + * .pv-shared-text-with-see-more span[aria-hidden="true"]',
          '.pv-about-section .pv-shared-text-with-see-more span[aria-hidden="true"]',
          '[data-section="summary"] .pv-shared-text-with-see-more span[aria-hidden="true"]',
          '[class*="about"] .pv-shared-text-with-see-more span[aria-hidden="true"]',
          // More generic about selectors
          '.inline-show-more-text span[aria-hidden="true"]',
          '.pv-shared-text-with-see-more span[aria-hidden="true"]'
        ];
        
        for (const selector of aboutSelectors) {
          const aboutElement = document.querySelector(selector);
          if (aboutElement && aboutElement.textContent?.trim()) {
            about = cleanText(aboutElement.textContent);
            console.log(`✅ About found with selector: ${selector}`);
            break;
          }
        }

        // Extract Experience - more comprehensive approach
        const experience: any[] = [];
        
        // LinkedIn 2024 experience selectors
        const experienceSelectors = [
          '#experience ~ div .pvs-list__item--line-separated',
          '#experience ~ * .pvs-list__item',
          '.pv-profile-section.experience .pv-entity__summary-info',
          '[data-section="experience"] .pvs-list__item',
          '[class*="experience"] .pvs-list__item',
          '.pvs-list__item--line-separated',
          '.pvs-list__item',
          '.artdeco-list__item',
          
          // Fallback to any structured content
          '.pv-entity__summary-info',
          '.pv-entity',
          '[class*="entity"]'
        ];

        console.log('🔍 Looking for experience sections...');
        
        for (const experienceSelector of experienceSelectors) {
          const experienceItems = document.querySelectorAll(experienceSelector);
          console.log(`Found ${experienceItems.length} items with selector: ${experienceSelector}`);
          
          if (experienceItems.length > 0) {
            experienceItems.forEach((item, index) => {
              if (index < 10) { // Limit to first 10
                // Try to extract structured info
                const titleElement = item.querySelector('span[aria-hidden="true"]') || 
                                   item.querySelector('.t-bold') ||
                                   item.querySelector('[class*="title"]') ||
                                   item.querySelector('h3') ||
                                   item.querySelector('h4');
                
                const companyElement = item.querySelector('span[class*="t-14"]') ||
                                     item.querySelector('.pv-entity__secondary-title') ||
                                     item.querySelector('[class*="subtitle"]');
                
                const allTextInItem = item.textContent?.trim();
                
                if (titleElement || allTextInItem) {
                  const position = titleElement ? cleanText(titleElement.textContent || '') : '';
                  const company = companyElement ? cleanText(companyElement.textContent || '') : '';
                  
                  // If we have structured data, use it; otherwise use raw text
                  if (position || company || (allTextInItem && allTextInItem.length > 10)) {
                    experience.push({
                      position: position || (allTextInItem ? allTextInItem.split('\n')[0]?.substring(0, 100) : ''),
                      company: company || '',
                      date_range: '',
                      location: '',
                      description: allTextInItem ? allTextInItem.substring(100, 300) : ''
                    });
                    console.log(`✅ Added experience: ${position || 'No title'} at ${company || 'No company'}`);
                  }
                }
              }
            });
            if (experience.length > 0) {
              console.log(`✅ Found ${experience.length} experience entries`);
              break;
            }
          }
        }

        // Extract Education - comprehensive approach
        const education: any[] = [];
        
        const educationSelectors = [
          '#education ~ div .pvs-list__item--line-separated',
          '#education ~ * .pvs-list__item',
          '.pv-profile-section.education .pv-entity__summary-info',
          '[data-section="education"] .pvs-list__item',
          '[class*="education"] .pvs-list__item'
        ];

        console.log('🔍 Looking for education sections...');
        
        for (const educationSelector of educationSelectors) {
          const educationItems = document.querySelectorAll(educationSelector);
          console.log(`Found ${educationItems.length} education items with selector: ${educationSelector}`);
          
          if (educationItems.length > 0) {
            educationItems.forEach((item, index) => {
              if (index < 5) { // Limit to first 5
                const schoolElement = item.querySelector('span[aria-hidden="true"]') || 
                                    item.querySelector('.t-bold') ||
                                    item.querySelector('h3') ||
                                    item.querySelector('h4');
                
                const degreeElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                                    item.querySelector('.pv-entity__secondary-title');
                
                const allTextInItem = item.textContent?.trim();
                
                if (schoolElement || allTextInItem) {
                  const school = schoolElement ? cleanText(schoolElement.textContent || '') : '';
                  const degree = degreeElement ? cleanText(degreeElement.textContent || '') : '';
                  
                  if (school || (allTextInItem && allTextInItem.length > 5)) {
                    education.push({
                      school: school || (allTextInItem ? allTextInItem.split('\n')[0]?.substring(0, 100) : ''),
                      degree: degree || '',
                      field_of_study: '',
                      date_range: ''
                    });
                    console.log(`✅ Added education: ${school || 'No school'} - ${degree || 'No degree'}`);
                  }
                }
              }
            });
            if (education.length > 0) {
              console.log(`✅ Found ${education.length} education entries`);
              break;
            }
          }
        }

        // Extract Skills - more comprehensive approach
        const skills: string[] = [];
        
        // First try structured skills section
        const skillSelectors = [
          '#skills ~ * .mr1.t-bold span[aria-hidden="true"]',
          '.pv-skill-category-entity__name span[aria-hidden="true"]',
          '[data-section="skills"] .pvs-list__item span',
          '[class*="skill"] span[aria-hidden="true"]',
          '.pvs-list__item span[aria-hidden="true"]'
        ];

        console.log('🔍 Looking for skills sections...');
        
        for (const skillSelector of skillSelectors) {
          const skillItems = document.querySelectorAll(skillSelector);
          console.log(`Found ${skillItems.length} skill items with selector: ${skillSelector}`);
          
          if (skillItems.length > 0) {
            skillItems.forEach(skill => {
              const skillName = cleanText(skill.textContent || '');
              if (skillName && skillName.length > 2 && skillName.length < 50 && !skills.includes(skillName)) {
                skills.push(skillName);
                console.log(`✅ Added skill: ${skillName}`);
              }
            });
            if (skills.length > 0) break;
          }
        }
        
        // Extract Certifications - login olduqda daha çox məlumat
        const certifications: any[] = [];
        
        const certificationSelectors = [
          '#licenses_and_certifications ~ div .pvs-list__item--line-separated',
          '#licenses_and_certifications ~ * .pvs-list__item',
          '[data-section="certifications"] .pvs-list__item',
          '[class*="certification"] .pvs-list__item',
          '[class*="license"] .pvs-list__item'
        ];

        console.log('🔍 Looking for certifications sections...');
        
        for (const certSelector of certificationSelectors) {
          const certItems = document.querySelectorAll(certSelector);
          console.log(`Found ${certItems.length} certification items with selector: ${certSelector}`);
          
          if (certItems.length > 0) {
            certItems.forEach((item, index) => {
              if (index < 10) { // Limit to first 10
                const nameElement = item.querySelector('span[aria-hidden="true"]') || 
                                  item.querySelector('.t-bold') ||
                                  item.querySelector('h3') ||
                                  item.querySelector('h4');
                
                const issuerElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                                    item.querySelector('.pv-entity__secondary-title');
                
                const allTextInItem = item.textContent?.trim();
                
                if (nameElement || allTextInItem) {
                  const name = nameElement ? cleanText(nameElement.textContent || '') : '';
                  const issuer = issuerElement ? cleanText(issuerElement.textContent || '') : '';
                  
                  if (name || (allTextInItem && allTextInItem.length > 5)) {
                    certifications.push({
                      name: name || (allTextInItem ? allTextInItem.split('\n')[0]?.substring(0, 100) : ''),
                      issuer: issuer || '',
                      date: '',
                      credential_id: ''
                    });
                    console.log(`✅ Added certification: ${name || 'No name'} from ${issuer || 'No issuer'}`);
                  }
                }
              }
            });
            if (certifications.length > 0) {
              console.log(`✅ Found ${certifications.length} certification entries`);
              break;
            }
          }
        }

        // Extract Languages - login olduqda əlçatandır
        const languages: any[] = [];
        
        const languageSelectors = [
          '#languages ~ div .pvs-list__item--line-separated',
          '#languages ~ * .pvs-list__item',
          '[data-section="languages"] .pvs-list__item',
          '[class*="language"] .pvs-list__item'
        ];

        console.log('🔍 Looking for languages sections...');
        
        for (const langSelector of languageSelectors) {
          const langItems = document.querySelectorAll(langSelector);
          console.log(`Found ${langItems.length} language items with selector: ${langSelector}`);
          
          if (langItems.length > 0) {
            langItems.forEach((item, index) => {
              if (index < 10) { // Limit to first 10
                const nameElement = item.querySelector('span[aria-hidden="true"]') || 
                                  item.querySelector('.t-bold');
                
                const proficiencyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
                
                const allTextInItem = item.textContent?.trim();
                
                if (nameElement || allTextInItem) {
                  const name = nameElement ? cleanText(nameElement.textContent || '') : '';
                  const proficiency = proficiencyElement ? cleanText(proficiencyElement.textContent || '') : '';
                  
                  if (name || (allTextInItem && allTextInItem.length > 2)) {
                    languages.push({
                      name: name || (allTextInItem ? allTextInItem.split('\n')[0]?.substring(0, 50) : ''),
                      proficiency: proficiency || ''
                    });
                    console.log(`✅ Added language: ${name || 'No name'} - ${proficiency || 'No proficiency'}`);
                  }
                }
              }
            });
            if (languages.length > 0) {
              console.log(`✅ Found ${languages.length} language entries`);
              break;
            }
          }
        }

        // Extract Profile Image - login olduqda daha yüksək keyfiyyət
        let profileImage = '';
        const imageSelectors = [
          '.pv-top-card-profile-picture__image',
          '.profile-photo-edit__preview',
          '.presence-entity__image',
          '.pv-top-card__photo img',
          '.ember-view img[alt*="photo"]',
          'img[data-delayed-url*="profile"]'
        ];
        
        for (const imgSelector of imageSelectors) {
          const imgElement = document.querySelector(imgSelector) as HTMLImageElement;
          if (imgElement && imgElement.src) {
            profileImage = imgElement.src;
            console.log(`✅ Profile image found: ${imgSelector}`);
            break;
          }
        }

        // Extract Contact Info - yalnız login olduqda əlçatan
        const contactInfo = {
          email: '',
          phone: '',
          website: '',
          twitter: '',
          linkedin: window.location.href
        };

        // Contact info yalnız 'Contact info' düyməsini bassaq əldə edilir
        // Bu avtomatik ola bilməz, amma bəzi məlumatları səhifədən tapa bilərik
        const contactSelectors = [
          '[data-test-id="contact-info"]',
          '.pv-contact-info',
          '.ci-email',
          '.ci-phone',
          '.ci-websites'
        ];

        contactSelectors.forEach(selector => {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            const text = element.textContent.trim();
            // Email pattern
            const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            if (emailMatch) {
              contactInfo.email = emailMatch[0];
              console.log(`✅ Email found: ${contactInfo.email}`);
            }
            
            // Phone pattern
            const phoneMatch = text.match(/[\+]?[1-9][\d\s\-\(\)]{8,}/);
            if (phoneMatch) {
              contactInfo.phone = phoneMatch[0];
              console.log(`✅ Phone found: ${contactInfo.phone}`);
            }
          }
        });

        return {
          name,
          headline,
          location,
          about,
          experience,
          education,
          skills,
          certifications,
          languages,
          profileImage,
          // Əlavə məlumatlar (yalnız login olduqda)
          contactInfo,
          // Statistika məlumatları
          connections: '', // Əgər görünərsə
          followers: ''    // Əgər görünərsə
        };
      });

      // Debug logging
      console.log('📊 Extraction results:');
      console.log('- Name:', profile.name || 'NOT FOUND');
      console.log('- Headline:', profile.headline || 'NOT FOUND');
      console.log('- Location:', profile.location || 'NOT FOUND');
      console.log('- About length:', profile.about?.length || 0);
      console.log('- Experience count:', profile.experience?.length || 0);
      console.log('- Education count:', profile.education?.length || 0);
      console.log('- Skills count:', profile.skills?.length || 0);
      console.log('- Certifications count:', profile.certifications?.length || 0);
      console.log('- Languages count:', profile.languages?.length || 0);
      console.log('- Profile image:', profile.profileImage ? 'FOUND' : 'NOT FOUND');
      console.log('- Contact info:', profile.contactInfo?.email ? 'FOUND' : 'NOT FOUND');
      
      // Login status məlumatları
      if (this.isLoggedIn) {
        console.log('🔐 Status: LOGGED IN - Əlavə məlumatlar mövcuddur');
      } else {
        console.log('🔒 Status: NOT LOGGED IN - Məhdud məlumatlar');
      }

      // Even if we don't have name/headline, return what we have
      if (!profile.name && !profile.headline && !profile.about && profile.experience.length === 0) {
        const pageText = await this.page.evaluate(() => document.body.textContent?.substring(0, 1000));
        const pageTitle = await this.page.title();
        const currentUrl = this.page.url();
        
        console.log('📄 Page title:', pageTitle);
        console.log('🔗 Current URL:', currentUrl);
        console.log('📝 Page content sample:', pageText);
        
        throw new Error('Could not extract any profile data - page might be protected or structure changed');
      }

      // Return whatever we found
      return profile;

    } catch (error) {
      console.error('Error extracting profile data:', error);
      throw new Error('Failed to extract profile data');
    }
  }

  private isValidLinkedInUrl(url: string): boolean {
    const linkedInPatterns = [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_.]+\/?$/,
      /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/?$/
    ];
    
    return linkedInPatterns.some(pattern => pattern.test(url));
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

// Utility function for one-time scraping
export async function scrapeLinkedInProfile(url: string, email?: string, password?: string): Promise<LinkedInProfile> {
  const scraper = new LinkedInScraper();
  
  try {
    await scraper.initialize();
    const profile = await scraper.scrapeProfile(url, email, password);
    return profile;
  } finally {
    await scraper.close();
  }
}

// Yeni utility function: Login + öz profil scraping
export async function scrapeOwnLinkedInProfile(email: string, password: string): Promise<LinkedInProfile> {
  const scraper = new LinkedInScraper();
  
  try {
    console.log('🔐 Öz LinkedIn profil scraping başladılır...');
    await scraper.initialize();
    const profile = await scraper.loginAndScrapeOwnProfile(email, password);
    return profile;
  } finally {
    await scraper.close();
  }
}

// Manuel giriş ilə scraping funksiyası
export async function scrapeLinkedInProfileWithManualLogin(): Promise<LinkedInProfile> {
  const scraper = new LinkedInScraper();
  try {
    console.log('🔐 Manuel LinkedIn profil scraping başladılır...');
    await scraper.initialize(true); // forceVisible = true, browser görünür olacaq
    const profile = await scraper.manualLoginAndScrapeOwnProfile();
    return profile;
  } finally {
    await scraper.close();
  }
}
