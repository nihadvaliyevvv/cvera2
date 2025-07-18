const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin users...');
    
    // Check User table for admin
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'admin@cvera.az' },
          { role: 'superadmin' },
          { email: { contains: 'admin' } }
        ]
      },
      include: {
        subscriptions: true
      }
    });
    
    console.log(`📊 Found ${adminUsers.length} admin user(s) in User table:`);
    
    adminUsers.forEach(user => {
      console.log(`\n👤 Admin User:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tier: ${user.tier}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Subscriptions: ${user.subscriptions.length}`);
      
      user.subscriptions.forEach(sub => {
        console.log(`     - ${sub.tier} (${sub.status}) expires: ${sub.expiresAt}`);
      });
    });
    
    // Also check Admin table if exists
    try {
      const adminTableUsers = await prisma.admin.findMany();
      console.log(`\n📋 Found ${adminTableUsers.length} user(s) in Admin table:`);
      
      adminTableUsers.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role})`);
      });
    } catch (error) {
      console.log('\nℹ️ Admin table check skipped (might not exist or be needed)');
    }
    
    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found! Need to create admin user.');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
