// Test registration endpoint
async function testRegistration() {
  console.log('🔍 Testing registration endpoint...');
  
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123'
    })
  });
  
  const data = await response.json();
  console.log('📊 Registration response:', {
    status: response.status,
    data: data
  });
  
  return response.status === 201;
}

// Test login endpoint
async function testLogin() {
  console.log('🔍 Testing login endpoint...');
  
  // First test with admin credentials
  const adminResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@cvera.com',
      password: 'admin123'
    })
  });
  
  const adminData = await adminResponse.json();
  console.log('📊 Admin login response:', {
    status: adminResponse.status,
    data: adminData
  });
  
  // Test with regular user if registration was successful
  const userResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpass123'
    })
  });
  
  const userData = await userResponse.json();
  console.log('📊 User login response:', {
    status: userResponse.status,
    data: userData
  });
}

async function runTests() {
  console.log('🚀 Starting authentication endpoint tests...');
  
  try {
    await testRegistration();
    await testLogin();
    console.log('✅ All tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
