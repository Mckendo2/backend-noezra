import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function execute() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_importadora'
  })

  try {
    await connection.query('ALTER TABLE products ADD COLUMN image_url VARCHAR(255) NULL;')
    console.log('✅ Columna image_url agregada correctamente a products')
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ La columna image_url ya existe')
    } else {
      console.error('❌ Error:', error)
    }
  }

  await connection.end()
}

execute()
