#!/usr/bin/env node

/**
 * Add New CV Templates
 * Adds 1 Medium tier and 1 Premium tier template
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addNewTemplates() {
  try {
    console.log('🎨 Yeni CV Template-ları Əlavə Edilir...\n');

    // Check existing templates
    const existingTemplates = await prisma.template.findMany();
    console.log(`📊 Mövcud template sayı: ${existingTemplates.length}`);
    
    // Count by tier
    const tierCount = existingTemplates.reduce((acc, template) => {
      acc[template.tier] = (acc[template.tier] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Tier üzrə bölgü:');
    Object.entries(tierCount).forEach(([tier, count]) => {
      console.log(`  ${tier}: ${count} template`);
    });

    console.log('\n🆕 Yeni Template-lar Əlavə Edilir...\n');

    // New Medium Template - Better Design
    const mediumTemplate = await prisma.template.create({
      data: {
        id: `template_medium_elegant_${Date.now()}`,
        name: 'Elegant Professional',
        tier: 'Medium',
        previewUrl: '/templates/elegant-professional-preview.jpg',
        description: 'Daha yaxşı dizaynlı professional template. Modern rənglər və tipografiya ilə hazırlanmış.'
      }
    });

    console.log('✅ Medium Template Əlavə Edildi:');
    console.log(`   ID: ${mediumTemplate.id}`);
    console.log(`   Ad: ${mediumTemplate.name}`);
    console.log(`   Tier: ${mediumTemplate.tier}`);
    console.log(`   Təsvir: ${mediumTemplate.description}`);
    console.log('');

    // New Premium Template - More Professional Design  
    const premiumTemplate = await prisma.template.create({
      data: {
        id: `template_premium_executive_${Date.now()}`,
        name: 'Executive Elite',
        tier: 'Premium',
        previewUrl: '/templates/executive-elite-preview.jpg',
        description: 'Daha professional və lüks dizaynlı template. C-level və senior mövqelər üçün hazırlanmış.'
      }
    });

    console.log('✅ Premium Template Əlavə Edildi:');
    console.log(`   ID: ${premiumTemplate.id}`);
    console.log(`   Ad: ${premiumTemplate.name}`);
    console.log(`   Tier: ${premiumTemplate.tier}`);
    console.log(`   Təsvir: ${premiumTemplate.description}`);
    console.log('');

    // Check updated count
    const updatedTemplates = await prisma.template.findMany();
    const updatedTierCount = updatedTemplates.reduce((acc, template) => {
      acc[template.tier] = (acc[template.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Yenilənmiş Statistika:');
    console.log(`Cəmi template sayı: ${updatedTemplates.length} (+2)`);
    console.log('Tier üzrə bölgü:');
    Object.entries(updatedTierCount).forEach(([tier, count]) => {
      const oldCount = tierCount[tier] || 0;
      const change = count - oldCount;
      const changeStr = change > 0 ? ` (+${change})` : '';
      console.log(`  ${tier}: ${count} template${changeStr}`);
    });

    console.log('\n🎯 Template Xüsusiyyətləri:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Elegant Professional (Medium):');
    console.log('  • Yaxşılaşdırılmış tipografiya');
    console.log('  • Modern rəng paleti');
    console.log('  • Professional layout');
    console.log('  • İkonlar və borders');
    console.log('');
    console.log('Executive Elite (Premium):');
    console.log('  • Lüks və minimalist dizayn');
    console.log('  • Premium rəng sxemi');
    console.log('  • C-level executives üçün');
    console.log('  • Ekskluziv layout elements');

    console.log('\n✅ Template Əlavə Etməsi Tamamlandı!');

  } catch (error) {
    console.error('❌ Xəta baş verdi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addNewTemplates();
