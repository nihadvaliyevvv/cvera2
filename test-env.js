// Test environment configuration
console.log('Environment Configuration Check:');
console.log('RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST);
console.log('RAPIDAPI_KEY_1:', process.env.RAPIDAPI_KEY_1 ? `${process.env.RAPIDAPI_KEY_1.substring(0, 10)}...` : 'Not set');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

// Test API key format
const testKey = process.env.RAPIDAPI_KEY_1;
if (testKey) {
  console.log('API Key Length:', testKey.length);
  console.log('API Key Format Check:', testKey.includes('msh') ? 'Valid format' : 'Invalid format');
}
