/**
 * Subscription Limits Test
 * Bu script abunəlik limitləri sistemini test edir
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'test123'
};

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    
    return { response, data };
}

async function testSubscriptionLimits() {
    console.log('🔄 Subscription Limits Test Starting...\n');
    
    try {
        // 1. Login to get auth token
        console.log('1️⃣ Attempting login...');
        const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(testUser)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Login failed:', loginData);
            return;
        }
        
        console.log('✅ Login successful');
        
        // Extract token from login response
        let token = null;
        if (loginData.token) {
            token = loginData.token;
        } else {
            console.log('❌ No token in login response');
            return;
        }
        
        // 2. Test /api/users/limits endpoint
        console.log('\n2️⃣ Testing /api/users/limits endpoint...');
        const { response: limitsResponse, data: limitsData } = await makeRequest(`${BASE_URL}/api/users/limits`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!limitsResponse.ok) {
            console.log('❌ Limits endpoint failed:', limitsData);
            return;
        }
        
        console.log('✅ Limits endpoint successful');
        console.log('📊 User Limits Data:', JSON.stringify(limitsData, null, 2));
        
        // 3. Test current tier information
        console.log('\n3️⃣ Analyzing tier information...');
        const { tier, limits, usage, support } = limitsData;
        
        console.log(`🎯 Current Tier: ${tier}`);
        console.log(`📋 Daily CV Limit: ${limits.dailyCVs === -1 ? 'Unlimited' : limits.dailyCVs}`);
        console.log(`📄 PDF Export: ${limits.pdfExport ? 'Allowed' : 'Not Allowed'}`);
        console.log(`📝 DOCX Export: ${limits.docxExport ? 'Allowed' : 'Not Allowed'}`);
        console.log(`🖼️ Images in CV: ${limits.imagesInCV ? 'Allowed' : 'Not Allowed'}`);
        console.log(`📞 Support Type: ${support.type}`);
        
        // 4. Test CV creation with limits
        console.log('\n4️⃣ Testing CV creation...');
        const cvData = {
            title: 'Test CV for Subscription',
            content: {
                personalInfo: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com'
                }
            },
            templateId: 'basic' // Free template
        };
        
        const { response: cvResponse, data: cvResponseData } = await makeRequest(`${BASE_URL}/api/cvs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cvData)
        });
        
        if (cvResponse.ok) {
            console.log('✅ CV creation successful');
            console.log('📝 Created CV ID:', cvResponseData.id);
        } else {
            console.log('❌ CV creation failed:', cvResponseData);
        }
        
        // 5. Check updated usage after CV creation
        console.log('\n5️⃣ Checking updated usage...');
        const { data: updatedLimitsData } = await makeRequest(`${BASE_URL}/api/users/limits`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Updated Usage:', JSON.stringify(updatedLimitsData.usage, null, 2));
        
        console.log('\n✅ Subscription Limits Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('📍 Stack:', error.stack);
    }
}

// Run the test
testSubscriptionLimits().catch(console.error);
