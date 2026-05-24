import pool from '../../config/db'

/* ── helpers ───────────────────────────────────────────────────────────────── */
async function nextCode(): Promise<string> {
  const [rows] = await pool.query(
    "SELECT code FROM quotations ORDER BY id DESC LIMIT 1"
  )
  const last = (rows as any[])[0]?.code // COT-000001
  const num = last ? parseInt(last.replace('COT-', ''), 10) + 1 : 1
  return `COT-${String(num).padStart(6, '0')}`
}

/* ── getAll ─────────────────────────────────────────────────────────────── */
export const getAll = async (filters?: { status?: string; from?: string; to?: string }) => {
  let query = `
    SELECT q.*, u.name AS user_name, c.name AS customer_name, c.phone AS customer_phone
    FROM quotations q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN customers c ON q.customer_id = c.id
  `
  const conditions: string[] = []
  const params: any[] = []

  if (filters?.status) { conditions.push('q.status = ?'); params.push(filters.status) }
  if (filters?.from) { conditions.push('DATE(q.created_at) >= ?'); params.push(filters.from) }
  if (filters?.to) { conditions.push('DATE(q.created_at) <= ?'); params.push(filters.to) }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY q.created_at DESC'

  const [rows] = await pool.query(query, params)
  return rows
}

/* ── getById ────────────────────────────────────────────────────────────── */
export const getById = async (id: number) => {
  const [rows] = await pool.query(
    `SELECT q.*, u.name AS user_name, c.name AS customer_name, c.phone AS customer_phone, c.ci AS customer_ci, c.address AS customer_address
     FROM quotations q
     LEFT JOIN users u ON q.user_id = u.id
     LEFT JOIN customers c ON q.customer_id = c.id
     WHERE q.id = ?`,
    [id]
  )
  const quotation = (rows as any[])[0]
  if (!quotation) return null

  const [items] = await pool.query(
    `SELECT qi.*, p.name AS product_name
     FROM quotation_items qi
     JOIN products p ON qi.product_id = p.id
     WHERE qi.quotation_id = ?`,
    [id]
  )
  return { ...quotation, items }
}

/* ── create ─────────────────────────────────────────────────────────────── */
export const create = async (data: {
  user_id: number
  customer_id: number
  discount?: number
  valid_until: string
  notes?: string
  items: Array<{ product_id: number; quantity: number; unit_price: number }>
}) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const code = await nextCode()
    const subtotal = data.items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
    const discount = data.discount || 0
    const total = subtotal - discount

    const [result] = await conn.query(
      `INSERT INTO quotations (code, user_id, customer_id, subtotal, discount, total, valid_until, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, data.user_id, data.customer_id, subtotal, discount, total, data.valid_until, data.notes || null]
    )
    const quotationId = (result as any).insertId

    for (const item of data.items) {
      await conn.query(
        `INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [quotationId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      )
    }

    await conn.commit()
    return getById(quotationId)
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

/* ── update (solo pendientes) ──────────────────────────────────────────── */
export const update = async (id: number, data: {
  customer_id?: number
  discount?: number
  valid_until?: string
  notes?: string
  items?: Array<{ product_id: number; quantity: number; unit_price: number }>
}) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Verificar que está pendiente
    const [rows] = await conn.query('SELECT status FROM quotations WHERE id = ?', [id])
    const current = (rows as any[])[0]
    if (!current) throw new Error('Cotización no encontrada')
    if (current.status !== 'pending') throw new Error('Solo se pueden editar cotizaciones pendientes')

    // Si vienen items, recalcular
    if (data.items && data.items.length > 0) {
      await conn.query('DELETE FROM quotation_items WHERE quotation_id = ?', [id])
      const subtotal = data.items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
      const discount = data.discount ?? 0
      const total = subtotal - discount

      await conn.query(
        `UPDATE quotations SET customer_id = COALESCE(?, customer_id), subtotal = ?, discount = ?, total = ?,
         valid_until = COALESCE(?, valid_until), notes = COALESCE(?, notes) WHERE id = ?`,
        [data.customer_id, subtotal, discount, total, data.valid_until, data.notes, id]
      )

      for (const item of data.items) {
        await conn.query(
          `INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
        )
      }
    } else {
      // Solo actualizar campos de cabecera
      await conn.query(
        `UPDATE quotations SET customer_id = COALESCE(?, customer_id),
         valid_until = COALESCE(?, valid_until), notes = COALESCE(?, notes),
         discount = COALESCE(?, discount) WHERE id = ?`,
        [data.customer_id, data.valid_until, data.notes, data.discount, id]
      )
    }

    await conn.commit()
    return getById(id)
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

/* ── updateStatus ──────────────────────────────────────────────────────── */
export const updateStatus = async (id: number, status: string) => {
  await pool.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id])
  return getById(id)
}

/* ── convertToSale ─────────────────────────────────────────────────────── */
export const convertToSale = async (id: number, paymentData: {
  user_id: number
  payment_method: string
  discount?: number
}) => {
  const quotation = await getById(id)
  if (!quotation) throw new Error('Cotización no encontrada')
  if (quotation.status !== 'pending') throw new Error('Solo se pueden convertir cotizaciones pendientes')

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const items = quotation.items as Array<{ product_id: number; quantity: number; unit_price: number }>
    const subtotal = items.reduce((acc: number, i: any) => acc + Number(i.quantity) * Number(i.unit_price), 0)
    const discount = paymentData.discount ?? Number(quotation.discount) ?? 0
    const total = subtotal - discount

    // Crear la venta
    const [saleResult] = await conn.query(
      'INSERT INTO sales (user_id, customer_id, total, payment_method) VALUES (?, ?, ?, ?)',
      [paymentData.user_id, quotation.customer_id, total, paymentData.payment_method]
    )
    const saleId = (saleResult as any).insertId

    // Insertar items y descontar stock
    for (const item of items) {
      await conn.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, Number(item.unit_price), Number(item.quantity) * Number(item.unit_price)]
      )
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id])
    }

    // Marcar cotización como aprobada y vincular la venta
    await conn.query('UPDATE quotations SET status = ?, sale_id = ? WHERE id = ?', ['approved', saleId, id])

    await conn.commit()
    return { quotation_id: id, sale_id: saleId, total }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
