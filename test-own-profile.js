#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🎯 LinkedIn Öz Profil Test Başladı...');

// Test məlumatlarını environment variables-dan götür
const testEmail = process.env.LINKEDIN_EMAIL || 'test@example.com';
const testPassword = process.env.LINKEDIN_PASSWORD || 'test-password';

console.log('📧 Test Email:', testEmail);
console.log('🔑 Password:', testPassword ? '***' : 'not provided');

if (testEmail === 'test@example.com' || testPassword === 'test-password') {
  console.log('⚠️  Gerçək LinkedIn məlumatları daxil edin:');
  console.log('LINKEDIN_EMAIL=sizin-email@example.com LINKEDIN_PASSWORD=sizin-password node test-own-profile.js');
  process.exit(1);
}

// Test 1: Öz profil scraping
console.log('\n🚀 Test 1: Öz Profil Scraping');
const ownProfileRequest = {
  email: testEmail,
  password: testPassword
};

const ownProfileCommand = `curl -X POST \\
  http://localhost:3000/api/import/linkedin/own \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(ownProfileRequest)}' \\
  -w "\\n\\nHTTP Status: %{http_code}\\n" \\
  -s`;

console.log('📡 Own Profile API Request:');
console.log(ownProfileCommand);

try {
  const ownResult = execSync(ownProfileCommand, { 
    encoding: 'utf8', 
    maxBuffer: 1024 * 1024 * 10,
    timeout: 120000 // 2 dəqiqə timeout
  });
  
  console.log('\n✅ Own Profile Response:');
  console.log(ownResult);
  
  // JSON parse edib strukturu göstər
  try {
    const lines = ownResult.split('\n');
    const jsonLine = lines.find(line => line.startsWith('{'));
    if (jsonLine) {
      const parsed = JSON.parse(jsonLine);
      console.log('\n📋 Parsed Own Profile Data:');
      console.log('- Success:', parsed.success);
      console.log('- Name:', parsed.data?.name || 'N/A');
      console.log('- Headline:', parsed.data?.headline || 'N/A');
      console.log('- Experience Count:', parsed.data?.experience?.length || 0);
      console.log('- Skills Count:', parsed.data?.skills?.length || 0);
      console.log('- Profile URL:', parsed.profileUrl || 'N/A');
    }
  } catch (parseError) {
    console.log('⚠️ JSON parse xətası:', parseError.message);
  }
  
} catch (error) {
  console.error('❌ Own Profile Test uğursuz:', error.message);
}

// Test 2: Regular profile scraping ilə müqayisə (əgər profil URL-i əldə edilmişsə)
console.log('\n🔄 Test 2: Regular Profile Scraping (müqayisə üçün)');

// Sadə public profil test
const publicProfileUrl = 'https://www.linkedin.com/in/satyanadella/';
const regularRequest = {
  url: publicProfileUrl,
  email: testEmail,
  password: testPassword
};

const regularCommand = `curl -X POST \\
  http://localhost:3000/api/import/linkedin \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(regularRequest)}' \\
  -w "\\n\\nHTTP Status: %{http_code}\\n" \\
  -s \\
  --max-time 120`;

console.log('📡 Regular Profile API Request:');
console.log(regularCommand);

try {
  const regularResult = execSync(regularCommand, { 
    encoding: 'utf8', 
    maxBuffer: 1024 * 1024 * 10,
    timeout: 120000 // 2 dəqiqə timeout
  });
  
  console.log('\n✅ Regular Profile Response:');
  console.log(regularResult);
  
} catch (error) {
  console.error('❌ Regular Profile Test uğursuz:', error.message);
}

console.log('\n📝 Test tamamlandı!');
console.log('🔗 Web UI test üçün: http://localhost:3000/test-linkedin-login.html');

console.log('\n💡 İpucu: Server işləyirmi?');
console.log('npm run dev');
