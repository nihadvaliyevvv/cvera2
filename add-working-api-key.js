const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addWorkingApiKey() {
  try {
    console.log('🔧 İşləyən API key əlavə edilir...');

    // First, let's see current API keys
    const existingKeys = await prisma.apiKey.findMany({
      where: {
        service: 'linkedin'
      }
    });

    console.log(`📊 Mövcud API key-lər: ${existingKeys.length}`);
    existingKeys.forEach(key => {
      console.log(`  - ${key.name}: ${key.key.substring(0, 20)}... (Host: ${key.host || 'N/A'}, Active: ${key.active})`);
    });

    // Check if this exact key already exists
    const workingKey = '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d';
    const workingHost = 'fresh-linkedin-profile-data.p.rapidapi.com';

    const existingWorkingKey = await prisma.apiKey.findFirst({
      where: {
        key: workingKey,
        service: 'linkedin'
      }
    });

    if (existingWorkingKey) {
      console.log('📝 Bu API key artıq mövcuddur, yenilənir...');
      
      await prisma.apiKey.update({
        where: {
          id: existingWorkingKey.id
        },
        data: {
          active: true,
          host: workingHost,
          priority: 1, // Give it highest priority
          name: 'Working Fresh LinkedIn API',
          lastResult: 'working'
        }
      });

      console.log('✅ Mövcud API key yeniləndi');
    } else {
      console.log('➕ Yeni API key əlavə edilir...');
      
      await prisma.apiKey.create({
        data: {
          name: 'Working Fresh LinkedIn API',
          key: workingKey,
          service: 'linkedin',
          host: workingHost,
          active: true,
          priority: 1,
          dailyLimit: 1000,
          usageCount: 0,
          lastResult: 'working'
        }
      });

      console.log('✅ Yeni API key əlavə edildi');
    }

    // Set other keys to lower priority or inactive
    await prisma.apiKey.updateMany({
      where: {
        service: 'linkedin',
        key: {
          not: workingKey
        }
      },
      data: {
        priority: 10, // Lower priority
        active: false // Disable non-working keys for now
      }
    });

    console.log('🔧 Digər API key-lər aşağı prioritetə keçirildi');

    // Verify the changes
    const updatedKeys = await prisma.apiKey.findMany({
      where: {
        service: 'linkedin'
      },
      orderBy: {
        priority: 'asc'
      }
    });

    console.log('\n📋 Yenilənmiş API key-lər:');
    updatedKeys.forEach(key => {
      console.log(`  - ${key.name}: Priority ${key.priority}, Active: ${key.active}, Host: ${key.host}`);
    });

  } catch (error) {
    console.error('💥 Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkingApiKey();
