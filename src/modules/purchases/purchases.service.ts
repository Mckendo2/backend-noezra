import pool from '../../config/db'

export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT pu.*, s.name AS supplier_name, u.name AS user_name
    FROM purchases pu
    LEFT JOIN suppliers s ON pu.supplier_id = s.id
    LEFT JOIN users u ON pu.user_id = u.id
    ORDER BY pu.created_at DESC`)
  return rows
}

export const create = async (data: {
  user_id: number; supplier_id: number; notes?: string;
  items: Array<{ product_id: number; quantity: number; unit_cost: number; selling_price?: number }>
}) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const total = data.items.reduce((acc, i) => acc + i.quantity * i.unit_cost, 0)
    const [result] = await conn.query(
      'INSERT INTO purchases (user_id, supplier_id, total, notes) VALUES (?, ?, ?, ?)',
      [data.user_id, data.supplier_id, total, data.notes]
    )
    const purchaseId = (result as any).insertId
    for (const item of data.items) {
      await conn.query(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, subtotal) VALUES (?, ?, ?, ?, ?)',
        [purchaseId, item.product_id, item.quantity, item.unit_cost, item.quantity * item.unit_cost]
      )
      
      if (item.selling_price !== undefined) {
        await conn.query(
          'UPDATE products SET stock = stock + ?, cost = ?, price = ? WHERE id = ?', 
          [item.quantity, item.unit_cost, item.selling_price, item.product_id]
        )
      } else {
        await conn.query(
          'UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?', 
          [item.quantity, item.unit_cost, item.product_id]
        )
      }
    }
    await conn.commit()
    return { id: purchaseId, total }
  } catch (err) {
    await conn.rollback(); throw err
  } finally {
    conn.release()
  }
}
