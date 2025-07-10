import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample templates
  const templates = [
    {
      id: 'template-1',
      name: 'Classic Professional',
      tier: 'Free',
      previewUrl: '/templates/classic-professional.png',
    },
    {
      id: 'template-2',
      name: 'Modern Creative',
      tier: 'Free',
      previewUrl: '/templates/modern-creative.png',
    },
    {
      id: 'template-3',
      name: 'Executive Premium',
      tier: 'Medium',
      previewUrl: '/templates/executive-premium.png',
    },
    {
      id: 'template-4',
      name: 'Tech Professional',
      tier: 'Medium',
      previewUrl: '/templates/tech-professional.png',
    },
    {
      id: 'template-5',
      name: 'Luxury Executive',
      tier: 'Premium',
      previewUrl: '/templates/luxury-executive.png',
    },
    {
      id: 'template-6',
      name: 'Designer Pro',
      tier: 'Premium',
      previewUrl: '/templates/designer-pro.png',
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: {},
      create: template,
    });
  }

  // Create sample API keys for LinkedIn scraping
  const apiKeys = [
    { name: 'Sample API Key 1', key: 'sample-api-key-1', active: true },
    { name: 'Sample API Key 2', key: 'sample-api-key-2', active: true },
    { name: 'Sample API Key 3', key: 'sample-api-key-3', active: false },
  ];

  for (const apiKey of apiKeys) {
    await prisma.apiKey.upsert({
      where: { key: apiKey.key },
      update: {},
      create: apiKey,
    });
  }

  console.log('Database has been seeded with sample data');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
