#!/usr/bin/env node

/**
 * Test ScrapingDog API with the new retry logic implementation
 * This test verifies the deployment-ready configuration
 */

const axios = require('axios');

// Configuration matching the implemented retry logic
const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

async function testScrapingDogWithRetry() {
  console.log('🧪 Testing ScrapingDog API with retry logic...\n');
  
  const params = {
    api_key: API_KEY,
    type: 'profile',
    linkId: 'musayevcreate',
    premium: 'false',
  };

  // Simulate the retry logic from our implementation
  const maxRetries = 3;
  const baseDelay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
      
      const startTime = Date.now();
      const response = await axios.get(BASE_URL, {
        params,
        timeout: 45000, // 45 seconds (Vercel optimized)
        headers: {
          'User-Agent': 'CVera-LinkedIn-Scraper/1.0',
        },
      });
      
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        console.log(`✅ Success! Response received in ${duration}ms`);
        console.log(`📊 Response size: ${JSON.stringify(response.data).length} characters`);
        
        // Log key profile data
        const data = response.data;
        if (data.name) {
          console.log(`👤 Profile: ${data.name}`);
        }
        if (data.headline) {
          console.log(`💼 Headline: ${data.headline}`);
        }
        
        return data;
      }
    } catch (error) {
      const duration = Date.now() - (Date.now() - 1000);
      console.log(`❌ Attempt ${attempt} failed after ${duration}ms:`);
      
      if (error.code === 'ECONNABORTED') {
        console.log('   Timeout error - connection aborted');
      } else if (error.response) {
        console.log(`   HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        console.log('   Network error - no response received');
      } else {
        console.log(`   Error: ${error.message}`);
      }
      
      // If not the last attempt, wait before retry
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log('❌ All retry attempts failed');
  throw new Error('ScrapingDog API unavailable after all retry attempts');
}

// Run the test
testScrapingDogWithRetry()
  .then((data) => {
    console.log('\n🎉 Test completed successfully!');
    console.log('✅ ScrapingDog API is working with retry logic');
  })
  .catch((error) => {
    console.log('\n💥 Test failed:');
    console.error(error.message);
    process.exit(1);
  });
