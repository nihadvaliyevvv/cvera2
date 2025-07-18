const jwt = require('jsonwebtoken');

// JWT secret from .env.local
const JWT_SECRET = 'az8V!hjkJHKL1231jklADJKU2389@qweLKP';

// Create a test token for the real user ID
const testPayload = {
  userId: '24253309-952e-402a-83e2-2d7d9fb65c9b',
  email: 'test@example.com'
};

const token = jwt.sign(testPayload, JWT_SECRET, {
  expiresIn: '1h',
});

console.log('🔑 Real User JWT Token:');
console.log(token);

// Verify the token works
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n✅ Token doğrulanması uğurlu:');
  console.log(decoded);
} catch (error) {
  console.log('\n❌ Token doğrulanması uğursuz:', error.message);
}
