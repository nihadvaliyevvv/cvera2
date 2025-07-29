const axios = require('axios');

const api_key = '6882894b855f5678d36484c8';
const url = 'https://api.scrapingdog.com/linkedin';

const params = {
  api_key: api_key,
  type: 'profile',
  linkId: 'musayevcreate',
  premium: 'false',
};

console.log('🔍 ScrapingDog API test edilir...');
console.log('📡 Parameters:', params);

axios
  .get(url, { params: params })
  .then(function (response) {
    if (response.status === 200) {
      const data = response.data;
      console.log('✅ API uğurla işlədi!');
      console.log('📊 Response status:', response.status);
      console.log('📋 Data tipi:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('🎯 Profile data keys:', data ? Object.keys(data) : 'No data');

      // Extract profile info
      let profile = data;
      if (Array.isArray(data) && data.length > 0) {
        profile = data[0];
      }

      if (profile && profile.full_name) {
        console.log('👤 Ad:', profile.full_name);
        console.log('📍 Yer:', profile.location);
        console.log('💼 Headline:', profile.headline);
        console.log('📝 About məvcud:', profile.about ? 'Bəli' : 'Xeyr');
        console.log('🏢 İş təcrübəsi:', profile.experience ? profile.experience.length + ' item' : 'Yoxdur');
        console.log('🎓 Təhsil:', profile.education ? profile.education.length + ' item' : 'Yoxdur');
      }

    } else {
      console.log('❌ Request failed with status code: ' + response.status);
    }
  })
  .catch(function (error) {
    console.error('❌ Error making the request: ' + error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  });
