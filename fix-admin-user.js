const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('🔧 Fixing admin user...');
    
    // Update admin user in User table
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@cvera.az' },
      data: {
        role: 'superadmin',
        tier: 'Premium',
        name: 'CVera Admin'
      }
    });
    
    console.log('✅ Updated admin user in User table');
    
    // Also create in Admin table
    try {
      const adminInAdminTable = await prisma.admin.upsert({
        where: { email: 'admin@cvera.az' },
        update: {
          name: 'CVera Admin',
          role: 'superadmin',
          active: true
        },
        create: {
          name: 'CVera Admin',
          email: 'admin@cvera.az',
          password: updatedAdmin.password, // Same password hash
          role: 'superadmin',
          active: true
        }
      });
      
      console.log('✅ Created/updated admin in Admin table');
      
    } catch (adminError) {
      console.log('ℹ️ Admin table creation skipped:', adminError.message);
    }
    
    // Verify the fix
    const verifyAdmin = await prisma.user.findUnique({
      where: { email: 'admin@cvera.az' },
      include: { subscriptions: true }
    });
    
    console.log('\n✅ Admin user verification:');
    console.log(`   Email: ${verifyAdmin.email}`);
    console.log(`   Name: ${verifyAdmin.name}`);
    console.log(`   Role: ${verifyAdmin.role}`);
    console.log(`   Tier: ${verifyAdmin.tier}`);
    console.log(`   Subscriptions: ${verifyAdmin.subscriptions.length}`);
    
    console.log('\n🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log('Email: admin@cvera.az');
    console.log('Password: admin123');
    console.log('================================');
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
