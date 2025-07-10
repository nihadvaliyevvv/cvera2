import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApiKeys() {
  console.log('Testing API Keys in Database...');
  
  const keys = await prisma.apiKey.findMany({
    orderBy: { priority: 'asc' }
  });
  
  console.log(`\nFound ${keys.length} API keys in database:`);
  keys.forEach((key, index) => {
    console.log(`${index + 1}. ${key.name} - ${key.key.substring(0, 20)}... (${key.active ? 'Active' : 'Inactive'}) - Priority: ${key.priority}`);
  });
  
  // Test LinkedIn import functionality
  console.log('\nTesting LinkedIn import API key selection...');
  const activeKeys = await prisma.apiKey.findMany({
    where: { active: true },
    orderBy: { priority: 'asc' }
  });
  
  console.log(`Active keys for LinkedIn import: ${activeKeys.length}`);
  activeKeys.forEach((key, index) => {
    console.log(`${index + 1}. ${key.name} - ${key.key.substring(0, 20)}... (Priority: ${key.priority})`);
  });
  
  await prisma.$disconnect();
}

testApiKeys().catch(console.error);
