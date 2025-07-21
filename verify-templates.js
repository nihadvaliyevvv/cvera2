#!/usr/bin/env node

/**
 * Verify Database Templates
 * Double-check that templates were added correctly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTemplates() {
  try {
    console.log('🔍 Veritabanında Template-ları Yoxlayırıq...\n');

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Cəmi Template Sayı: ${templates.length}\n`);

    console.log('📋 Template Siyahısı:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    templates.forEach((template, index) => {
      const createdDate = new Date(template.createdAt).toLocaleDateString('az-AZ');
      const isNew = index < 2; // Son 2 template yeni əlavə edilənlərdir
      const newIndicator = isNew ? ' 🆕' : '';
      
      console.log(`${index + 1}. ${template.name}${newIndicator}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Tier: ${template.tier}`);
      console.log(`   Preview: ${template.previewUrl}`);
      console.log(`   Təsvir: ${template.description || 'Təsvir yoxdur'}`);
      console.log(`   Yaradılma: ${createdDate}`);
      console.log('');
    });

    // Tier statistikaları
    const tierStats = templates.reduce((acc, template) => {
      acc[template.tier] = (acc[template.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Tier Statistikaları:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(tierStats).forEach(([tier, count]) => {
      console.log(`${tier}: ${count} template`);
    });

    // Yeni template-ları xüsusi olaraq göstər
    const newTemplates = templates.filter(t => 
      t.name === 'Elegant Professional' || t.name === 'Executive Elite'
    );

    if (newTemplates.length === 2) {
      console.log('\n✅ Yeni Template-lar Uğurla Əlavə Edildi:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      newTemplates.forEach(template => {
        console.log(`🎨 ${template.name} (${template.tier})`);
        console.log(`   Təsvir: ${template.description}`);
        console.log(`   Preview: ${template.previewUrl}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  Yeni template-lardan bəziləri tapılmadı');
    }

    console.log('📋 Tamamlandı! Template-lar hazır istifadə üçün.');

  } catch (error) {
    console.error('❌ Xəta:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTemplates();
