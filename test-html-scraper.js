import { scrapeLinkedInProfile } from './src/lib/scraper/linkedin-scraper.js';

async function testLinkedInScraper() {
  console.log('🔍 LinkedIn HTML Scraper Test başladı...');
  
  const testUrl = 'https://www.linkedin.com/in/williamhgates';
  
  try {
    console.log(`📄 Test URL: ${testUrl}`);
    
    const result = await scrapeLinkedInProfile(testUrl);
    
    console.log('✅ Scraping uğurlu!');
    console.log('📊 Nəticə:');
    console.log('- Ad:', result.name);
    console.log('- Başlıq:', result.headline);
    console.log('- Yer:', result.location);
    console.log('- Haqqında:', result.about ? result.about.substring(0, 100) + '...' : 'Boş');
    console.log('- İş təcrübəsi:', result.experience?.length || 0);
    console.log('- Təhsil:', result.education?.length || 0);
    console.log('- Bacarıqlar:', result.skills?.length || 0);
    console.log('- Sertifikatlar:', result.certifications?.length || 0);
    console.log('- Dillər:', result.languages?.length || 0);
    
    console.log('\n🎯 Test uğurla tamamlandı!');
    
  } catch (error) {
    console.error('❌ Test xətası:', error.message);
    console.error('🔧 Debugging məlumatı:', error);
  }
}

testLinkedInScraper();
