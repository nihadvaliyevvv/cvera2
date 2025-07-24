const { PrismaClient } = require('@prisma/client');

async function checkAPIKeys() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔑 Checking API Keys in Database...');
        console.log('=====================================');
        
        const apiKeys = await prisma.apiKey.findMany({
            orderBy: { priority: 'asc' }
        });
        
        console.log(`📊 Total API Keys: ${apiKeys.length}`);
        
        apiKeys.forEach((key, index) => {
            console.log(`\n${index + 1}. API Key ID: ${key.id}`);
            console.log(`   Service: ${key.service}`);
            console.log(`   Priority: ${key.priority}`);
            console.log(`   Active: ${key.isActive}`);
            console.log(`   Usage Count: ${key.usageCount}`);
            console.log(`   Success Rate: ${key.successCount}/${key.usageCount} (${
                key.usageCount > 0 ? 
                ((key.successCount / key.usageCount * 100).toFixed(1) + '%') : 
                'N/A'
            })`);
            console.log(`   Last Used: ${key.lastUsedAt || 'Never'}`);
            console.log(`   Key (first 20 chars): ${key.apiKey.substring(0, 20)}...`);
        });
        
        // Test bir key ilə direct API çağırışı
        if (apiKeys.length > 0) {
            console.log('\n🧪 Testing first active API key...');
            const testKey = apiKeys.find(k => k.isActive);
            
            if (testKey) {
                const fetch = (await import('node-fetch')).default;
                
                try {
                    const response = await fetch('https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=https://www.linkedin.com/in/elonmusk/', {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': testKey.apiKey,
                            'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
                        }
                    });
                    
                    console.log(`✅ API Response Status: ${response.status}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🎉 API KEY WORKS! Sample data:');
                        console.log(`   Name: ${data.name || data.full_name || 'N/A'}`);
                        console.log(`   Headline: ${data.headline || data.title || 'N/A'}`);
                    } else {
                        console.log(`❌ API returned error: ${response.status}`);
                        console.log(await response.text());
                    }
                    
                } catch (error) {
                    console.log(`❌ API test failed: ${error.message}`);
                }
            } else {
                console.log('❌ No active API keys found');
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAPIKeys();
