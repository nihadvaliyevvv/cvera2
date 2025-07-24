const { LinkedInScraper } = require('./dist/lib/scraper/linkedin-scraper');

async function testManualLinkedInScraping() {
  const scraper = new LinkedInScraper();
  
  try {
    console.log('🧪 Manuel LinkedIn scraping test başlayır...');
    console.log('📋 Browser açılacaq - manual olaraq LinkedIn-ə giriş edin');
    console.log('⏰ Giriş etdikdən sonra sistem avtomatik olaraq profil məlumatlarını çıxaracaq');
    console.log('');
    
    // Browser-i görünür mode-da başlat
    await scraper.initialize(true);
    
    // Manuel login + scraping et
    const profileData = await scraper.manualLoginAndScrapeOwnProfile();
    
    console.log('');
    console.log('✅ Profil məlumatları uğurla əldə edildi!');
    console.log('📊 Profil məlumatları:');
    console.log(JSON.stringify(profileData, null, 2));
    
  } catch (error) {
    console.error('❌ Test uğursuz:', error.message);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

testManualLinkedInScraping();
