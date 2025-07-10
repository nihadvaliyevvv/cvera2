const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateTemplates() {
  try {
    console.log('🔍 Checking for duplicate templates...');
    
    // Get all templates
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📊 Total templates found: ${templates.length}`);
    
    // Group by name to find duplicates
    const templateGroups = {};
    templates.forEach(template => {
      if (!templateGroups[template.name]) {
        templateGroups[template.name] = [];
      }
      templateGroups[template.name].push(template);
    });
    
    // Show duplicates
    let duplicatesFound = false;
    for (const [name, group] of Object.entries(templateGroups)) {
      if (group.length > 1) {
        console.log(`🔄 Found ${group.length} duplicates of "${name}"`);
        duplicatesFound = true;
        
        // Keep only the first one, delete the rest
        const toKeep = group[0];
        const toDelete = group.slice(1);
        
        console.log(`   ✅ Keeping: ${toKeep.id} (created: ${toKeep.createdAt})`);
        
        for (const duplicate of toDelete) {
          console.log(`   🗑️  Deleting: ${duplicate.id} (created: ${duplicate.createdAt})`);
          await prisma.template.delete({
            where: { id: duplicate.id }
          });
        }
      }
    }
    
    if (!duplicatesFound) {
      console.log('✅ No duplicates found');
    }
    
    // Show final template list
    const finalTemplates = await prisma.template.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\n📋 Final template list:');
    finalTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.tier}) - ID: ${template.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateTemplates();
