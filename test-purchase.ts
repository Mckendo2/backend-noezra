import pool from './src/config/db'
import * as S from './src/modules/purchases/purchases.service'

async function run() {
  const payload = {
    user_id: 1,
    supplier_id: 1,
    notes: 'Test purchase',
    items: [
      { product_id: 1, quantity: 1, unit_cost: 99.99, selling_price: 150.00 }
    ]
  }
  
  console.log('Running purchase create with payload:', payload)
  await S.create(payload)
  
  const [products] = await pool.query('SELECT id, name, stock, cost, price FROM products WHERE id = 1')
  console.log('Product 1 after purchase:', products)
  
  process.exit(0)
}

run()
