import pool from './src/config/db'

async function check() {
  const [purchases] = await pool.query('SELECT * FROM purchases ORDER BY id DESC LIMIT 1')
  console.log('Last purchase:', purchases)
  
  const [items] = await pool.query('SELECT * FROM purchase_items ORDER BY id DESC LIMIT 5')
  console.log('Last purchase items:', items)

  const [products] = await pool.query('SELECT id, name, stock, cost, price FROM products LIMIT 5')
  console.log('Products:', products)

  process.exit(0)
}

check()
