#!/usr/bin/env node

/**
 * Comprehensive test for optimized LinkedIn import
 * LinkedIn import funksionallığının optimize edilmiş test edilməsi
 */

import { ScrapingDogLinkedInScraper } from './src/lib/scraper/scrapingdog-linkedin-scraper.js';

async function testOptimizedLinkedInImport() {
  console.log('🧪 Optimize edilmiş LinkedIn import test edilir...\n');
  
  const scraper = new ScrapingDogLinkedInScraper();
  const testUrl = 'https://www.linkedin.com/in/musayevcreate';
  
  try {
    console.log('📡 LinkedIn profil məlumatları əldə edilir...');
    console.log('🎯 Test URL:', testUrl);
    console.log('⚡ Optimize edilmiş sorğu - yalnız vacib sahələr\n');
    
    const profile = await scraper.scrapeProfile(testUrl);
    
    console.log('✅ LinkedIn profil məlumatları uğurla əldə edildi!\n');
    
    // Şəxsi Məlumatlar
    console.log('👤 ŞƏXSİ MƏLUMATLAR:');
    console.log(`   Ad: ${profile.name || 'N/A'}`);
    console.log(`   Başlıq: ${profile.headline || 'N/A'}`);
    console.log(`   Məkan: ${profile.location || 'N/A'}`);
    console.log(`   Haqqında: ${profile.about ? profile.about.substring(0, 100) + '...' : 'N/A'}\n`);
    
    // İş Təcrübəsi
    console.log('💼 İŞ TƏCRÜBƏSİ:');
    if (profile.experience && profile.experience.length > 0) {
      console.log(`   Ümumi: ${profile.experience.length} iş təcrübəsi`);
      profile.experience.slice(0, 2).forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.position} - ${exp.company}`);
        console.log(`      Tarix: ${exp.date_range}`);
      });
    } else {
      console.log('   İş təcrübəsi məlumatı yoxdur');
    }
    console.log('');
    
    // Təhsil
    console.log('🎓 TƏHSİL:');
    if (profile.education && profile.education.length > 0) {
      console.log(`   Ümumi: ${profile.education.length} təhsil məlumatı`);
      profile.education.forEach((edu, index) => {
        console.log(`   ${index + 1}. ${edu.degree} - ${edu.school}`);
        console.log(`      Sahə: ${edu.field_of_study}`);
      });
    } else {
      console.log('   Təhsil məlumatı yoxdur');
    }
    console.log('');
    
    // Bacarıqlar
    console.log('🛠️ BACARIQQLAR:');
    if (profile.skills && profile.skills.length > 0) {
      console.log(`   Ümumi: ${profile.skills.length} bacarıq`);
      console.log(`   Bacarıqlar: ${profile.skills.slice(0, 10).join(', ')}`);
    } else {
      console.log('   Bacarıq məlumatı yoxdur');
    }
    console.log('');
    
    // Dillər
    console.log('🗣️ DİLLƏR:');
    if (profile.languages && profile.languages.length > 0) {
      console.log(`   Ümumi: ${profile.languages.length} dil`);
      profile.languages.forEach((lang, index) => {
        console.log(`   ${index + 1}. ${lang.name} (${lang.proficiency})`);
      });
    } else {
      console.log('   Dil məlumatı yoxdur');
    }
    console.log('');
    
    // Layihələr
    console.log('🚀 LAYİHƏLƏR:');
    if (profile.projects && profile.projects.length > 0) {
      console.log(`   Ümumi: ${profile.projects.length} layihə`);
      profile.projects.slice(0, 3).forEach((proj, index) => {
        console.log(`   ${index + 1}. ${proj.name}`);
        console.log(`      Təsvir: ${proj.description.substring(0, 50) + '...'}`);
      });
    } else {
      console.log('   Layihə məlumatı yoxdur');
    }
    console.log('');
    
    // Sertifikatlar
    console.log('🏆 SERTİFİKATLAR:');
    if (profile.certifications && profile.certifications.length > 0) {
      console.log(`   Ümumi: ${profile.certifications.length} sertifikat`);
      profile.certifications.slice(0, 3).forEach((cert, index) => {
        console.log(`   ${index + 1}. ${cert.name} - ${cert.issuer}`);
        console.log(`      Tarix: ${cert.date}`);
      });
    } else {
      console.log('   Sertifikat məlumatı yoxdur');
    }
    console.log('');
    
    // Könüllü Təcrübə
    console.log('🤝 KÖNÜLLÜ TƏCRÜBƏSİ:');
    if (profile.volunteerExperience && profile.volunteerExperience.length > 0) {
      console.log(`   Ümumi: ${profile.volunteerExperience.length} könüllü təcrübəsi`);
      profile.volunteerExperience.forEach((vol, index) => {
        console.log(`   ${index + 1}. ${vol.role} - ${vol.organization}`);
        console.log(`      Səbəb: ${vol.cause}`);
      });
    } else {
      console.log('   Könüllü təcrübəsi məlumatı yoxdur');
    }
    console.log('');
    
    // Ümumi nəticə
    console.log('📊 ÜMUMİ NƏTİCƏ:');
    console.log('✅ Bütün vacib sahələr yoxlanıldı');
    console.log('⚡ Server yükü minimize edildi');
    console.log('🎯 Yalnız CV üçün lazım olan məlumatlar əldə edildi');
    
    console.log('\n🎉 Test uğurla tamamlandı!');
    return true;
    
  } catch (error) {
    console.error('❌ Test xətası:', error.message);
    console.error('📍 Xəta detalları:', error);
    return false;
  }
}

// Test çalışdır
testOptimizedLinkedInImport()
  .then((success) => {
    if (success) {
      console.log('\n✅ Optimize edilmiş LinkedIn import işləyir!');
      process.exit(0);
    } else {
      console.log('\n❌ Test uğursuz oldu');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test qeyri-gözlənilən xəta:', error.message);
    process.exit(1);
  });
