const { PrismaClient } = require('@prisma/client');

async function checkApiKeys() {
  const prisma = new PrismaClient();
  
  try {
    const keys = await prisma.apiKey.findMany({
      where: { service: 'linkedin' },
      orderBy: { priority: 'asc' }
    });
    
    console.log(`🔑 LinkedIn API Keys: ${keys.length} tapıldı`);
    
    keys.forEach((key, i) => {
      console.log(`${i+1}. Key: ${key.key.substring(0, 15)}...${key.key.slice(-15)}`);
      console.log(`   Name: ${key.name}`);
      console.log(`   Active: ${key.active ? '✅ Aktiv' : '❌ Deaktiv'}`);
      console.log(`   Priority: ${key.priority}`);
      console.log('');
    });
    
    if (keys.length === 0) {
      console.log('❌ Heç bir LinkedIn API key tapılmadı');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiKeys();
