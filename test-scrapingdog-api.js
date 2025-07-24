#!/usr/bin/env node

const { 
  scrapeLinkedInProfile, 
  scrapeOwnLinkedInProfile,
  checkScrapingDogApiStatus,
  scrapeMultipleLinkedInProfiles
} = require('./src/lib/scraper/scrapingdog-linkedin-scraper');

async function testScrapingDogAPI() {
  console.log('🧪 ScrapingDog LinkedIn API test başlayır...');
  console.log('');

  try {
    // 1. API Status yoxla
    console.log('📡 1. API Status yoxlanır...');
    const apiStatus = await checkScrapingDogApiStatus();
    console.log('📊 API Status:', apiStatus);
    console.log('');

    // 2. Öz profilini test et (copilot-instructions.md-də qeyd olunan ID)
    console.log('🔐 2. Öz profil test edilir...');
    console.log('🆔 LinkedIn ID: musayevcreate');
    
    const ownProfile = await scrapeOwnLinkedInProfile('musayevcreate');
    
    console.log('✅ Öz profil uğurla scrape edildi!');
    console.log('📊 Profil məlumatları:');
    console.log('   - Ad:', ownProfile.name || 'Ad tapılmadı');
    console.log('   - Başlıq:', ownProfile.headline || 'Başlıq tapılmadı');
    console.log('   - Yer:', ownProfile.location || 'Yer tapılmadı');
    console.log('   - Haqqında:', ownProfile.about ? `${ownProfile.about.substring(0, 100)}...` : 'Haqqında tapılmadı');
    console.log('   - Təcrübə sayı:', ownProfile.experience?.length || 0);
    console.log('   - Təhsil sayı:', ownProfile.education?.length || 0);
    console.log('   - Bacarıq sayı:', ownProfile.skills?.length || 0);
    console.log('   - Profil şəkli:', ownProfile.profileImage ? 'Var' : 'Yoxdur');
    console.log('');

    // 3. URL ilə test et
    console.log('🔗 3. URL ilə profil test edilir...');
    const linkedinUrl = 'https://www.linkedin.com/in/musayevcreate';
    console.log('🌐 LinkedIn URL:', linkedinUrl);
    
    const urlProfile = await scrapeLinkedInProfile(linkedinUrl);
    
    console.log('✅ URL profil uğurla scrape edildi!');
    console.log('📊 URL profil məlumatları:');
    console.log('   - Ad:', urlProfile.name || 'Ad tapılmadı');
    console.log('   - Başlıq:', urlProfile.headline || 'Başlıq tapılmadı');
    console.log('');

    // 4. Təfərrüatlı profil məlumatlarını göstər
    console.log('📋 4. Təfərrüatlı profil məlumatları:');
    
    if (ownProfile.experience && ownProfile.experience.length > 0) {
      console.log('💼 Təcrübə:');
      ownProfile.experience.slice(0, 3).forEach((exp, i) => {
        console.log(`   ${i + 1}. ${exp.position} @ ${exp.company} (${exp.date_range})`);
      });
    }
    
    if (ownProfile.education && ownProfile.education.length > 0) {
      console.log('🎓 Təhsil:');
      ownProfile.education.slice(0, 2).forEach((edu, i) => {
        console.log(`   ${i + 1}. ${edu.degree} @ ${edu.school} (${edu.date_range})`);
      });
    }
    
    if (ownProfile.skills && ownProfile.skills.length > 0) {
      console.log('💪 Bacarıqlar (ilk 10):');
      console.log('   ', ownProfile.skills.slice(0, 10).join(', '));
    }
    
    if (ownProfile.contactInfo) {
      console.log('📞 Əlaqə məlumatları:');
      console.log('   - Email:', ownProfile.contactInfo.email || 'Yoxdur');
      console.log('   - Telefon:', ownProfile.contactInfo.phone || 'Yoxdur');
      console.log('   - Website:', ownProfile.contactInfo.website || 'Yoxdur');
      console.log('   - LinkedIn:', ownProfile.contactInfo.linkedin || 'Yoxdur');
    }
    
    console.log('');
    console.log('✅ Bütün testlər uğurla tamamlandı!');
    console.log('🎉 ScrapingDog LinkedIn API düzgün işləyir!');

  } catch (error) {
    console.error('❌ Test xətası:', error.message);
    console.error('🔍 Full error:', error);
    
    // Xətanın növünə görə məsləhət ver
    if (error.message.includes('API açarı')) {
      console.log('💡 Məsləhət: .github/copilot-instructions.md faylındakı API açarını yoxlayın');
    } else if (error.message.includes('limiti')) {
      console.log('💡 Məsləhət: API limitiniz bitib, premium plan lazım ola bilər');
    } else if (error.message.includes('tapılmadı')) {
      console.log('💡 Məsləhət: LinkedIn ID/URL-ini yoxlayın');
    } else if (error.message.includes('əlaqə')) {
      console.log('💡 Məsləhət: İnternet bağlantınızı yoxlayın');
    }
    
    process.exit(1);
  }
}

// Test-i çalışdır
testScrapingDogAPI();
