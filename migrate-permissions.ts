import pool from './src/config/db'
import dotenv from 'dotenv'
dotenv.config()

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        role       ENUM('cashier','warehouse') NOT NULL,
        module     VARCHAR(50) NOT NULL,
        can_view   BOOLEAN NOT NULL DEFAULT FALSE,
        can_create BOOLEAN NOT NULL DEFAULT FALSE,
        can_edit   BOOLEAN NOT NULL DEFAULT FALSE,
        can_delete BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_role_module (role, module)
      )
    `)
    console.log('✅ Table role_permissions created')

    const seeds: [string, string, number, number, number, number][] = [
      ['cashier','dashboard',1,0,0,0],['cashier','sales',1,1,0,0],
      ['cashier','quotations',1,1,1,0],['cashier','products',1,0,0,0],
      ['cashier','categories',1,0,0,0],['cashier','customers',1,1,1,0],
      ['cashier','suppliers',0,0,0,0],['cashier','purchases',0,0,0,0],
      ['cashier','expenses',0,0,0,0],['cashier','credits',1,1,1,0],
      ['cashier','reports',0,0,0,0],['cashier','users',0,0,0,0],
      ['warehouse','dashboard',1,0,0,0],['warehouse','sales',1,0,0,0],
      ['warehouse','quotations',0,0,0,0],['warehouse','products',1,1,1,0],
      ['warehouse','categories',1,1,1,0],['warehouse','customers',1,0,0,0],
      ['warehouse','suppliers',1,1,1,0],['warehouse','purchases',1,1,1,0],
      ['warehouse','expenses',1,1,1,0],['warehouse','credits',0,0,0,0],
      ['warehouse','reports',1,0,0,0],['warehouse','users',0,0,0,0],
    ]

    for (const row of seeds) {
      await pool.query(
        'INSERT IGNORE INTO role_permissions (role,module,can_view,can_create,can_edit,can_delete) VALUES (?,?,?,?,?,?)',
        row
      )
    }
    console.log('✅ Permissions seeded successfully')
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  }
}

migrate()
