const { PrismaClient } = require('@prisma/client');

async function checkAPIKeyStatus() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔑 API Key-lərin statusu yoxlanılır...');
        
        const apiKeys = await prisma.apiKey.findMany({
            where: { service: 'linkedin' },
            orderBy: { priority: 'asc' }
        });
        
        console.log(`📊 LinkedIn API key-lər: ${apiKeys.length} ədəd`);
        
        apiKeys.forEach((key, index) => {
            console.log(`\n${index + 1}. ${key.name}:`);
            console.log(`   🔐 Key: ${key.apiKey.substring(0, 20)}...`);
            console.log(`   🎯 Priority: ${key.priority}`);
            console.log(`   ✅ Aktiv: ${key.active ? 'Bəli' : 'Xeyr'}`);
            console.log(`   📈 İstifadə sayı: ${key.usageCount}`);
            console.log(`   📅 Son istifadə: ${key.lastUsed || 'Heç vaxt'}`);
        });
        
        // Check database structure
        console.log('\n📋 Database cədvəl strukturu:');
        const tableInfo = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ApiKey' ORDER BY ordinal_position`;
        console.log(tableInfo);
        
    } catch (error) {
        console.error('❌ Database xətası:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAPIKeyStatus();
