const puppeteer = require('puppeteer');

async function testLinkedInSelectors(url) {
  console.log('🔍 LinkedIn scraper selector test başlayır...');
  console.log(`URL: ${url}`);
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: false, // Debug üçün visible edin
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    page = await browser.newPage();
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    await page.setViewport({ width: 1920, height: 1080 });

    console.log('🌐 Səhifəyə gedirik...');
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // Wait a bit for LinkedIn to load
    await page.waitForTimeout(3000);

    console.log('📄 Səhifə yükləndi, selector-ları test edirik...');

    // Test different selectors
    const selectors = [
      'h1',
      'h1.text-heading-xlarge', 
      '.pv-text-details__left-panel h1',
      '.ph5 h1',
      '.text-heading-xlarge',
      '.pv-top-card-profile-picture__image',
      'main',
      '.artdeco-card',
      '.pv-top-card',
      '.pv-profile-section'
    ];

    console.log('🔍 Mövcud selector-lar:');
    for (const selector of selectors) {
      const element = await page.$(selector);
      const text = element ? await page.evaluate(el => el.textContent?.trim(), element) : null;
      console.log(`${selector}: ${element ? '✅ Mövcud' : '❌ Yox'} ${text ? `- "${text.substring(0, 50)}..."` : ''}`);
    }

    // Get page title and URL
    const title = await page.title();
    const currentUrl = page.url();
    console.log(`📝 Səhifə başlığı: ${title}`);
    console.log(`🔗 Hazırki URL: ${currentUrl}`);

    // Check if we're on the right page
    if (currentUrl.includes('linkedin.com/in/')) {
      console.log('✅ LinkedIn profil səhifəsindəyik');
      
      // Try to extract basic info with different approaches
      const profileData = await page.evaluate(() => {
        // Method 1: Try common selectors
        const getName = () => {
          const selectors = [
            'h1.text-heading-xlarge',
            '.pv-text-details__left-panel h1',
            '.ph5 h1',
            'h1',
            '[data-generated-suggestion-target]'
          ];
          
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent?.trim()) {
              return el.textContent.trim();
            }
          }
          return null;
        };

        const getHeadline = () => {
          const selectors = [
            '.text-body-medium.break-words',
            '.pv-text-details__left-panel .text-body-medium',
            '.ph5 .text-body-medium',
            '.pv-top-card-profile-picture__image + div .text-body-medium'
          ];
          
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent?.trim()) {
              return el.textContent.trim();
            }
          }
          return null;
        };

        return {
          name: getName(),
          headline: getHeadline(),
          allH1s: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean),
          allText: document.body.textContent?.substring(0, 500)
        };
      });

      console.log('📊 Çıxarılan məlumatlar:');
      console.log('Ad:', profileData.name);
      console.log('Başlıq:', profileData.headline);
      console.log('Bütün H1 elementlər:', profileData.allH1s);
      console.log('Səhifə məzmunu (ilk 500 simvol):', profileData.allText);

    } else {
      console.log('❌ LinkedIn profil səhifəsində deyilik!');
      console.log('LinkedIn-in bizi yönləndirdiyi ola bilər.');
    }

  } catch (error) {
    console.error('❌ Xəta:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Test your LinkedIn profile
testLinkedInSelectors('https://www.linkedin.com/in/musayevcreate');
