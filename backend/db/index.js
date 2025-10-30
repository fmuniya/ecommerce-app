/* const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool; */


const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Check if DATABASE_URL exists (for Render)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // this is for Render's managed SSL
    },
  });
  console.log('Using Render PostgreSQL connection');
} else {
  // Fallback for local development
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  console.log(' Using local PostgreSQL connection');
}

// Log when connected successfully
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

// Log any connection errors
pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

module.exports = pool;

