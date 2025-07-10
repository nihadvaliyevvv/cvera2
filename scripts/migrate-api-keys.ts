import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function migrateEnvKeysToDatabase() {
  console.log('Starting migration of environment API keys to database...');
  
  // Get API keys from environment
  const envKeys = [
    process.env.RAPIDAPI_KEY_1,
    process.env.RAPIDAPI_KEY_2,
    process.env.RAPIDAPI_KEY_3,
    process.env.RAPIDAPI_KEY_4,
    process.env.RAPIDAPI_KEY_5,
  ].filter(key => key && key.trim().length > 0);
  
  console.log(`Found ${envKeys.length} API keys in environment`);
  console.log('Keys:', envKeys.map(k => k?.substring(0, 10) + '...'));
  
  // Check existing keys in database
  const existingKeys = await prisma.apiKey.findMany({
    select: { key: true }
  });
  
  const existingKeyStrings = existingKeys.map(k => k.key);
  
  // Add new keys to database
  let addedCount = 0;
  for (const [index, keyValue] of envKeys.entries()) {
    if (!existingKeyStrings.includes(keyValue!)) {
      try {
        await prisma.apiKey.create({
          data: {
            name: `LinkedIn API Key ${index + 1}`,
            key: keyValue!,
            service: 'linkedin',
            active: true,
            priority: index + 1,
          }
        });
        
        console.log(`✓ Added: LinkedIn API Key ${index + 1}`);
        addedCount++;
      } catch (error) {
        console.error(`✗ Failed to add LinkedIn API Key ${index + 1}:`, error);
      }
    } else {
      console.log(`- Skipped: LinkedIn API Key ${index + 1} (already exists)`);
    }
  }
  
  console.log(`Migration completed! Added ${addedCount} new API keys.`);
  
  // Show current database state
  const allKeys = await prisma.apiKey.findMany({
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      createdAt: true
    },
    orderBy: { priority: 'asc' }
  });
  
  console.log('\nCurrent API keys in database:');
  allKeys.forEach((key, index) => {
    console.log(`${index + 1}. ${key.name} - ${key.key.substring(0, 20)}... (${key.active ? 'Active' : 'Inactive'})`);
  });
}

migrateEnvKeysToDatabase()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
