// Check model names
const { PrismaClient } = require('@prisma/client');

console.log('Creating Prisma client...');
const prisma = new PrismaClient();

console.log('Available models:');
Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'))
  .forEach(key => {
    console.log(`- ${key}`);
  });

// Try both cv and cV
console.log('\nTesting cv model...');
if (prisma.cv) {
  console.log('prisma.cv exists');
} else {
  console.log('prisma.cv does not exist');
}

console.log('\nTesting cV model...');
if (prisma.cV) {
  console.log('prisma.cV exists');
} else {
  console.log('prisma.cV does not exist');
}

console.log('\nTest completed');
