import pool from '../../config/db'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'
export type SystemModule =
  | 'dashboard' | 'sales' | 'quotations' | 'products' | 'categories'
  | 'customers' | 'suppliers' | 'purchases' | 'expenses' | 'credits' | 'reports' | 'users'

export type RolePermissions = {
  [module in SystemModule]?: {
    [action in PermissionAction]?: boolean
  }
}

// Default permissions per role (used as fallback if not in DB)
const DEFAULTS: Record<number, RolePermissions> = {
  2: { // cashier
    dashboard: { view: true },
    sales:     { view: true, create: true, edit: false, delete: false },
    quotations:{ view: true, create: true, edit: true, delete: false },
    products:  { view: true, create: false, edit: false, delete: false },
    categories:{ view: true, create: false, edit: false, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    suppliers: { view: false, create: false, edit: false, delete: false },
    purchases: { view: false, create: false, edit: false, delete: false },
    expenses:  { view: false, create: false, edit: false, delete: false },
    credits:   { view: true, create: true, edit: true, delete: false },
    reports:   { view: false, create: false, edit: false, delete: false },
    users:     { view: false, create: false, edit: false, delete: false },
  },
  3: { // warehouse
    dashboard: { view: true },
    sales:     { view: true, create: false, edit: false, delete: false },
    quotations:{ view: false, create: false, edit: false, delete: false },
    products:  { view: true, create: true, edit: true, delete: false },
    categories:{ view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: true, create: true, edit: true, delete: false },
    purchases: { view: true, create: true, edit: true, delete: false },
    expenses:  { view: true, create: true, edit: true, delete: false },
    credits:   { view: false, create: false, edit: false, delete: false },
    reports:   { view: true, create: false, edit: false, delete: false },
    users:     { view: false, create: false, edit: false, delete: false },
  },
}

export const getAllPermissions = async (): Promise<Record<number, RolePermissions>> => {
  const [rows] = await pool.query('SELECT * FROM role_permissions')
  const dbRows = rows as any[]

  // Start with defaults, override with DB values
  const result: Record<number, RolePermissions> = {
    2: { ...DEFAULTS[2] },
    3: { ...DEFAULTS[3] },
  }

  for (const row of dbRows) {
    const { role_id, module, can_view, can_create, can_edit, can_delete } = row
    if (!result[role_id]) result[role_id] = {}
    result[role_id][module as SystemModule] = {
      view:   Boolean(can_view),
      create: Boolean(can_create),
      edit:   Boolean(can_edit),
      delete: Boolean(can_delete),
    }
  }

  return result
}

export const updateRolePermissions = async (role_id: number, permissions: RolePermissions) => {
  if (role_id === 1) throw new Error('No se pueden modificar los permisos del administrador')

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Delete existing permissions for this role
    await conn.query('DELETE FROM role_permissions WHERE role_id = ?', [role_id])

    // Insert new permissions
    for (const [module, actions] of Object.entries(permissions)) {
      await conn.query(
        `INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          role_id,
          module,
          actions?.view ? 1 : 0,
          actions?.create ? 1 : 0,
          actions?.edit ? 1 : 0,
          actions?.delete ? 1 : 0,
        ]
      )
    }

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
