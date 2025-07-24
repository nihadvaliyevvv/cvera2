#!/usr/bin/env node

/**
 * Test improved skills extraction
 */

const axios = require('axios');

const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

// Simulated improved skills extraction logic
function extractSkillsFromProfile(profile) {
  const skills = new Set();
  
  const skillPatterns = [
    'JavaScript', 'TypeScript', 'Java', 'Python', 'React', 'Node.js', 'Next.js',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Spring Boot',
    'Git', 'Linux', 'Testing', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'SDET',
    'Angular', 'Vue.js', 'Express.js', 'Kubernetes', 'CI/CD', 'DevOps', 'Azure',
    'Machine Learning', 'AI', 'Data Science', 'Microservices', 'Quality Assurance'
  ];
  
  // Check about section
  if (profile.about) {
    console.log('📝 About bölməsindən skills axtarılır...');
    const aboutText = profile.about.toLowerCase();
    skillPatterns.forEach(skill => {
      if (aboutText.includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    });
  }
  
  // Check experience summaries
  if (profile.experience && Array.isArray(profile.experience)) {
    console.log('💼 İş təcrübəsindən skills axtarılır...');
    profile.experience.forEach(exp => {
      if (exp.summary) {
        const expText = exp.summary.toLowerCase();
        skillPatterns.forEach(skill => {
          if (expText.includes(skill.toLowerCase())) {
            skills.add(skill);
          }
        });
      }
    });
  }
  
  // Check projects
  if (profile.projects && Array.isArray(profile.projects)) {
    console.log('🚀 Layihələrdən skills axtarılır...');
    profile.projects.forEach(project => {
      const projectText = project.title.toLowerCase();
      skillPatterns.forEach(skill => {
        if (projectText.includes(skill.toLowerCase())) {
          skills.add(skill);
        }
      });
    });
  }
  
  // Check awards
  if (profile.awards && Array.isArray(profile.awards)) {
    console.log('🏆 Mükafatlardan skills axtarılır...');
    profile.awards.forEach(award => {
      const awardText = award.name.toLowerCase();
      skillPatterns.forEach(skill => {
        if (awardText.includes(skill.toLowerCase())) {
          skills.add(skill);
        }
      });
    });
  }
  
  return Array.from(skills);
}

async function testImprovedSkills() {
  console.log('🧪 Təkmilləşdirilmiş skills çıxarma testi...\n');
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false',
        fields: 'name,about,experience,projects,awards'
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const data = response.data;
      const profile = Array.isArray(data) ? data[0] : data;
      
      console.log('👤 Profil:', profile.fullName);
      console.log('\n📊 Məlumat mənbələri:');
      console.log('- About:', profile.about ? '✅ mövcud' : '❌ yoxdur');
      console.log('- Experience:', profile.experience ? `✅ ${profile.experience.length} dənə` : '❌ yoxdur');
      console.log('- Projects:', profile.projects ? `✅ ${profile.projects.length} dənə` : '❌ yoxdur');
      console.log('- Awards:', profile.awards ? `✅ ${profile.awards.length} dənə` : '❌ yoxdur');
      
      console.log('\n🔍 Skills çıxarılır...');
      const extractedSkills = extractSkillsFromProfile(profile);
      
      console.log(`\n✅ ${extractedSkills.length} skills tapıldı:`);
      extractedSkills.forEach((skill, index) => {
        console.log(`   ${index + 1}. ${skill}`);
      });
      
      // Show sample text from about section
      if (profile.about) {
        console.log('\n📝 About bölməsindən nümunə:');
        console.log(profile.about.substring(0, 200) + '...');
      }
      
    } else {
      console.log('❌ API xətası:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
  }
}

testImprovedSkills();
