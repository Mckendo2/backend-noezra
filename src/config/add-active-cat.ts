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

  try {
    await connection.query('ALTER TABLE categories ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;')
    console.log('✅ Column active added to categories')
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column active already exists.')
    } else {
      console.error('❌ Error:', error)
    }
  }

  await connection.end()
}

execute()
