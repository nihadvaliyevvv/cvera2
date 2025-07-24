const puppeteer = require('puppeteer');

// Test manual login functionality
async function testManualLogin() {
  let browser = null;
  
  try {
    console.log('🧪 Manuel LinkedIn login test başlayır...');
    console.log('📋 Browser açılacaq - manual olaraq LinkedIn-ə giriş edin');
    console.log('⏰ 10 dəqiqə müddətində giriş etməlisiniz');
    console.log('');
    
    // Browser-i görünür mode-da başlat 
    browser = await puppeteer.launch({
      headless: false, // Manuel giriş üçün görünür
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    
    // LinkedIn login səhifəsinə get
    await page.goto('https://www.linkedin.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('🔍 Login səhifəsi açıldı. Manual olaraq giriş edin...');
    
    // Login tamamlanmasını gözlə (URL dəyişikliyi ilə)
    let loginCompleted = false;
    const startTime = Date.now();
    const timeout = 10 * 60 * 1000; // 10 dəqiqə
    
    while (!loginCompleted && (Date.now() - startTime) < timeout) {
      const currentUrl = page.url();
      
      // LinkedIn ana səhifə və ya feed səhifəsində olarsa login tamamlandı
      if (currentUrl.includes('/feed/') || currentUrl.includes('/in/') || 
          (currentUrl.includes('linkedin.com') && !currentUrl.includes('/login'))) {
        loginCompleted = true;
        console.log('✅ Login uğurla tamamlandı!');
        break;
      }
      
      // 5 saniyə gözlə
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('⏳ Hələ də login gözlənilir...');
    }
    
    if (!loginCompleted) {
      throw new Error('Login vaxt bitdi (10 dəqiqə)');
    }
    
    // İndi profile get
    console.log('🔍 Profil səhifəsinə getmə...');
    await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'networkidle2' });
    
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    
    // Profil məlumatlarını çıxar (sadə version)
    const profileName = await page.evaluate(() => {
      const nameElement = document.querySelector('h1');
      return nameElement ? nameElement.textContent.trim() : 'Ad tapılmadı';
    });
    
    console.log('');
    console.log('✅ Test uğurla tamamlandı!');
    console.log(`👤 İstifadəçi adı: ${profileName}`);
    console.log(`🌐 Profil URL: ${finalUrl}`);
    
  } catch (error) {
    console.error('❌ Test xətası:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testManualLogin();
