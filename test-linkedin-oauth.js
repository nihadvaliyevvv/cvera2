const { exec } = require('child_process');
const fs = require('fs');

console.log('🔗 LinkedIn OAuth Configuration Test');
console.log('=====================================');

// Check environment variables
const envFile = fs.readFileSync('.env', 'utf8');
const hasLinkedInClientId = envFile.includes('LINKEDIN_CLIENT_ID');
const hasLinkedInClientSecret = envFile.includes('LINKEDIN_CLIENT_SECRET');
const hasLinkedInRedirectUri = envFile.includes('LINKEDIN_REDIRECT_URI');
const hasJwtSecret = envFile.includes('JWT_SECRET');

console.log('Environment Variables:');
console.log(`✓ LINKEDIN_CLIENT_ID: ${hasLinkedInClientId ? 'Present' : 'Missing'}`);
console.log(`✓ LINKEDIN_CLIENT_SECRET: ${hasLinkedInClientSecret ? 'Present' : 'Missing'}`);
console.log(`✓ LINKEDIN_REDIRECT_URI: ${hasLinkedInRedirectUri ? 'Present' : 'Missing'}`);
console.log(`✓ JWT_SECRET: ${hasJwtSecret ? 'Present' : 'Missing'}`);

console.log('\n📝 LinkedIn OAuth Setup Steps:');
console.log('1. Go to https://developer.linkedin.com/');
console.log('2. Create a new app or use existing one');
console.log('3. Add OAuth 2.0 redirect URLs:');
console.log('   - http://localhost:3000/api/auth/linkedin/callback (development)');
console.log('   - https://your-domain.com/api/auth/linkedin/callback (production)');
console.log('4. Add required OAuth scopes:');
console.log('   - r_liteprofile (basic profile info)');
console.log('   - r_emailaddress (email address)');
console.log('5. Update .env file with your LinkedIn app credentials');

console.log('\n🔧 Required Environment Variables:');
console.log('LINKEDIN_CLIENT_ID=your-linkedin-client-id');
console.log('LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret');
console.log('LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback');
console.log('JWT_SECRET=your-secure-jwt-secret-key');

console.log('\n🚀 To test LinkedIn OAuth:');
console.log('1. Update .env with real LinkedIn credentials');
console.log('2. Run: npm run dev');
console.log('3. Go to http://localhost:3000');
console.log('4. Click "LinkedIn ilə giriş" button');
console.log('5. Complete OAuth flow');

console.log('\n💡 Note: LinkedIn OAuth requires HTTPS in production');
console.log('Make sure to update redirect URI for production deployment');
