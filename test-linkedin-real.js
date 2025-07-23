#!/usr/bin/env node
/**
 * LinkedIn Import API Real Test
 */

async function testLinkedInImport() {
  console.log('🚀 LinkedIn Import API Test Başlayır...\n');

  const API_BASE = 'http://localhost:3001/api';

  // Test LinkedIn URLs
  const testUrls = [
    'https://www.linkedin.com/in/elonmusk',
    'https://www.linkedin.com/in/satyanadella',
    'https://www.linkedin.com/in/nihatvaliyev',
    'https://linkedin.com/in/test-user-az'
  ];

  console.log('📊 API Status yoxlanılır...');
  console.log('Test LinkedIn URL: https://www.linkedin.com/in/elonmusk');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_BASE}/import/linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://www.linkedin.com/in/elonmusk' })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Import uğurlu:');
      console.log(`   Ad: ${data.data.personalInfo?.name}`);
      console.log(`   Başlıq: ${data.data.personalInfo?.headline}`);
      console.log(`   İş təcrübəsi: ${data.data.experience?.length || 0} ədəd`);
      console.log(`   Təhsil: ${data.data.education?.length || 0} ədəd`);
      console.log(`   Bacarıqlar: ${data.data.skills?.length || 0} ədəd`);
      console.log('✅ Real LinkedIn data gətirildi!');
    } else {
      console.log('❌ Import uğursuz:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Xəta:', error.message);
  }
}

testLinkedInImport().catch(console.error);
