const { PrismaClient } = require('@prisma/client');

async function addWorkingAPI() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔧 İşləyən API key əlavə edilir...');
        
        // Delete old keys first
        await prisma.apiKey.deleteMany({
            where: { service: 'linkedin' }
        });
        console.log('🗑️ Köhnə API key-lər silindi');
        
        // Add working API key
        const newKey = await prisma.apiKey.create({
            data: {
                id: 'working-linkedin-api-' + Date.now(),
                name: 'Fresh LinkedIn Profile Data - Working',
                service: 'linkedin',
                key: '75cb08f9a5mshb09ff64b9fb4646p1b98a8jsnc533bdee4c87',
                host: 'fresh-linkedin-profile-data.p.rapidapi.com',
                active: true,
                priority: 1,
                usageCount: 0,
                lastUsed: null,
                lastResult: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        
        console.log('✅ Yeni işləyən API key əlavə edildi:');
        console.log(`   ID: ${newKey.id}`);
        console.log(`   Host: ${newKey.host}`);
        console.log(`   Key: ${newKey.key.substring(0, 20)}...`);
        console.log(`   Priority: ${newKey.priority}`);
        console.log(`   Active: ${newKey.active}`);
        
        // Test the API key directly
        console.log('\n🧪 API key test edilir...');
        
        const fetch = (await import('node-fetch')).default;
        const testUrl = 'https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=https://www.linkedin.com/in/elonmusk/';
        
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': newKey.key,
                'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
            }
        });
        
        console.log(`📊 API Response Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🎉 API KEY İŞLƏYİR! Sample data:');
            console.log(`   Name: ${data.name || data.full_name || data.personalInfo?.name || 'N/A'}`);
            console.log(`   Headline: ${data.headline || data.title || data.personalInfo?.headline || 'N/A'}`);
            console.log(`   Location: ${data.location || data.personalInfo?.location || 'N/A'}`);
            
            // Update success count
            await prisma.apiKey.update({
                where: { id: newKey.id },
                data: {
                    usageCount: 1,
                    successCount: 1,
                    lastUsed: new Date(),
                    lastResult: 'success - test passed'
                }
            });
            
        } else {
            console.log(`❌ API Error: ${response.status}`);
            console.log(await response.text());
        }
        
    } catch (error) {
        console.error('❌ Xəta:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addWorkingAPI();
