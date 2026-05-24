const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'noezrabd',
  });

  try {
    const [rows] = await pool.query('SELECT id, name, email, role_id, active FROM users');
    console.log('--- USERS IN DATABASE ---');
    console.log(rows);
    console.log('-------------------------');
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
}

check();
