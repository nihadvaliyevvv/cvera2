#!/usr/bin/env node

const { execSync } = require('child_process');

// Test URL (public LinkedIn profile)
const testUrl = 'https://www.linkedin.com/in/satyanadella/';

// Test məlumatlarını daxil edin (gerçək email/password)
const testEmail = process.env.LINKEDIN_EMAIL || 'your-email@example.com';
const testPassword = process.env.LINKEDIN_PASSWORD || 'your-password';

console.log('🚀 LinkedIn Login Scraper Test başladı...');

// Test request body
const requestBody = {
  url: testUrl,
  email: testEmail,
  password: testPassword
};

// cURL ilə API test et
const curlCommand = `curl -X POST \\
  http://localhost:3000/api/import/linkedin \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(requestBody)}' \\
  -v`;

console.log('📡 API Request göndərilir...');
console.log('URL:', testUrl);
console.log('Email:', testEmail);
console.log('Password:', testPassword ? '***' : 'not provided');
console.log('\n' + curlCommand + '\n');

try {
  const result = execSync(curlCommand, { 
    encoding: 'utf8', 
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  });
  
  console.log('✅ API Response:');
  console.log(result);
  
  // JSON parse edib gözəl format et
  try {
    const lines = result.split('\n');
    const jsonLine = lines.find(line => line.startsWith('{'));
    if (jsonLine) {
      const parsed = JSON.parse(jsonLine);
      console.log('\n📋 Parsed Data:');
      console.log(JSON.stringify(parsed, null, 2));
    }
  } catch (parseError) {
    console.log('⚠️ JSON parse xətası:', parseError.message);
  }
  
} catch (error) {
  console.error('❌ Test uğursuz:', error.message);
  console.log('🔧 Server işləyirmi? "npm run dev" ilə başladın?');
}

console.log('\n📝 Login məlumatları environment variables ilə verilə bilər:');
console.log('LINKEDIN_EMAIL=your-email@example.com LINKEDIN_PASSWORD=your-password node test-login-scraper.js');
