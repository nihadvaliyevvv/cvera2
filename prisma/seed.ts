import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample templates (including original MySQL templates)
  const templates = [
    // Original MySQL templates - əsas 2 template
    {
      id: 'basic',
      name: 'Basic Template',
      tier: 'Free',
      previewUrl: '/templates/basic.png',
    },
    {
      id: 'resumonk-bold',
      name: 'Resumonk Bold',
      tier: 'Free',
      previewUrl: '/templates/resumonk-bold.png',
    },
    // Additional templates
   
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
