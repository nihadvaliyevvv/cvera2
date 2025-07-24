import { scrapeLinkedInProfile } from './src/lib/scraper/linkedin-scraper.js';

async function testHTMLScraper() {
  console.log('🌐 LinkedIn HTML Scraper Test');
  console.log('=' .repeat(50));
  
  // Public LinkedIn profile for testing
  const testUrl = 'https://www.linkedin.com/in/williamhgates';
  
  try {
    console.log(`🔍 Test URL: ${testUrl}`);
    console.log('⏳ HTML scraping başlayır...');
    
    const startTime = Date.now();
    const result = await scrapeLinkedInProfile(testUrl);
    const endTime = Date.now();
    
    console.log(`✅ HTML Scraping tamamlandı! (${endTime - startTime}ms)`);
    console.log('=' .repeat(50));
    
    console.log('📊 SCRAPING NƏTİCƏSİ:');
    console.log(`👤 Ad: ${result.name || 'Tapılmadı'}`);
    console.log(`💼 Başlıq: ${result.headline || 'Tapılmadı'}`);
    console.log(`📍 Yer: ${result.location || 'Tapılmadı'}`);
    console.log(`📝 Haqqında: ${result.about ? result.about.substring(0, 150) + '...' : 'Tapılmadı'}`);
    
    console.log('\n📈 STATİSTİKA:');
    console.log(`🏢 İş təcrübəsi: ${result.experience?.length || 0} ədəd`);
    console.log(`🎓 Təhsil: ${result.education?.length || 0} ədəd`);
    console.log(`🛠️ Bacarıqlar: ${result.skills?.length || 0} ədəd`);
    console.log(`🏆 Sertifikatlar: ${result.certifications?.length || 0} ədəd`);  
    console.log(`🌍 Dillər: ${result.languages?.length || 0} ədəd`);
    
    if (result.experience && result.experience.length > 0) {
      console.log('\n💼 İLK İŞ TƏCRÜBƏSİ:');
      const firstExp = result.experience[0];
      console.log(`   Vəzifə: ${firstExp.position}`);
      console.log(`   Şirkət: ${firstExp.company}`);
      console.log(`   Tarix: ${firstExp.date_range}`);
    }
    
    if (result.skills && result.skills.length > 0) {
      console.log(`\n🛠️ İLK 5 BACARI: ${result.skills.slice(0, 5).join(', ')}`);
    }
    
    console.log('\n🎉 HTML Scraper tamamilə işləyir!');
    
  } catch (error) {
    console.error('\n❌ HTML SCRAPER XƏTASI:');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    if (error.message.includes('Browser initialization failed')) {
      console.error('\n🔧 HƏLL YOLU: Puppeteer düzgün quraşdırılmayıb');
      console.error('Çalışın: npm install puppeteer');
    }
  }
}

testHTMLScraper();
