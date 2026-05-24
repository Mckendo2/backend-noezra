import pool from '../../config/db'

export const getAll = async (filters?: { from?: string; to?: string; category?: string }) => {
  let query = `
    SELECT e.*, u.name AS user_name
    FROM expenses e
    JOIN users u ON e.user_id = u.id
  `
  const params: any[] = []
  const conditions: string[] = []

  if (filters?.from) {
    conditions.push('e.date >= ?')
    params.push(filters.from)
  }
  if (filters?.to) {
    conditions.push('e.date <= ?')
    params.push(filters.to)
  }
  if (filters?.category && filters.category !== 'all') {
    conditions.push('e.category = ?')
    params.push(filters.category)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY e.date DESC, e.created_at DESC'

  const [rows] = await pool.query(query, params)
  return rows
}

export const getById = async (id: number) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS user_name FROM expenses e JOIN users u ON e.user_id = u.id WHERE e.id = ?`,
    [id]
  )
  return (rows as any[])[0] || null
}

export const create = async (data: {
  user_id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}) => {
  const [result] = await pool.query(
    'INSERT INTO expenses (user_id, category, amount, description, date) VALUES (?, ?, ?, ?, ?)',
    [data.user_id, data.category, data.amount, data.description || null, data.date]
  )
  return getById((result as any).insertId)
}

export const update = async (id: number, data: {
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
}) => {
  await pool.query('UPDATE expenses SET ? WHERE id = ?', [data, id])
  return getById(id)
}

export const remove = async (id: number) => {
  await pool.query('DELETE FROM expenses WHERE id = ?', [id])
}
