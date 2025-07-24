#!/usr/bin/env node

const axios = require('axios');

// ScrapingDog API test
async function testScrapingDogDirectAPI() {
  console.log('🧪 ScrapingDog API birbaşa test edilir...');
  console.log('');

  const api_key = '6882894b855f5678d36484c8';
  const url = 'https://api.scrapingdog.com/linkedin';
  
  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: 'musayevcreate',
    premium: 'false',
  };

  try {
    console.log('📡 ScrapingDog API-yə sorğu göndərilir...');
    console.log('🔧 URL:', url);
    console.log('🔧 Parametrlər:', { ...params, api_key: '***hidden***' });
    console.log('');

    const response = await axios.get(url, { 
      params: params,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    console.log('📨 Response Status:', response.status);
    console.log('📨 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('');

    if (response.status === 200) {
      const data = response.data;
      console.log('✅ API cavabı uğurla alındı!');
      console.log('📊 Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      // Əsas məlumatları göstər
      console.log('');
      console.log('📋 Profil məlumatları:');
      console.log('   - Ad:', data.name || data.full_name || 'Tapılmadı');
      console.log('   - Başlıq:', data.title || data.headline || data.current_position || 'Tapılmadı');
      console.log('   - Yer:', data.location || data.current_location || 'Tapılmadı');
      console.log('   - Haqqında:', data.about || data.summary || 'Tapılmadı');
      console.log('   - Profil şəkli:', data.profile_picture || data.image_url || 'Tapılmadı');
      
      if (data.experience && Array.isArray(data.experience)) {
        console.log('   - İş təcrübəsi:', data.experience.length, 'dənə');
        data.experience.slice(0, 2).forEach((exp, i) => {
          console.log(`     ${i+1}. ${exp.position || exp.title} @ ${exp.company || 'N/A'}`);
        });
      }
      
      if (data.education && Array.isArray(data.education)) {
        console.log('   - Təhsil:', data.education.length, 'dənə');
        data.education.slice(0, 2).forEach((edu, i) => {
          console.log(`     ${i+1}. ${edu.degree || 'N/A'} @ ${edu.school || edu.institution}`);
        });
      }
      
      if (data.skills && Array.isArray(data.skills)) {
        console.log('   - Bacarıqlar:', data.skills.length, 'dənə');
        console.log('     İlk 5:', data.skills.slice(0, 5).map(s => typeof s === 'string' ? s : s.name).join(', '));
      }
      
      console.log('');
      console.log('✅ ScrapingDog API test uğurla tamamlandı!');
      
    } else {
      console.log('❌ Request failed with status code:', response.status);
    }

  } catch (error) {
    console.error('❌ ScrapingDog API xətası:', error.message);
    
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Spesifik xəta məsajları
      switch (error.response.status) {
        case 401:
          console.log('💡 API açarı yanlışdır və ya vaxtı keçmişdir');
          break;
        case 402:
          console.log('💡 API limitiniz bitib. Premium plan lazımdır');
          break;
        case 403:
          console.log('💡 API-yə giriş qadağandır');
          break;
        case 404:
          console.log('💡 LinkedIn profili tapılmadı və ya mövcud deyil');
          break;
        case 429:
          console.log('💡 API limiti keçildi. Bir az gözləyin');
          break;
        case 500:
          console.log('💡 ScrapingDog API server xətası');
          break;
      }
    } else if (error.request) {
      console.error('💡 API-yə əlaqə yaradıla bilmədi. İnternet bağlantınızı yoxlayın');
    }
    
    process.exit(1);
  }
}

testScrapingDogDirectAPI();
