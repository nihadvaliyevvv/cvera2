const { Client } = require('pg');

async function testDatabaseCreation() {
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

  try {
    console.log('🔗 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Check if cvera database exists
    const dbResult = await client.query(`SELECT 1 FROM pg_database WHERE datname='cvera'`);
    if (dbResult.rows.length === 0) {
      console.log('📦 Creating cvera database...');
      await client.query('CREATE DATABASE cvera');
      console.log('✅ Database cvera created successfully!');
    } else {
      console.log('📦 Database cvera already exists');
    }
    
    // List all databases
    const databases = await client.query('SELECT datname FROM pg_database');
    console.log('📋 Available databases:', databases.rows.map(row => row.datname));
    
    await client.end();
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    await client.end();
  }
}

testDatabaseCreation();
