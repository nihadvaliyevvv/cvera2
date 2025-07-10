// Simple sync test
const { PrismaClient } = require('@prisma/client');

console.log('Creating Prisma client...');
const prisma = new PrismaClient();

console.log('Prisma client created');
console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('$')));

// Check if CV model exists
if (prisma.cv) {
  console.log('CV model found');
} else {
  console.log('CV model not found');
}

console.log('Test completed');
