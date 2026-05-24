import pool from '../../config/db'

export const getDashboard = async (startDate?: string, endDate?: string) => {
  // If no dates provided, default to current month's first and last day
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const from = startDate || firstDay;
  const to = endDate || lastDay;

  const [[salesToday]] = await pool.query(`
    SELECT COALESCE(SUM(total),0) AS sales_today, COUNT(*) AS tx_today
    FROM sales WHERE DATE(created_at) = CURDATE()`) as any

  const [[salesPeriod]] = await pool.query(`
    SELECT COALESCE(SUM(total),0) AS sales_period FROM sales
    WHERE DATE(created_at) BETWEEN ? AND ?`, [from, to]) as any

  const [[lowStock]] = await pool.query(`
    SELECT COUNT(*) AS low_stock FROM products WHERE stock <= min_stock`) as any

  const [topProducts] = await pool.query(`
    SELECT p.name, SUM(si.quantity) AS qty_sold, SUM(si.subtotal) AS revenue
    FROM sale_items si JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    GROUP BY p.id ORDER BY qty_sold DESC LIMIT 5`, [from, to]) as any

  const [salesByDay] = await pool.query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total) as total
    FROM sales 
    WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
    ORDER BY date ASC`, [from, to]) as any

  const [salesByPaymentMethod] = await pool.query(`
    SELECT payment_method, SUM(total) as total
    FROM sales
    WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY payment_method
  `, [from, to]) as any

  const [salesByCategory] = await pool.query(`
    SELECT c.name as category, SUM(si.subtotal) as total
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    GROUP BY c.id
    ORDER BY total DESC
  `, [from, to]) as any

  const [expensesByDay] = await pool.query(`
    SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(amount) as total
    FROM expenses
    WHERE date BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
    ORDER BY date ASC
  `, [from, to]) as any

  return { 
    salesToday, 
    salesMonth: { sales_month: salesPeriod.sales_period }, 
    lowStock, 
    topProducts, 
    salesByDay,
    salesByPaymentMethod,
    salesByCategory,
    expensesByDay
  }
}

export const getSalesByPeriod = async (from: string, to: string) => {
  const [rows] = await pool.query(`
    SELECT DATE(created_at) AS date, SUM(total) AS total, COUNT(*) AS transactions
    FROM sales WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at) ORDER BY date ASC`, [from, to])
  return rows
}

const getDefaultDates = (startDate?: string, endDate?: string) => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  return [startDate || firstDay, endDate || lastDay];
}

export const getProfitsReport = async (startDate?: string, endDate?: string) => {
  const [from, to] = getDefaultDates(startDate, endDate);
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(s.created_at, '%Y-%m-%d') as date,
      SUM(si.subtotal) as revenue,
      SUM(si.quantity * p.cost) as cost,
      SUM(si.subtotal) - SUM(si.quantity * p.cost) as profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(s.created_at, '%Y-%m-%d')
    ORDER BY date ASC
  `, [from, to])
  
  const [[totals]] = await pool.query(`
    SELECT 
      SUM(si.subtotal) as total_revenue,
      SUM(si.quantity * p.cost) as total_cost,
      SUM(si.subtotal) - SUM(si.quantity * p.cost) as total_profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
  `, [from, to]) as any

  // Get total expenses in period
  const [[expenses]] = await pool.query(`
    SELECT SUM(amount) as total_expenses
    FROM expenses
    WHERE date BETWEEN ? AND ?
  `, [from, to]) as any

  return { 
    daily: rows, 
    summary: {
      revenue: totals?.total_revenue || 0,
      cost: totals?.total_cost || 0,
      gross_profit: totals?.total_profit || 0,
      expenses: expenses?.total_expenses || 0,
      net_profit: (totals?.total_profit || 0) - (expenses?.total_expenses || 0)
    }
  }
}

export const getInventoryReport = async () => {
  const [products] = await pool.query(`
    SELECT 
      id, name, stock, min_stock, price, cost,
      (stock * cost) as total_value
    FROM products
    WHERE active = 1
    ORDER BY stock ASC
  `)
  
  const [[summary]] = await pool.query(`
    SELECT 
      SUM(stock * cost) as total_inventory_value,
      SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as low_stock_items
    FROM products
    WHERE active = 1
  `) as any

  return { products, summary }
}

export const getDetailedSales = async (startDate?: string, endDate?: string) => {
  const [from, to] = getDefaultDates(startDate, endDate);
  const [rows] = await pool.query(`
    SELECT 
      s.id, s.total, s.payment_method, s.created_at, c.name as customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    ORDER BY s.created_at DESC
  `, [from, to])
  return rows
}

export const getCreditsReport = async () => {
  const [rows] = await pool.query(`
    SELECT 
      cr.id, cr.total_amount, cr.balance, cr.status, cr.created_at, 
      c.name as customer_name, c.phone
    FROM credits cr
    JOIN customers c ON cr.customer_id = c.id
    WHERE cr.balance > 0
    ORDER BY cr.created_at ASC
  `)
  return rows
}

export const getTopProductsReport = async (startDate?: string, endDate?: string) => {
  const [from, to] = getDefaultDates(startDate, endDate);
  const [rows] = await pool.query(`
    SELECT 
      p.id, p.name, p.stock, 
      COALESCE(SUM(si.quantity), 0) as qty_sold, 
      COALESCE(SUM(si.subtotal), 0) as revenue
    FROM products p
    LEFT JOIN sale_items si ON p.id = si.product_id
    LEFT JOIN sales s ON si.sale_id = s.id AND DATE(s.created_at) BETWEEN ? AND ?
    WHERE p.active = 1
    GROUP BY p.id
    ORDER BY qty_sold DESC
  `, [from, to])
  return rows
}
