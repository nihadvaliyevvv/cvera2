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

  // API key functionality removed - using HTML scraping approach
  console.log('✅ Templates seeded successfully');
  console.log('📝 Note: API keys disabled - LinkedIn scraper uses HTML scraping');

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
