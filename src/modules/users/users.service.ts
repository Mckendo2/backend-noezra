import pool from '../../config/db'
import bcrypt from 'bcryptjs'

export const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, ci, role_id, active, created_at, updated_at FROM users ORDER BY created_at DESC'
  )
  return rows
}

export const getById = async (id: number) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, ci, role_id, active, created_at, updated_at FROM users WHERE id = ?',
    [id]
  )
  const users = rows as any[]
  return users[0] || null
}

export const create = async (data: {
  name: string
  email: string
  phone?: string
  ci?: string
  password: string
  role_id: number
}) => {
  // Check email uniqueness
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [data.email])
  if ((existing as any[]).length > 0) throw new Error('El correo ya está en uso')

  const hashed = await bcrypt.hash(data.password, 10)
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, ci, password, role_id) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone || null, data.ci || null, hashed, data.role_id]
  )
  return { id: (result as any).insertId }
}

export const update = async (
  id: number,
  data: { name?: string; email?: string; phone?: string; ci?: string; password?: string; role_id?: number; active?: boolean }
) => {
  // Check email uniqueness if changing email
  if (data.email) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [data.email, id])
    if ((existing as any[]).length > 0) throw new Error('El correo ya está en uso')
  }

  const fields: string[] = []
  const values: any[] = []

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email) }
  if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone) }
  if (data.ci !== undefined) { fields.push('ci = ?'); values.push(data.ci) }
  if (data.password !== undefined) {
    const hashed = await bcrypt.hash(data.password, 10)
    fields.push('password = ?')
    values.push(hashed)
  }
  if (data.role_id !== undefined) { fields.push('role_id = ?'); values.push(data.role_id) }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0) }

  if (fields.length === 0) throw new Error('No hay datos para actualizar')

  values.push(id)
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
  return getById(id)
}

export const updatePassword = async (id: number, current: string, next: string) => {
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [id])
  const users = rows as any[]
  if (users.length === 0) throw new Error('Usuario no encontrado')

  const match = await bcrypt.compare(current, users[0].password)
  if (!match) throw new Error('La contraseña actual es incorrecta')

  const hashed = await bcrypt.hash(next, 10)
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id])
}

export const toggleActive = async (id: number) => {
  await pool.query('UPDATE users SET active = NOT active WHERE id = ?', [id])
  return getById(id)
}

export const remove = async (id: number) => {
  await pool.query('DELETE FROM users WHERE id = ?', [id])
}
