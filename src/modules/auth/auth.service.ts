import pool from '../../config/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (email: string, password: string) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  const users = rows as any[]
  if (!users.length) throw new Error('Invalid credentials')
  const user = users[0]
  if (!user.active) throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.')
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Credenciales inválidas')
  const token = jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '8h' }
  )
  const { password: _pw, ...safeUser } = user
  return { token, user: safeUser }
}

export const register = async (data: {
  name: string; email: string; phone?: string; ci?: string; password: string; role_id?: number
}) => {
  const hashed = await bcrypt.hash(data.password, 10)
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, ci, password, role_id) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone || null, data.ci || null, hashed, data.role_id || 2]
  )
  return { id: (result as any).insertId, email: data.email }
}
