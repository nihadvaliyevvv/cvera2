const { Client } = require('pg');

const client = new Client({
  host: 'cvera.postgres.database.azure.com',
  port: 5432,
  user: 'admincvera',
  password: 'ilqarilqar1M@',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔗 Connecting to Azure PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version();');
    console.log('📊 Database version:', result.rows[0].version);
    
    await client.end();
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
