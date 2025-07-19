const jwt = require('jsonwebtoken');

// Test AI access after fix
async function testAIAccess() {
  try {
    console.log('Testing AI access with fixed canUseAIFeatures function...\n');
    
    // Test with different tier cases
    const testCases = [
      { tier: 'Premium', expected: true },
      { tier: 'premium', expected: true },
      { tier: 'PREMIUM', expected: true },
      { tier: 'Medium', expected: true },
      { tier: 'medium', expected: true },
      { tier: 'MEDIUM', expected: true },
      { tier: 'Free', expected: false },
      { tier: 'free', expected: false },
      { tier: 'FREE', expected: false },
    ];
    
    // Simulate the fixed canUseAIFeatures function
    function canUseAIFeatures(userTier) {
      const tier = userTier.toLowerCase();
      return tier === 'premium' || tier === 'medium';
    }
    
    testCases.forEach(testCase => {
      const result = canUseAIFeatures(testCase.tier);
      const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} Tier: "${testCase.tier}" -> canUseAI: ${result} (expected: ${testCase.expected})`);
    });
    
    console.log('\n--- API Test ---');
    
    // Create a test JWT token for admin@cvera.az (Premium user)
    const payload = {
      id: 'dc7e5760-608a-41f4-a7a9-65e3c94ac4d5',
      email: 'admin@cvera.az',
      tier: 'Premium'
    };
    
    const token = jwt.sign(payload, 'az8V!hjkJHKL1231jklADJKU2389@qweLKP', { expiresIn: '1h' });
    console.log('Generated test token for admin@cvera.az (Premium user)');
    
    // Test API call
    const response = await fetch('http://localhost:3000/api/ai/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

testAIAccess();
