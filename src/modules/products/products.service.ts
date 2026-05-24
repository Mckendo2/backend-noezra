import pool from '../../config/db'

export const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.active = TRUE
     ORDER BY p.name ASC`
  )
  return rows
}

export const getById = async (id: number) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.active = TRUE`,
    [id]
  )
  return (rows as any[])[0] || null
}

export const create = async (data: {
  name: string; description?: string; price: number; cost: number;
  stock: number; min_stock: number; category_id?: number; barcode?: string; unit?: string; image_url?: string;
}) => {
  const [result] = await pool.query(
    `INSERT INTO products (name, description, price, cost, stock, min_stock, category_id, barcode, unit, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name, 
      data.description || null, 
      data.price, 
      data.cost,
      data.stock, 
      data.min_stock, 
      data.category_id || null, 
      data.barcode || null, 
      data.unit || 'unit', 
      data.image_url || null
    ]
  )
  return getById((result as any).insertId)
}

export const update = async (id: number, data: Partial<ReturnType<typeof create>>) => {
  await pool.query('UPDATE products SET ? WHERE id = ?', [data, id])
  return getById(id)
}

export const remove = async (id: number) => {
  // Eliminación Lógica
  await pool.query('UPDATE products SET active = FALSE WHERE id = ?', [id])
}
