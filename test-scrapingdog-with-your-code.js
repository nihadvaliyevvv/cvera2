const axios = require('axios');

// Hazırda işləməyən API key - limit tükənib
const api_key = '6882894b855f5678d36484c8';
const url = 'https://api.scrapingdog.com/linkedin';

const params = {
  api_key: api_key,
  type: 'profile',
  linkId: 'musayevcreate',
  premium: 'false',
};

console.log('🔍 ScrapingDog API Test (Sizin Kod Nümunəsi)');
console.log('=============================================');

// Əvvəlcə account status yoxlayaq
console.log('📊 API Key Status Yoxlanılır...');
axios.get('https://api.scrapingdog.com/account', {
  params: { api_key: api_key }
})
.then(function(accountResponse) {
  console.log('Account Info:');
  console.log('- Request Limit:', accountResponse.data.requestLimit);
  console.log('- Request Used:', accountResponse.data.requestUsed);
  console.log('- Remaining:', accountResponse.data.requestLimit - accountResponse.data.requestUsed);
  console.log('- Pack Type:', accountResponse.data.pack);
  console.log('');

  if (accountResponse.data.requestUsed >= accountResponse.data.requestLimit) {
    console.log('❌ API limit tükəndi!');
    console.log('🔗 Yeni key almaq üçün: https://www.scrapingdog.com/');
    console.log('📝 .env.local faylında SCRAPINGDOG_API_KEY dəyişdirin');
    return;
  }

  // Əgər limit varsa, LinkedIn profilini test et
  console.log('✅ API limit qalıb, LinkedIn profilini yoxlayırıq...');
  return testLinkedInProfile();
})
.catch(function(error) {
  console.error('❌ Account status xətası:', error.response?.data || error.message);
});

function testLinkedInProfile() {
  console.log('🔄 LinkedIn profil məlumatları alınır...');

  axios
    .get(url, { params: params })
    .then(function (response) {
      if (response.status === 200) {
        const data = response.data;
        console.log('✅ LinkedIn API uğurla işlədi!');
        console.log('📋 Profil məlumatları:');
        console.log(data);
      } else {
        console.log('❌ Request failed with status code: ' + response.status);
      }
    })
    .catch(function (error) {
      console.error('❌ Error making the request: ' + error.message);

      if (error.message.includes('Unexpected token')) {
        console.log('');
        console.log('🚨 JSON Parse Xətası Təsdiqləndi!');
        console.log('Səbəb: API HTML səhifə qaytarır, JSON yox');
        console.log('Həll: Yeni API key alın');
      }
    });
}

console.log('');
console.log('💡 Yeni API key almaq üçün addımlar:');
console.log('1. https://www.scrapingdog.com/ - yeni hesab yaradın');
console.log('2. API key alın');
console.log('3. .env.local faylında SCRAPINGDOG_API_KEY=yeni_key yazın');
console.log('4. Aplikasiyanı restart edin');
