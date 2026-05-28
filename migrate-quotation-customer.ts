import pool from './src/config/db'

async function run() {
  try {
    console.log('Migrating quotations table to allow NULL customer_id...')
    
    // Check if we can just alter the column
    await pool.query('ALTER TABLE quotations MODIFY customer_id INT UNSIGNED NULL;')
    console.log('Successfully altered column.')

    // Drop the old constraint if necessary, but just changing to NULL might be enough. 
    // Usually MySQL doesn't require dropping the FK just to change NULLability unless it conflicts.

    console.log('Migration complete.')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

run()
