import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample templates based on existing template images
  const templates = [
    // Free Templates
    {
      id: 'basic',
      name: 'Basic Professional',
      tier: 'Free',
      previewUrl: '/templates/classic-preview.jpg',
      description: 'Klassik və səliqəli dizayn ilə hər sahə üçün uyğun şablon',
    },
    {
      id: 'modern-free',
      name: 'Modern Professional', 
      tier: 'Free',
      previewUrl: '/templates/modern-preview.jpg',
      description: 'Müasir və professional görünüm üçün mükəmməl şablon',
    },
    {
      id: 'elegant-free',
      name: 'Elegant Professional',
      tier: 'Free', 
      previewUrl: '/templates/elegant-professional-preview.jpg',
      description: 'Zərif və professional görünüm üçün hazırlanmış',
    },
    {
      id: 'simple-classic',
      name: 'Classic Simple',
      tier: 'Free',
      previewUrl: '/templates/classic-professional.png',
      description: 'Sadə və effektiv klassik dizayn',
    },
    
    // Medium Templates  
    {
      id: 'professional-resume',
      name: 'Professional Resume',
      tier: 'Medium',
      previewUrl: '/templates/professional-resume-preview.jpg',
      description: 'Orta səviyyə professional xüsusiyyətlərlə',
    },
    {
      id: 'tech-professional',
      name: 'Tech Professional',
      tier: 'Medium',
      previewUrl: '/templates/tech-professional.png',
      description: 'Texnologiya sahəsində çalışanlar üçün',
    },
    {
      id: 'modern-creative-medium',
      name: 'Modern Creative',
      tier: 'Medium', 
      previewUrl: '/templates/modern-creative.png',
      description: 'Müasir yaradıcı peşələr üçün',
    },
    
    // Premium Templates
    {
      id: 'executive-premium',
      name: 'Executive Premium',
      tier: 'Premium',
      previewUrl: '/templates/executive-preview.jpg',
      description: 'Yüksək səviyyəli mövqelər üçün lüks dizayn',
    },
    {
      id: 'executive-elite', 
      name: 'Executive Elite',
      tier: 'Premium',
      previewUrl: '/templates/executive-elite-preview.jpg',
      description: 'Elit səviyyədə idarəçilər üçün',
    },
    {
      id: 'luxury-executive',
      name: 'Luxury Executive',
      tier: 'Premium',
      previewUrl: '/templates/luxury-executive.png',
      description: 'Lüks və prestij üçün hazırlanmış',
    },
    {
      id: 'designer-pro',
      name: 'Creative Designer Pro',
      tier: 'Premium',
      previewUrl: '/templates/designer-pro.png',
      description: 'Yaradıcı peşələr üçün premium dizayn',
    },
    {
      id: 'executive-premium-alt',
      name: 'Executive Premium Alternative', 
      tier: 'Premium',
      previewUrl: '/templates/executive-premium.png',
      description: 'Premium idarəçi şablonunun alternativ versiyası',
    }
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
