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
      key: 'cb32882898msh7025ca432cb5588p1bfb73jsn86ca5a83c21b',
      service: 'linkedin',
      priority: 0,
      active: true,
    },
    {
      name: 'LinkedIn API Key 2',
      key: 'cb32882898msh7025ca432cb5588p1bfb73jsn86ca5a83c21c',
      service: 'linkedin',
      priority: 1,
      active: true,
    },
    {
      name: 'LinkedIn API Key 3',
      key: 'cb32882898msh7025ca432cb5588p1bfb73jsn86ca5a83c21d',
      service: 'linkedin',
      priority: 2,
      active: false,
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

  // Create sample templates
  const templates = [
    {
      name: 'Modern',
      tier: 'Free',
      previewUrl: '/templates/modern-preview.jpg',
    },
    {
      name: 'Classic',
      tier: 'Free',
      previewUrl: '/templates/classic-preview.jpg',
    },
    {
      name: 'Professional',
      tier: 'Medium',
      previewUrl: '/templates/professional-preview.jpg',
    },
    {
      name: 'Executive',
      tier: 'Premium',
      previewUrl: '/templates/executive-preview.jpg',
    },
  ];

  for (const templateData of templates) {
    const template = await prisma.template.create({
      data: templateData,
    });
    console.log('Created template:', template.name);
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
