const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@cvera.az' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@cvera.az',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created successfully:');
    console.log('Email: admin@cvera.az');
    console.log('Password: admin123');
    console.log('User ID:', admin.id);
    
    // Create subscription for admin
    const subscription = await prisma.subscription.create({
      data: {
        userId: admin.id,
        tier: 'Premium',
        status: 'active',
        provider: 'system',
        providerRef: `admin-premium-${admin.id}`,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
      }
    });

    console.log('✅ Admin subscription created');  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
