import dotenv from 'dotenv'
dotenv.config()
import mysql from 'mysql2/promise'

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_importadora',
  })

  try {
    console.log('Iniciando migración a roles dinámicos...')

    // 1. Crear tabla roles
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id          VARCHAR(50) PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        is_custom   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla roles creada')

    // 2. Insertar roles semilla
    await connection.execute(`
      INSERT IGNORE INTO roles (id, name, description, is_custom) VALUES
      ('admin', 'Administrador', 'Acceso total al sistema', false),
      ('cashier', 'Cajero', 'Acceso a ventas y clientes', false),
      ('warehouse', 'Almacén', 'Acceso a inventario y productos', false)
    `)
    console.log('✅ Roles semilla insertados')

    // 3. Modificar columnas de ENUM a VARCHAR
    await connection.execute(`
      ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'cashier'
    `)
    await connection.execute(`
      ALTER TABLE role_permissions MODIFY COLUMN role VARCHAR(50) NOT NULL
    `)
    console.log('✅ Columnas migradas a VARCHAR(50)')

    // 4. Agregar Foriegn Keys (ignorando si ya existen)
    // Para users -> roles
    try {
      await connection.execute(`
        ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role) REFERENCES roles(id)
      `)
      console.log('✅ FK en users creada')
    } catch (e: any) {
      if (e.code !== 'ER_DUP_KEYNAME') console.error('Error al crear FK en users:', e.message)
    }

    // Para role_permissions -> roles (CON CASCADE DELETE para limpiar permisos si se borra el rol)
    try {
      await connection.execute(`
        ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role) REFERENCES roles(id) ON DELETE CASCADE
      `)
      console.log('✅ FK en role_permissions creada')
    } catch (e: any) {
      if (e.code !== 'ER_DUP_KEYNAME') console.error('Error al crear FK en role_permissions:', e.message)
    }

    console.log('🎉 Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error en migración:', error)
  } finally {
    await connection.end()
  }
}

migrate()
