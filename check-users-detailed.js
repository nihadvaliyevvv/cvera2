const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 İstifadəçiləri yoxlayır...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: true,
        linkedinId: true,
        tier: true,
        subscriptions: {
          select: {
            tier: true,
            status: true,
            startedAt: true,
            expiresAt: true
          }
        }
      },
      take: 10
    });
    
    console.log(`📋 İstifadəçilər (${users.length} ədəd):`);
    console.log('=====================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. İstifadəçi:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Ad: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Tier: ${user.tier || 'Free'}`);
      console.log(`   Son giriş: ${user.lastLogin || 'Yoxdur'}`);
      console.log(`   Subscription: ${user.subscriptions?.[0]?.tier || 'None'} (${user.subscriptions?.[0]?.status || 'inactive'})`);
      console.log(`   LinkedIn ID: ${user.linkedinId || 'Yoxdur'}`);
      console.log(`   Yaradılma tarixi: ${user.createdAt}`);
      console.log('---');
    });
    
    if (users.length === 0) {
      console.log('⚠️  Heç bir istifadəçi tapılmadı');
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
