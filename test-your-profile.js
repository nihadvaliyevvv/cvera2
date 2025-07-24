const { scrapeLinkedInProfile } = require('./src/lib/scraper/linkedin-scraper.ts');

async function testYourProfile() {
  console.log('🔍 Sizin LinkedIn profilinizi test edirik...');
  
  const testUrl = 'https://www.linkedin.com/in/musayevcreate';
  
  try {
    console.log(`📄 Test URL: ${testUrl}`);
    console.log('⏳ HTML scraping başlayır...');
    
    const result = await scrapeLinkedInProfile(testUrl);
    
    console.log('✅ Scraping tamamlandı!');
    console.log('=' .repeat(50));
    
    console.log('📊 NƏTİCƏ:');
    console.log(`👤 Ad: ${result.name || 'Tapılmadı'}`);
    console.log(`💼 Başlıq: ${result.headline || 'Tapılmadı'}`);
    console.log(`📍 Yer: ${result.location || 'Tapılmadı'}`);
    console.log(`📝 Haqqında: ${result.about ? result.about.substring(0, 200) + '...' : 'Tapılmadı'}`);
    
    console.log('\n📈 STATİSTİKA:');
    console.log(`🏢 İş təcrübəsi: ${result.experience?.length || 0} ədəd`);
    console.log(`🎓 Təhsil: ${result.education?.length || 0} ədəd`);
    console.log(`🛠️ Bacarıqlar: ${result.skills?.length || 0} ədəd`);
    
    if (result.experience && result.experience.length > 0) {
      console.log('\n💼 İŞ TƏCRÜBƏSİ:');
      result.experience.forEach((exp, i) => {
        console.log(`${i + 1}. ${exp.position} - ${exp.company}`);
      });
    }
    
    if (result.skills && result.skills.length > 0) {
      console.log(`\n🛠️ BACARIQLAR: ${result.skills.slice(0, 10).join(', ')}`);
    }
    
    console.log('\n🎉 Test tamamlandı!');
    
  } catch (error) {
    console.error('\n❌ XƏTA:');
    console.error(`Message: ${error.message}`);
    
    if (error.message.includes('Browser initialization failed')) {
      console.error('\n🔧 HƏLL: npm install puppeteer');
    } else if (error.message.includes('Could not extract profile data')) {
      console.error('\n🔧 HƏLL: LinkedIn profil strukturu dəyişmiş ola bilər');
    } else if (error.message.includes('timeout')) {
      console.error('\n🔧 HƏLL: İnternet bağlantısını yoxlayın');
    }
  }
}

testYourProfile();
