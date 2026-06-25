// test-db-direct.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('📋 Testing database connection...');
console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testDb() {
  try {
    console.log('📋 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Verifică tabelele
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tables in database:', tables.rows.map(r => r.table_name));
    
    // Verifică utilizatorii
    const users = await client.query('SELECT * FROM users');
    console.log('📋 Users in database:', users.rows.length);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('❌ Full error:', err);
  }
}

testDb();