import pool from './src/config/db';

async function run() {
  try {
    // 1. Add discount to sales
    await pool.query(`
      ALTER TABLE sales 
      ADD COLUMN discount DECIMAL(12,2) DEFAULT 0.00 AFTER total
    `).catch(e => {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        console.log('Column discount already exists');
    });

    // 2. Create credits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credits (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_id INT UNSIGNED NOT NULL,
        customer_id INT UNSIGNED NOT NULL,
        total_amount DECIMAL(14,2) NOT NULL,
        paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        status ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    console.log('Database updated successfully');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    process.exit(0);
  }
}

run();
