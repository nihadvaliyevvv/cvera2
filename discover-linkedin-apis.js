async function discoverWorkingLinkedInAPIs() {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔍 LinkedIn API Endpoint-lərini Kəşf Edirik...');
    console.log('='.repeat(60));
    
    const apiKey = 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4';
    const testProfile = 'https://www.linkedin.com/in/elonmusk/';
    
    // Different API services to test
    const apiServices = [
        {
            name: 'Fresh LinkedIn Profile Data',
            host: 'fresh-linkedin-profile-data.p.rapidapi.com',
            endpoints: [
                { path: '/scrape', method: 'POST', body: { url: testProfile } },
                { path: '/profile', method: 'POST', body: { url: testProfile } },
                { path: '/get-profile', method: 'POST', body: { linkedin_url: testProfile } },
                { path: '/linkedin', method: 'POST', body: { url: testProfile } },
                { path: '/data', method: 'POST', body: { url: testProfile } },
                { path: '/extract', method: 'POST', body: { url: testProfile } }
            ]
        },
        {
            name: 'LinkedIn Profiles1',
            host: 'linkedin-profiles1.p.rapidapi.com',
            endpoints: [
                { path: '/profile', method: 'GET', query: `?url=${encodeURIComponent(testProfile)}` },
                { path: '/scrape', method: 'POST', body: { linkedin_url: testProfile } },
                { path: '/get-profile', method: 'GET', query: `?linkedin_url=${encodeURIComponent(testProfile)}` }
            ]
        },
        {
            name: 'LinkedIn API8',
            host: 'linkedin-api8.p.rapidapi.com',
            endpoints: [
                { path: '/get-profile-data', method: 'POST', body: { linkedin_url: testProfile } },
                { path: '/profile-data', method: 'POST', body: { url: testProfile } },
                { path: '/scrape-profile', method: 'POST', body: { url: testProfile } }
            ]
        },
        {
            name: 'LinkedIn Scraper API',
            host: 'linkedin-scraper-api.p.rapidapi.com',
            endpoints: [
                { path: '/person', method: 'GET', query: `?url=${encodeURIComponent(testProfile)}` },
                { path: '/profile', method: 'POST', body: { url: testProfile } }
            ]
        }
    ];
    
    for (const service of apiServices) {
        console.log(`\n🏢 Testing Service: ${service.name}`);
        console.log(`📡 Host: ${service.host}`);
        
        for (const endpoint of service.endpoints) {
            try {
                console.log(`\n  🔗 Testing: ${endpoint.method} ${endpoint.path}`);
                
                let url = `https://${service.host}${endpoint.path}`;
                let options = {
                    method: endpoint.method,
                    headers: {
                        'X-RapidAPI-Key': apiKey,
                        'X-RapidAPI-Host': service.host,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                };
                
                if (endpoint.query) {
                    url += endpoint.query;
                } else if (endpoint.body) {
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify(endpoint.body);
                }
                
                console.log(`     📤 Request: ${url}`);
                
                const response = await fetch(url, options);
                console.log(`     📊 Status: ${response.status} ${response.statusText}`);
                
                const responseText = await response.text();
                
                if (response.ok) {
                    console.log(`     ✅ SUCCESS!`);
                    console.log(`     📄 Response: ${responseText.substring(0, 200)}...`);
                    
                    // Try to parse JSON
                    try {
                        const data = JSON.parse(responseText);
                        if (data && typeof data === 'object') {
                            const keys = Object.keys(data);
                            console.log(`     🔑 Keys: ${keys.slice(0, 10).join(', ')}`);
                            
                            // Check for profile data
                            const hasProfileData = !!(
                                data.name || data.full_name || data.firstName || 
                                data.headline || data.title || data.summary || 
                                data.experience || data.work_history || data.data
                            );
                            
                            if (hasProfileData) {
                                console.log(`     🎉 PROFILE DATA FOUND! This endpoint works!`);
                                console.log(`     📋 Working Configuration:`);
                                console.log(`        Host: ${service.host}`);
                                console.log(`        Path: ${endpoint.path}`);
                                console.log(`        Method: ${endpoint.method}`);
                                console.log(`        Body: ${JSON.stringify(endpoint.body || {})}`);
                            }
                        }
                    } catch (parseError) {
                        console.log(`     ⚠️  Response is not JSON`);
                    }
                } else {
                    console.log(`     ❌ Error: ${responseText.substring(0, 100)}`);
                }
                
            } catch (error) {
                console.log(`     💥 Request failed: ${error.message}`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.log('\n🏁 API Discovery Complete!');
}

discoverWorkingLinkedInAPIs();
