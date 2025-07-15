const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApiKeys() {
  try {
    console.log('Checking API keys in database...');
    
    const keys = await prisma.apiKey.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`Found ${keys.length} active API keys:`);
    
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.key.substring(0, 20)}... (created: ${key.createdAt})`);
    });
    
    if (keys.length === 0) {
      console.log('No active API keys found in database!');
    }
    
  } catch (error) {
    console.error('Error checking API keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiKeys();
