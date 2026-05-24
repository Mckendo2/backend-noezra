const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_system'
  });
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log('1. Starting migration...');

    // Find and drop FKs in users
    const [userFks] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    for (let fk of userFks) {
      await connection.query(`ALTER TABLE users DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
      console.log(`Dropped FK ${fk.CONSTRAINT_NAME} from users`);
    }

    // Find and drop FKs in role_permissions
    const [rpFks] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_permissions' AND COLUMN_NAME = 'role' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    for (let fk of rpFks) {
      await connection.query(`ALTER TABLE role_permissions DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
      console.log(`Dropped FK ${fk.CONSTRAINT_NAME} from role_permissions`);
    }

    console.log('2. Altering tables...');
    // Drop unique key from role_permissions if exists
    try {
      await connection.query(`ALTER TABLE role_permissions DROP INDEX uq_role_module`);
    } catch (e) { /* might not exist */ }

    // Add new_id to roles
    await connection.query(`ALTER TABLE roles ADD COLUMN new_id INT UNSIGNED AUTO_INCREMENT UNIQUE FIRST`);
    
    // Add role_id to others
    await connection.query(`ALTER TABLE users ADD COLUMN role_id INT UNSIGNED AFTER password`);
    await connection.query(`ALTER TABLE role_permissions ADD COLUMN role_id INT UNSIGNED AFTER id`);

    console.log('3. Updating data...');
    await connection.query(`UPDATE users u JOIN roles r ON u.role = r.id SET u.role_id = r.new_id`);
    await connection.query(`UPDATE role_permissions rp JOIN roles r ON rp.role = r.id SET rp.role_id = r.new_id`);

    console.log('4. Dropping old columns & restructuring...');
    await connection.query(`ALTER TABLE users DROP COLUMN role`);
    await connection.query(`ALTER TABLE role_permissions DROP COLUMN role`);
    
    // Remove old PK from roles
    await connection.query(`ALTER TABLE roles DROP PRIMARY KEY`);
    await connection.query(`ALTER TABLE roles DROP COLUMN id`);
    
    // Rename new_id to id and make it PK
    await connection.query(`ALTER TABLE roles RENAME COLUMN new_id TO id`);
    await connection.query(`ALTER TABLE roles ADD PRIMARY KEY (id)`);

    console.log('5. Re-adding Foreign Keys & constraints...');
    await connection.query(`ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT`);
    await connection.query(`ALTER TABLE role_permissions ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE`);
    await connection.query(`ALTER TABLE role_permissions ADD UNIQUE KEY uq_role_module (role_id, module)`);

    // Ensure admin is ID 1 if possible, though AUTO_INCREMENT just gave them numbers.
    // We will just let them have whatever numbers they got.
    
    await connection.commit();
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration failed:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

run();
