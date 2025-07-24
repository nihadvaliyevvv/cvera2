#!/usr/bin/env node

/**
 * Test optimized ScrapingDog API - only essential fields
 * Yalnız vacib sahələri əldə etmək üçün optimize edilmiş test
 */

const axios = require('axios');

const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

async function testOptimizedScrapingDog() {
  console.log('🧪 Optimize edilmiş ScrapingDog API test edilir...\n');
  console.log('📋 Yalnız bu sahələr əldə ediləcək:');
  console.log('   ✅ Şəxsi Məlumatlar');
  console.log('   ✅ İş Təcrübəsi');
  console.log('   ✅ Təhsil');
  console.log('   ✅ Bacarıqlar');
  console.log('   ✅ Dillər');
  console.log('   ✅ Layihələr');
  console.log('   ✅ Sertifikatlar');
  console.log('   ✅ Könüllü Təcrübə\n');
  
  const params = {
    api_key: API_KEY,
    type: 'profile',
    linkId: 'musayevcreate',
    premium: 'false',
    // Yalnız vacib sahələr - server yükünü azaltmaq üçün
    fields: 'name,headline,location,about,experience,education,skills,certifications,languages,projects,volunteer_experience'
  };

  try {
    console.log('🚀 Optimize edilmiş sorğu göndərilir...');
    const startTime = Date.now();
    
    const response = await axios.get(BASE_URL, {
      params,
      timeout: 45000,
      headers: {
        'User-Agent': 'CVera-LinkedIn-Scraper/1.0',
      },
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      console.log(`✅ Uğurlu! Cavab ${duration}ms-də alındı`);
      
      const data = response.data;
      const profile = Array.isArray(data) ? data[0] : data;
      
      if (profile) {
        console.log('\n📊 Əldə edilən məlumatlar:');
        
        // Şəxsi Məlumatlar
        if (profile.name || profile.fullName) {
          console.log(`👤 Ad: ${profile.name || profile.fullName}`);
        }
        if (profile.headline) {
          console.log(`💼 Başlıq: ${profile.headline}`);
        }
        if (profile.location) {
          console.log(`📍 Yer: ${profile.location}`);
        }
        
        // İş Təcrübəsi
        if (profile.experience && profile.experience.length > 0) {
          console.log(`💼 İş Təcrübəsi: ${profile.experience.length} dənə`);
        }
        
        // Təhsil
        if (profile.education && profile.education.length > 0) {
          console.log(`🎓 Təhsil: ${profile.education.length} dənə`);
        }
        
        // Dillər
        if (profile.languages && profile.languages.length > 0) {
          console.log(`🗣️ Dillər: ${profile.languages.length} dənə`);
        }
        
        // Layihələr
        if (profile.projects && profile.projects.length > 0) {
          console.log(`🚀 Layihələr: ${profile.projects.length} dənə`);
        }
        
        // Sertifikatlar
        if (profile.certifications && profile.certifications.length > 0) {
          console.log(`🏆 Sertifikatlar: ${profile.certifications.length} dənə`);
        }
        
        // Könüllü Təcrübə
        if (profile.volunteering && profile.volunteering.length > 0) {
          console.log(`🤝 Könüllü Təcrübə: ${profile.volunteering.length} dənə`);
        }
        
        console.log(`\n📈 Response ölçüsü: ${JSON.stringify(data).length} simvol`);
        console.log('✅ Server yükü azaldılıb - yalnız vacib məlumatlar əldə edilib!');
        
      } else {
        console.log('⚠️ Profil məlumatları tapılmadı');
      }
      
    } else {
      console.log(`❌ API xətası: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test uğursuz oldu:', error.message);
    
    if (error.response) {
      console.error(`📡 HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout xətası');
    } else {
      console.error('🌐 Şəbəkə xətası');
    }
  }
}

// Test çalışdır
testOptimizedScrapingDog()
  .then(() => {
    console.log('\n🎉 Test tamamlandı!');
  })
  .catch((error) => {
    console.error('\n💥 Test xətası:', error.message);
    process.exit(1);
  });
