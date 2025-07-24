const puppeteer = require('puppeteer');

async function testDirectScraping() {
  console.log('🔍 Direct LinkedIn scraping test...');
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: true, // Headless rejimə keç
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('🌐 Going to your LinkedIn profile...');
    await page.goto('https://www.linkedin.com/in/musayevcreate', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ Waiting 10 seconds for full load...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('📊 Extracting data...');
    const result = await page.evaluate(() => {
      // Get all text content from h1 elements
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(h1 => ({
        text: h1.textContent?.trim(),
        className: h1.className
      }));

      // Get page title
      const title = document.title;

      // Get any element that might contain a name
      const possibleNames = Array.from(document.querySelectorAll('*'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 5 && text.length < 50)
        .slice(0, 20);

      return {
        title,
        h1Elements,
        possibleNames,
        bodyStart: document.body.textContent?.substring(0, 500)
      };
    });

    console.log('📄 Page title:', result.title);
    console.log('🔍 H1 elements:', result.h1Elements);
    console.log('🔍 Possible names:', result.possibleNames);
    console.log('📝 Body start:', result.bodyStart);

    // Take screenshot
    await page.screenshot({ path: 'linkedin-test.png', fullPage: true });
    console.log('📸 Screenshot saved as linkedin-test.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testDirectScraping();
