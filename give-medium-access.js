const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function giveUserMediumAccess() {
  try {
    console.log('🔄 Updating test user subscription...');
    
    // Find test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ Test user not found!');
      return;
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    
    // Create or update subscription
    // First, delete any existing subscriptions for this user
    await prisma.subscription.deleteMany({
      where: { userId: user.id }
    });
    
    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: 'Medium',
        status: 'active',
        provider: 'test',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      }
    });
    
    console.log('✅ Subscription updated successfully:');
    console.log(`   - Tier: ${subscription.tier}`);
    console.log(`   - Status: ${subscription.status}`);
    console.log(`   - Expires: ${subscription.expiresAt}`);
    
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

giveUserMediumAccess();
