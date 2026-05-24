import app from './src/app'
import pool from './src/config/db'

const PORT = process.env.PORT || 3000

async function bootstrap() {
  try {
    // Verify DB connection
    const conn = await pool.getConnection()
    console.log('✅ MySQL connected successfully')
    conn.release()

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    process.exit(1)
  }
}

bootstrap()
