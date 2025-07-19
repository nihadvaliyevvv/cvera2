const testAISummary = async () => {
  const apiUrl = 'http://localhost:3000';
  
  console.log('🧪 AI Summary Functionality Test');
  console.log('================================');
  
  // Test data - CV məlumatları
  const testCVData = {
    personalInfo: {
      fullName: "Nihat Valiyev",
      email: "nihat@example.com",
      phone: "+994 50 123 45 67",
      linkedin: "https://linkedin.com/in/nihatvaliyev"
    },
    experience: [
      {
        id: "1",
        position: "Senior Software Developer",
        company: "Tech Solutions LLC",
        startDate: "2022-01",
        endDate: "2025-01",
        description: "React, Node.js və TypeScript istifadə edərək full-stack web aplikasiyaları yaratdım. PostgreSQL və MongoDB database-ləri ilə işlədim."
      },
      {
        id: "2", 
        position: "Frontend Developer",
        company: "Digital Agency",
        startDate: "2020-03",
        endDate: "2021-12",
        description: "Responsive web saytları və SPA aplikasiyaları yaratdım. Vue.js və React frameworkları ilə təcrübə qazandım."
      }
    ],
    education: [
      {
        id: "1",
        degree: "Computer Science Bachelor",
        institution: "Azerbaijan Technical University",
        startDate: "2016-09",
        endDate: "2020-06"
      }
    ],
    skills: [
      { id: "1", name: "React" },
      { id: "2", name: "TypeScript" },
      { id: "3", name: "Node.js" },
      { id: "4", name: "PostgreSQL" },
      { id: "5", name: "Docker" }
    ],
    projects: [
      {
        id: "1",
        name: "E-commerce Platform",
        description: "React və Node.js ilə yaradılmış tam funksional e-ticarət platforması",
        technologies: ["React", "Node.js", "PostgreSQL", "Docker"]
      }
    ]
  };

  try {
    // Test 1: Free user üçün access check
    console.log('\n📋 Test 1: Free user AI access check');
    const mockFreeUserToken = 'test-free-user-token';
    
    const checkResponse = await fetch(`${apiUrl}/api/ai/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockFreeUserToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkResult = await checkResponse.json();
    console.log('Response:', checkResult);
    
    // Test 2: Premium user üçün AI summary generation
    console.log('\n📋 Test 2: Premium user AI summary generation');
    const mockPremiumUserToken = 'test-premium-user-token';
    
    const summaryResponse = await fetch(`${apiUrl}/api/ai/summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockPremiumUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cvData: testCVData
      })
    });
    
    const summaryResult = await summaryResponse.json();
    console.log('AI Summary Response:', summaryResult);
    
    if (summaryResult.summary) {
      console.log('\n✅ Generated Summary:');
      console.log('=' + '='.repeat(50));
      console.log(summaryResult.summary);
      console.log('=' + '='.repeat(50));
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Test çalıştır
testAISummary();
