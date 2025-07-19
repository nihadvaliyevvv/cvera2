const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPremiumAccess() {
  try {
    console.log('Debugging Premium Access...\n');
    
    // Get all users with their subscriptions
    const users = await prisma.user.findMany({
      include: {
        subscriptions: true
      }
    });
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Tier: ${user.tier}`);
      console.log(`   Subscriptions:`, user.subscriptions.length > 0 ? 
        user.subscriptions.map(sub => ({
          id: sub.id,
          tier: sub.tier,
          status: sub.status,
          startedAt: sub.startedAt,
          expiresAt: sub.expiresAt,
          provider: sub.provider
        })) : 'None');
      console.log('   ---');
    });
    
    // Check canUseAIFeatures logic (with fixed case sensitivity)
    console.log('\nChecking AI access for each user:');
    
    users.forEach(user => {
      const tier = user.tier.toLowerCase();
      const canUseAI = tier === 'premium' || tier === 'medium';
      console.log(`${user.email}: tier=${user.tier}, normalized=${tier}, canUseAI=${canUseAI}`);
    });
    
    // Check for Premium users specifically  
    const premiumUsers = users.filter(user => user.tier.toLowerCase() === 'premium');
    console.log(`\nPremium users: ${premiumUsers.length}`);
    premiumUsers.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPremiumAccess();
