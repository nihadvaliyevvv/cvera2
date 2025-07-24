const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addWorkingApiKey() {
  try {
    console.log('🔧 İşləyən API key əlavə edilir...');

    // Working API key details
    const workingKey = '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d';
    const workingHost = 'fresh-linkedin-profile-data.p.rapidapi.com';

    // First delete old non-working keys
    console.log('🗑️ Köhnə API key-lər silinir...');
    await prisma.apiKey.deleteMany({
      where: {
        service: 'linkedin'
      }
    });

    // Add the working API key
    console.log('➕ Yeni işləyən API key əlavə edilir...');
    const newApiKey = await prisma.apiKey.create({
      data: {
        name: 'Working LinkedIn API',
        key: workingKey,
        service: 'linkedin',
        host: workingHost,
        active: true,
        priority: 1,
        usageCount: 0,
        lastResult: 'working'
      }
    });

    console.log('✅ API key uğurla əlavə edildi:', {
      id: newApiKey.id,
      name: newApiKey.name,
      host: newApiKey.host,
      active: newApiKey.active
    });

    // Verify
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        service: 'linkedin',
        active: true
      }
    });

    console.log(`📊 Database-də aktiv LinkedIn API key-lər: ${apiKeys.length}`);
    apiKeys.forEach(key => {
      console.log(`  - ${key.name}: ${key.key.substring(0, 15)}... (Host: ${key.host})`);
    });

  } catch (error) {
    console.error('💥 Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkingApiKey();
