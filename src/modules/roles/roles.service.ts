import pool from '../../config/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface Role {
  id: number
  name: string
  description?: string
  is_custom: boolean
  created_at?: string
}

export const getAllRoles = async (): Promise<Role[]> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles ORDER BY is_custom ASC, name ASC')
  return rows as Role[]
}

export const getRoleById = async (id: number): Promise<Role | null> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles WHERE id = ?', [id])
  if (rows.length === 0) return null
  return rows[0] as Role
}

export const createRole = async (data: { name: string; description?: string }): Promise<void> => {
  // Solo se pueden crear roles is_custom = true desde la API
  await pool.query(
    'INSERT INTO roles (name, description, is_custom) VALUES (?, ?, true)',
    [data.name, data.description || null]
  )
}

export const updateRole = async (id: number, data: { name?: string; description?: string }): Promise<void> => {
  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description)
  }

  if (updates.length === 0) return

  values.push(id)
  await pool.query(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, values)
}

export const deleteRole = async (id: number): Promise<void> => {
  // Evitar borrar roles que tienen usuarios
  const [users] = await pool.query<RowDataPacket[]>('SELECT count(*) as count FROM users WHERE role_id = ?', [id])
  if (users[0].count > 0) {
    throw new Error('No se puede eliminar el rol porque hay usuarios asignados a él.')
  }
  
  await pool.query('DELETE FROM roles WHERE id = ? AND is_custom = true', [id])
}
