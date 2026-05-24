import pool from '../../config/db'

export const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM customers ORDER BY name ASC')
  return rows
}
export const create = async (data: { name: string; email?: string; phone?: string; address?: string; ci?: string }) => {
  const [result] = await pool.query(
    'INSERT INTO customers (name, email, phone, address, ci) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone, data.address, data.ci]
  )
  return { id: (result as any).insertId, ...data }
}
export const update = async (id: number, data: any) => {
  await pool.query('UPDATE customers SET ? WHERE id = ?', [data, id])
}
export const remove = async (id: number) => {
  await pool.query('DELETE FROM customers WHERE id = ?', [id])
}
