import pool from './src/config/db'

async function migrate() {
  try {
    console.log('Adding phone and ci columns to users...')
    await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(30) AFTER email')
    await pool.query('ALTER TABLE users ADD COLUMN ci VARCHAR(20) AFTER phone')
    console.log('Migration complete.')
  } catch (err: any) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.')
    } else {
      console.error('Migration failed:', err)
    }
  } finally {
    process.exit(0)
  }
}

migrate()
