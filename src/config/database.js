const { Pool } = require('pg');
require('dotenv').config();

// Folosește DATABASE_URL dacă există, altfel parametrii individuali
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false  // Necesar pentru Neon în producție
    }
  })
});

// Testează conexiunea la pornire
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = pool;