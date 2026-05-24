import pool from '../../config/db'

export async function getAllCreditsWithBalance() {
  const [rows] = await pool.query(`
    SELECT c.id, c.sale_id, c.customer_id, cu.name as customer_name, c.total_amount, c.balance, c.status, c.created_at
    FROM credits c
    JOIN customers cu ON c.customer_id = cu.id
    WHERE c.status = 'pending' OR c.balance > 0
    ORDER BY c.created_at DESC
  `)
  return rows
}

export async function getCreditDetail(creditId: number) {
  const [rows] = await pool.query(
    `SELECT c.*, cu.name as customer_name FROM credits c JOIN customers cu ON c.customer_id = cu.id WHERE c.id = ?`,
    [creditId]
  )
  const credit = (rows as any[])[0]
  const [payments] = await pool.query(
    `SELECT * FROM credit_payments WHERE credit_id = ? ORDER BY payment_date ASC`,
    [creditId]
  )
  return { ...credit, payments }
}

export async function addPayment(creditId: number, amount: number, notes?: string) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(
      'INSERT INTO credit_payments (credit_id, amount, notes) VALUES (?, ?, ?)',
      [creditId, amount, notes || null]
    )
    await conn.query(
      'UPDATE credits SET balance = balance - ? WHERE id = ?',
      [amount, creditId]
    )
    await conn.query(
      "UPDATE credits SET status = 'paid' WHERE id = ? AND balance <= 0", [creditId])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
