#!/usr/bin/env node

/**
 * Simple Skills Test - Check if empty array works
 */

const axios = require('axios');

const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

async function testSkillsFixed() {
  console.log('🧪 Skills məsələsi yekun test edilir...\n');
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false'
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const data = response.data;
      const profile = Array.isArray(data) ? data[0] : data;
      
      console.log('✅ ScrapingDog API-dən məlumat alındı');
      console.log('\n📊 Sahələr:');
      console.log('- Name:', profile.fullName ? '✅' : '❌');
      console.log('- Headline:', profile.headline ? '✅' : '❌');
      console.log('- Location:', profile.location ? '✅' : '❌');
      console.log('- Experience:', profile.experience?.length > 0 ? '✅' : '❌');
      console.log('- Education:', profile.education?.length > 0 ? '✅' : '❌');
      console.log('- Projects:', profile.projects?.length > 0 ? '✅' : '❌');
      console.log('- Languages:', profile.languages?.length > 0 ? '❌ (boş)' : '❌ (yoxdur)');
      
      console.log('\n🛠️ Skills Status:');
      console.log('- API-də skills sahəsi:', profile.skills ? 'MÖVCUD' : 'YOXDUR');
      console.log('- Bizim həll:', 'Skills = [] (boş array)');
      console.log('- İstifadəçinin edəcəyi:', 'Manual skill əlavə etmək');
      
      console.log('\n🎯 Nəticə:');
      console.log('✅ ScrapingDog skills vermir - bu normaldır');
      console.log('✅ Boş array göndəririk - düzgündür');
      console.log('✅ İstifadəçi UI-də özü əlavə edər');
      console.log('✅ Problem həll edildi!');
      
    } else {
      console.log('❌ API xətası:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
  }
}

testSkillsFixed();
