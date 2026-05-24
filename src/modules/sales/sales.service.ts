import pool from '../../config/db'

export const getAll = async (filters?: { from?: string; to?: string }) => {
  let query = `
    SELECT s.*, u.name AS cashier_name, c.name AS customer_name
    FROM sales s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
  `
  const params: any[] = []
  if (filters?.from) { query += ' WHERE DATE(s.created_at) >= ?'; params.push(filters.from) }
  if (filters?.to) { query += params.length ? ' AND' : ' WHERE'; query += ' DATE(s.created_at) <= ?'; params.push(filters.to) }
  query += ' ORDER BY s.created_at DESC'
  const [rows] = await pool.query(query, params)
  return rows
}

export const getById = async (id: number) => {
  const [rows] = await pool.query(
    `SELECT s.*, u.name AS cashier_name FROM sales s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [id]
  )
  const sale = (rows as any[])[0]
  if (!sale) return null
  const [items] = await pool.query(
    `SELECT si.*, p.name AS product_name FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?`,
    [id]
  )
  return { ...sale, items }
}

export const create = async (data: {
  user_id: number; customer_id?: number; payment_method: string; discount?: number;
  initial_payment?: number;
  items: Array<{ product_id: number; quantity: number; unit_price: number }>
}) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const subtotal = data.items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
    const discount = data.discount || 0
    const total = subtotal - discount
    const [saleResult] = await conn.query(
      'INSERT INTO sales (user_id, customer_id, total, discount, payment_method) VALUES (?, ?, ?, ?, ?)',
      [data.user_id, data.customer_id, total, discount, data.payment_method]
    )
    const saleId = (saleResult as any).insertId
    for (const item of data.items) {
      await conn.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      )
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id])
    }

    if (data.payment_method === 'credit' || data.payment_method === 'Crédito') {
      if (!data.customer_id) {
        throw new Error('Venta a crédito requiere un cliente')
      }
      const initialPayment = data.initial_payment || 0;
      const balance = total - initialPayment;

      const [creditResult] = await conn.query(
        'INSERT INTO credits (sale_id, customer_id, total_amount, balance) VALUES (?, ?, ?, ?)',
        [saleId, data.customer_id, total, balance]
      )

      if (initialPayment > 0) {
        const creditId = (creditResult as any).insertId;
        await conn.query(
          'INSERT INTO credit_payments (credit_id, amount, notes) VALUES (?, ?, ?)',
          [creditId, initialPayment, 'Pago inicial de la venta']
        );
      }
    }

    await conn.commit()
    return getById(saleId)
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
