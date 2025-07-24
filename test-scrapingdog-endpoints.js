#!/usr/bin/env node

const axios = require('axios');

// Test konfigurasyonu
const BASE_URL = 'http://localhost:3000';
const TEST_LINKEDIN_ID = 'musayevcreate';
const TEST_LINKEDIN_URL = 'https://www.linkedin.com/in/musayevcreate';

async function testAPIEndpoints() {
  console.log('🧪 ScrapingDog LinkedIn API endpoint testləri başlayır...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('');

  try {
    // 1. API Status endpoint-ini test et
    console.log('📡 1. API Status endpoint testi...');
    
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/debug/scrapingdog-api`);
      
      console.log('✅ Status endpoint uğurlu:', statusResponse.data.success);
      console.log('📊 API Status:', statusResponse.data.data.status);
      
      if (statusResponse.data.data.remaining_requests) {
        console.log('📈 Remaining requests:', statusResponse.data.data.remaining_requests);
      }
      
    } catch (error) {
      console.error('❌ Status endpoint xətası:', error.response?.data || error.message);
    }
    
    console.log('');

    // 2. LinkedIn profil import endpoint-ini test et
    console.log('🔗 2. LinkedIn profil import endpoint testi...');
    
    try {
      const importResponse = await axios.post(`${BASE_URL}/api/import/linkedin`, {
        url: TEST_LINKEDIN_URL
      });
      
      console.log('✅ Import endpoint uğurlu:', importResponse.data.success);
      console.log('📝 Message:', importResponse.data.message);
      
      if (importResponse.data.data) {
        console.log('📊 Import edilən məlumatlar:');
        console.log('   - Ad:', importResponse.data.data.personalInfo?.name || 'Yoxdur');
        console.log('   - Email:', importResponse.data.data.personalInfo?.email || 'Yoxdur');
        console.log('   - Telefon:', importResponse.data.data.personalInfo?.phone || 'Yoxdur');
        console.log('   - Ünvan:', importResponse.data.data.personalInfo?.address || 'Yoxdur');
        console.log('   - İş təcrübəsi:', importResponse.data.data.experience?.length || 0);
        console.log('   - Təhsil:', importResponse.data.data.education?.length || 0);
        console.log('   - Bacarıqlar:', importResponse.data.data.skills?.length || 0);
      }
      
    } catch (error) {
      console.error('❌ Import endpoint xətası:', error.response?.data || error.message);
    }
    
    console.log('');

    // 3. Öz profil import endpoint-ini test et
    console.log('🔐 3. Öz profil import endpoint testi...');
    
    try {
      const ownProfileResponse = await axios.post(`${BASE_URL}/api/import/linkedin/own`, {
        linkedinId: TEST_LINKEDIN_ID
      });
      
      console.log('✅ Öz profil endpoint uğurlu:', ownProfileResponse.data.success);
      console.log('📝 Message:', ownProfileResponse.data.message);
      console.log('🔗 Profile URL:', ownProfileResponse.data.profileUrl);
      
      if (ownProfileResponse.data.data) {
        console.log('📊 Öz profil məlumatları:');
        console.log('   - Ad:', ownProfileResponse.data.data.personalInfo?.name || 'Yoxdur');
        console.log('   - Email:', ownProfileResponse.data.data.personalInfo?.email || 'Yoxdur');
        console.log('   - LinkedIn:', ownProfileResponse.data.data.personalInfo?.linkedin || 'Yoxdur');
      }
      
    } catch (error) {
      console.error('❌ Öz profil endpoint xətası:', error.response?.data || error.message);
    }
    
    console.log('');

    // 4. Detallı API test endpoint-ini test et
    console.log('🔬 4. Detallı API test endpoint testi...');
    
    try {
      const detailedTestResponse = await axios.post(`${BASE_URL}/api/debug/scrapingdog-api`, {
        testProfile: TEST_LINKEDIN_ID
      });
      
      console.log('✅ Detallı test endpoint uğurlu:', detailedTestResponse.data.success);
      console.log('📊 Test nəticələri:');
      
      const testData = detailedTestResponse.data.data;
      if (testData.api_status) {
        console.log('   - API Status:', testData.api_status.status);
        console.log('   - Remaining Requests:', testData.api_status.remaining_requests || 'Bilinmir');
      }
      
      if (testData.test_profile) {
        console.log('   - Test Profil ID:', testData.test_profile.linkedin_id);
        console.log('   - Test Profil Ad:', testData.test_profile.name || 'Yoxdur');
        console.log('   - Test Profil Başlıq:', testData.test_profile.headline || 'Yoxdur');
        console.log('   - Təcrübə sayı:', testData.test_profile.experience_count);
        console.log('   - Təhsil sayı:', testData.test_profile.education_count);
        console.log('   - Bacarıq sayı:', testData.test_profile.skills_count);
        console.log('   - Profil şəkli:', testData.test_profile.has_profile_image ? 'Var' : 'Yoxdur');
        console.log('   - Əlaqə məlumatları:', testData.test_profile.has_contact_info ? 'Var' : 'Yoxdur');
      }
      
    } catch (error) {
      console.error('❌ Detallı test endpoint xətası:', error.response?.data || error.message);
    }
    
    console.log('');
    console.log('✅ Bütün API endpoint testləri tamamlandı!');
    console.log('🎉 ScrapingDog LinkedIn API endpointləri hazırdır!');
    
  } catch (error) {
    console.error('❌ Test suite xətası:', error.message);
    process.exit(1);
  }
}

// Server-in işləyib işləmədiyini yoxla
async function checkServerStatus() {
  try {
    console.log('🔍 Server status yoxlanır...');
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server işləyir');
    return true;
  } catch (error) {
    console.error('❌ Server işləmir. Development server-i başladın?');
    console.error('💡 Çalışdırın: npm run dev');
    return false;
  }
}

// Main function
async function main() {
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  console.log('');
  await testAPIEndpoints();
}

main();
