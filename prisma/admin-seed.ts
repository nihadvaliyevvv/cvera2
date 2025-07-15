import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@cvera.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@cvera.com',
      password: hashedPassword,
      role: 'superadmin',
      active: true,
    },
  });

  console.log('Created admin user:', admin);

  // Create sample API keys
  const apiKeys = [
    {
      name: 'LinkedIn API Key 1',
      key: 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4',
      service: 'linkedin',
      priority: 0,
      active: true,
    },
    {
      name: 'LinkedIn API Key 2',
      key: '75cb08f9a5mshb09ff64b9fb4646p1b98a8jsnc533bdee4c87',
      service: 'linkedin',
      priority: 1,
      active: true,
    },
    {
      name: 'LinkedIn API Key 3',
      key: 'e5784e5bd5msh824674fccf1cdd7p1c3067jsn4d38281849b1',
      service: 'linkedin',
      priority: 2,
      active: true,
    },
    {
      name: 'LinkedIn API Key 4',
      key: 'c606ec5754mshad43ac7b61cf986p1ff797jsne57f78153b99',
      service: 'linkedin',
      priority: 3,
      active: true,
    },
    {
      name: 'LinkedIn API Key 5',
      key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
      service: 'linkedin',
      priority: 4,
      active: true,
    },
  ];

  for (const keyData of apiKeys) {
    const apiKey = await prisma.apiKey.upsert({
      where: { key: keyData.key },
      update: {},
      create: keyData,
    });
    console.log('Created API key:', apiKey.name);
  }


  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
