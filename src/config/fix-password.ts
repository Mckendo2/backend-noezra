import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function execute() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'noezrabd'
  })

  // Hash generated just now for 'admin123'
  const newHash = '$2b$10$smzjuyFwMp3hDRqu2ffqRe1ksJWEHT8palZdZmHamA7iBCT7GAG3a';

  try {
    await connection.query('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@pos.com'])
    console.log('✅ Contraseña del administrador reseteada a admin123 con éxito')
  } catch (error: any) {
    console.error('❌ Error:', error)
  }

  await connection.end()
}

execute()
