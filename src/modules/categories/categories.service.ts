import pool from '../../config/db'

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE active = TRUE ORDER BY name ASC')
  return rows
}
export const create = async (data: { name: string; description?: string }) => {
  const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [data.name, data.description || null])
  return { id: (result as any).insertId, ...data }
}
export const update = async (id: number, data: { name?: string; description?: string }) => {
  await pool.query('UPDATE categories SET ? WHERE id = ?', [data, id])
}
export const remove = async (id: number) => {
  await pool.query('UPDATE categories SET active = FALSE WHERE id = ?', [id])
}
