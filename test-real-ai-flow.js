const testRealAIFlow = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Real AI Summary Flow Test');
  console.log('============================');
  
  // Test user data
  const testUser = {
    name: 'Test AI User',
    email: 'testai@example.com',
    password: 'testpass123'
  };
  
  const testCVData = {
    personalInfo: {
      fullName: testUser.name,
      email: testUser.email,
      phone: '+994 50 123 45 67',
      linkedin: 'https://linkedin.com/in/testuser'
    },
    experience: [
      {
        id: '1',
        position: 'Senior Developer',
        company: 'Tech Company',
        startDate: '2022-01',
        endDate: '2025-01',
        description: 'React və Node.js ilə web aplikasiyaları yaratdım'
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Computer Science',
        institution: 'ADA University',
        startDate: '2018-09',
        endDate: '2022-06'
      }
    ],
    skills: [
      { id: '1', name: 'React' },
      { id: '2', name: 'TypeScript' },
      { id: '3', name: 'Node.js' }
    ]
  };

  try {
    console.log('\\n📝 1. User Registration Test');
    
    // Register test user
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!registerResponse.ok && registerResponse.status !== 409) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    if (registerResponse.status === 409) {
      console.log('⚠️  User already exists, proceeding with login...');
    } else {
      console.log('✅ User registered successfully');
    }

    console.log('\\n🔐 2. Login Test');
    
    // Login to get token
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    if (!token) {
      throw new Error('No access token received');
    }
    
    console.log('✅ Login successful, token received');
    console.log('Token preview:', token.substring(0, 30) + '...');

    console.log('\\n🤖 3. AI Summary Generation Test');
    
    // Test AI summary generation
    const aiResponse = await fetch(`${baseUrl}/api/ai/summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cvData: testCVData })
    });
    
    const aiResult = await aiResponse.json();
    
    console.log('Response Status:', aiResponse.status);
    console.log('Response Body:', JSON.stringify(aiResult, null, 2));
    
    if (aiResponse.ok && aiResult.summary) {
      console.log('\\n🎉 AI Summary Generated Successfully!');
      console.log('=' + '='.repeat(50));
      console.log(aiResult.summary);
      console.log('=' + '='.repeat(50));
    } else if (aiResult.upgradeRequired) {
      console.log('\\n💎 Premium Required (Expected for Free users)');
      console.log('Message:', aiResult.message);
    } else {
      console.log('\\n❌ AI Generation Failed');
      console.log('Error:', aiResult.error);
    }

  } catch (error) {
    console.error('\\n❌ Test Failed:', error.message);
  }
};

// Run the test
testRealAIFlow();
