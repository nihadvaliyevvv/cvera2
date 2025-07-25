#!/usr/bin/env node

/**
 * LinkedIn Skills bölməsini dəqiq test etmək
 */

const axios = require('axios');

const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

async function findSkillsField() {
  console.log('🔍 LinkedIn Skills bölməsini axtarırıq...\n');
  
  try {
    // Bütün sahələri əldə et ki, skills harada olduğunu tapaq
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'true'  // Premium ilə daha çox məlumat gələ bilər
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const data = response.data;
      const profile = Array.isArray(data) ? data[0] : data;
      
      console.log('📊 Bütün sahələr:');
      Object.keys(profile).forEach(key => {
        console.log(`${key}:`, typeof profile[key]);
      });
      
      console.log('\n🔍 Skills ilə əlaqəli sahələr:');
      Object.keys(profile).forEach(key => {
        if (key.toLowerCase().includes('skill') || 
            key.toLowerCase().includes('talent') ||
            key.toLowerCase().includes('ability') ||
            key.toLowerCase().includes('competenc')) {
          console.log(`🎯 ${key}:`, profile[key]);
        }
      });
      
      // Endorsements və recommendations da ola bilər
      console.log('\n🔍 Digər mümkün sahələr:');
      ['endorsements', 'recommendations', 'capabilities', 'expertise', 'skills_data', 'skill_list'].forEach(field => {
        if (profile[field]) {
          console.log(`🎯 ${field}:`, profile[field]);
        }
      });
      
      // Raw response-u da göstər
      console.log('\n📄 Raw Response Keys:', Object.keys(profile));
      
    } else {
      console.log('❌ API xətası:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

findSkillsField();
