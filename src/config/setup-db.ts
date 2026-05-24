import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function setupDatabase() {
  console.log('⏳ Iniciando importación de schema.sql...')
  try {
    // Connect without DB name first to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    })

    const dbName = process.env.DB_NAME || 'pos_importadora';
    console.log(`📡 Creando/Verificando base de datos: ${dbName}...`)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);


    const schemaPath = path.join(__dirname, '../../schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')

    console.log('📡 Ejecutando queries...')
    await connection.query(sql)
    console.log('✅ Base de datos importada correctamente')
    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error al importar la base de datos:', error)
    process.exit(1)
  }
}

setupDatabase()
