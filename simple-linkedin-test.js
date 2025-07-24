const puppeteer = require('puppeteer');

async function simpleLinkedInTest() {
  console.log('🔍 Simple LinkedIn Scraper Test');
  console.log('==============================');
  
  const testUrl = 'https://www.linkedin.com/in/musayevcreate';
  let browser;
  
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true, // Headless mode for server
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    
    // Set realistic user agent and headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Block images to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if(['image', 'stylesheet', 'font'].includes(req.resourceType())){
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`📄 Navigating to: ${testUrl}`);
    await page.goto(testUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForSelector('body', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check current URL and title
    const currentUrl = page.url();
    const title = await page.title();
    
    console.log(`🔗 Current URL: ${currentUrl}`);
    console.log(`📝 Page title: ${title}`);
    
    // Check if redirected to login
    if (currentUrl.includes('/login') || currentUrl.includes('/authwall') || title.includes('Sign In')) {
      console.log('⚠️  Redirected to login page - profile might be private');
      return;
    }
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'linkedin-test-screenshot.png', fullPage: false });
    
    console.log('🔍 Extracting profile data...');
    
    const profileData = await page.evaluate(() => {
      // Helper to clean text
      const cleanText = (text) => {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
      };
      
      // Debug: Log all h1 elements
      const allH1s = Array.from(document.querySelectorAll('h1')).map(h1 => ({
        text: h1.textContent?.trim(),
        classes: h1.className
      })).filter(h1 => h1.text);
      
      console.log('All H1 elements:', allH1s);
      
      // Try multiple name selectors
      let name = '';
      const nameSelectors = [
        'h1.text-heading-xlarge',
        '.text-heading-xlarge',
        '.pv-text-details__left-panel h1',
        'h1',
        '[class*="heading"] h1',
        'main h1'
      ];
      
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          const text = cleanText(element.textContent);
          if (text && text.length > 2 && text.length < 100) {
            name = text;
            console.log(`Name found with: ${selector} -> ${name}`);
            break;
          }
        }
      }
      
      // Try multiple headline selectors
      let headline = '';
      const headlineSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.text-body-medium',
        'h1 + div',
        'h1 ~ div .text-body-medium'
      ];
      
      for (const selector of headlineSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          const text = cleanText(element.textContent);
          if (text && text.length > 5 && text.length < 200) {
            headline = text;
            console.log(`Headline found with: ${selector} -> ${headline}`);
            break;
          }
        }
      }
      
      // Get some experience data
      const experienceElements = document.querySelectorAll('.pvs-list__item');
      const experience = [];
      
      experienceElements.forEach((item, index) => {
        if (index < 3) { // First 3 items
          const text = item.textContent?.trim();
          if (text && text.length > 20) {
            experience.push({
              text: text.substring(0, 150) + '...',
              position: text.split('\n')[0] || '',
              company: text.split('\n')[1] || ''
            });
          }
        }
      });
      
      // Look for skills in page text
      const skills = [];
      const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'SQL', 'MongoDB', 'Git', 'HTML', 'CSS'];
      const pageText = document.body.textContent || '';
      
      skillKeywords.forEach(skill => {
        if (pageText.includes(skill)) {
          skills.push(skill);
        }
      });
      
      return {
        name,
        headline,
        experience,
        skills,
        pageHasContent: !!document.body.textContent,
        totalTextLength: document.body.textContent?.length || 0
      };
    });
    
    console.log('📊 EXTRACTION RESULTS:');
    console.log(`👤 Name: "${profileData.name || 'NOT FOUND'}"`);
    console.log(`💼 Headline: "${profileData.headline || 'NOT FOUND'}"`);
    console.log(`🏢 Experience items: ${profileData.experience?.length || 0}`);
    console.log(`🛠️ Skills found: ${profileData.skills?.length || 0}`);
    console.log(`📄 Page has content: ${profileData.pageHasContent}`);
    console.log(`📏 Total text length: ${profileData.totalTextLength}`);
    
    if (profileData.experience && profileData.experience.length > 0) {
      console.log('\n💼 EXPERIENCE PREVIEW:');
      profileData.experience.forEach((exp, i) => {
        console.log(`${i + 1}. Position: "${exp.position}"`);
        console.log(`   Company: "${exp.company}"`);
      });
    }
    
    if (profileData.skills && profileData.skills.length > 0) {
      console.log(`\n🛠️  SKILLS: ${profileData.skills.join(', ')}`);
    }
    
    console.log('\n✅ Test completed! Check linkedin-test-screenshot.png');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleLinkedInTest();
