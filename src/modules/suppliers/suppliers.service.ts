import pool from '../../config/db'

export const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name ASC')
  return rows
}
export const create = async (data: { name: string; email?: string; phone?: string; address?: string; ruc?: string }) => {
  const [result] = await pool.query(
    'INSERT INTO suppliers (name, email, phone, address, ruc) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone, data.address, data.ruc]
  )
  return { id: (result as any).insertId, ...data }
}
export const update = async (id: number, data: any) => { await pool.query('UPDATE suppliers SET ? WHERE id = ?', [data, id]) }
export const remove = async (id: number) => { await pool.query('DELETE FROM suppliers WHERE id = ?', [id]) }
