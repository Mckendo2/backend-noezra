-- =============================================================================
-- POS Importadora — Schema SQL
-- Motor: MySQL 8+
-- =============================================================================

-- Database creation and USE are removed, so this script runs against whatever DB is selected.

-- ── ROLES ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  is_custom   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL UNIQUE,
  phone      VARCHAR(30),
  ci         VARCHAR(20),
  password   VARCHAR(255) NOT NULL,
  role_id    INT UNSIGNED NOT NULL,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- ── CATEGORIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  barcode     VARCHAR(100) UNIQUE,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cost        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  stock       INT NOT NULL DEFAULT 0,
  min_stock   INT NOT NULL DEFAULT 5,
  unit        VARCHAR(30) NOT NULL DEFAULT 'unit',
  image_url   VARCHAR(255) NULL,
  category_id INT UNSIGNED,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ── CUSTOMERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(180),
  phone      VARCHAR(30),
  address    TEXT,
  ci         VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SUPPLIERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(180),
  phone      VARCHAR(30),
  address    TEXT,
  ruc        VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SALES ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  customer_id    INT UNSIGNED,
  total          DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  payment_method ENUM('cash','card','transfer','credit') NOT NULL DEFAULT 'cash',
  status         ENUM('completed','cancelled','refunded') NOT NULL DEFAULT 'completed',
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,
  subtotal    DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (sale_id)    REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── PURCHASES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  supplier_id INT UNSIGNED,
  total       DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  status      ENUM('received','pending','cancelled') NOT NULL DEFAULT 'received',
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_id  INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NOT NULL,
  quantity     INT NOT NULL,
  unit_cost    DECIMAL(12,2) NOT NULL,
  subtotal     DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id)
);

-- ── QUOTATIONS (Cotizaciones) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotations (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(20) NOT NULL UNIQUE,
  user_id      INT UNSIGNED NOT NULL,
  customer_id  INT UNSIGNED NULL,
  subtotal     DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount     DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  status       ENUM('pending','approved','expired','cancelled') NOT NULL DEFAULT 'pending',
  valid_until  DATE NOT NULL,
  notes        TEXT,
  sale_id      INT UNSIGNED NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (sale_id)     REFERENCES sales(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quotation_id  INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  quantity      INT NOT NULL,
  unit_price    DECIMAL(12,2) NOT NULL,
  subtotal      DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)   REFERENCES products(id)
);

-- ── SEED: Admin user (password: admin123) ─────────────────────────────────────
INSERT IGNORE INTO users (name, email, password, role_id) VALUES
  ('Administrador', 'admin@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);
-- Note: the above hash is for password 'admin123' (bcrypt rounds=10)

-- ── SEED: Default categories ───────────────────────────────────────────────────
INSERT IGNORE INTO categories (name) VALUES
  ('Electrónica'), ('Ropa'), ('Calzado'), ('Hogar'), ('Juguetes'),
  ('Herramientas'), ('Alimentos'), ('Cosméticos'), ('Deportes'), ('Otros');
-- ── CREDITS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credits (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id       INT UNSIGNED NOT NULL,
  customer_id   INT UNSIGNED NOT NULL,
  total_amount  DECIMAL(14,2) NOT NULL,
  balance       DECIMAL(14,2) NOT NULL,
  status        ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id)     REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ── CREDIT PAYMENTS (Abonos) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_payments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  credit_id   INT UNSIGNED NOT NULL,
  amount      DECIMAL(14,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes       TEXT
);

-- ── EXPENSES (Gastos) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  category    VARCHAR(100) NOT NULL,
  amount      DECIMAL(14,2) NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── ROLE PERMISSIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id    INT UNSIGNED NOT NULL,
  module     VARCHAR(50) NOT NULL,
  can_view   BOOLEAN NOT NULL DEFAULT FALSE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit   BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_module (role_id, module),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ── SEED: Default permissions for cashier (assuming role_id = 2) ────────────────
INSERT IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES
  (2, 'dashboard',  1, 0, 0, 0),
  (2, 'sales',      1, 1, 0, 0),
  (2, 'quotations', 1, 1, 1, 0),
  (2, 'products',   1, 0, 0, 0),
  (2, 'categories', 1, 0, 0, 0),
  (2, 'customers',  1, 1, 1, 0),
  (2, 'suppliers',  0, 0, 0, 0),
  (2, 'purchases',  0, 0, 0, 0),
  (2, 'expenses',   0, 0, 0, 0),
  (2, 'credits',    1, 1, 1, 0),
  (2, 'reports',    0, 0, 0, 0),
  (2, 'users',      0, 0, 0, 0);

-- ── SEED: Default permissions for warehouse (assuming role_id = 3) ────────────
INSERT IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES
  (3, 'dashboard',  1, 0, 0, 0),
  (3, 'sales',      1, 0, 0, 0),
  (3, 'quotations', 0, 0, 0, 0),
  (3, 'products',   1, 1, 1, 0),
  (3, 'categories', 1, 1, 1, 0),
  (3, 'customers',  1, 0, 0, 0),
  (3, 'suppliers',  1, 1, 1, 0),
  (3, 'purchases',  1, 1, 1, 0),
  (3, 'expenses',   1, 1, 1, 0),
  (3, 'credits',    0, 0, 0, 0),
  (3, 'reports',    1, 0, 0, 0),
  (3, 'users',      0, 0, 0, 0);
