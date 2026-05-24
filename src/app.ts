import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Routes
import authRoutes from './modules/auth/auth.routes'
import productRoutes from './modules/products/products.routes'
import categoryRoutes from './modules/categories/categories.routes'
import saleRoutes from './modules/sales/sales.routes'
import purchaseRoutes from './modules/purchases/purchases.routes'
import customerRoutes from './modules/customers/customers.routes'
import supplierRoutes from './modules/suppliers/suppliers.routes'
import reportRoutes from './modules/reports/reports.routes'
import quotationRoutes from './modules/quotations/quotations.routes'
import creditsRoutes from './modules/credits/credits.routes'
import expensesRoutes from './modules/expenses/expenses.routes'
import usersRoutes from './modules/users/users.routes'
import permissionsRoutes from './modules/users/permissions.routes'
import rolesRoutes from './modules/roles/roles.routes'
import publicRoutes from './modules/public/public.routes'

// Middlewares
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'

dotenv.config()

const app = express()
app.set('trust proxy', 1) // Confiar en el proxy de Hostinger para express-rate-limit
// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permite cargar imágenes del servidor desde el frontend
}))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 150, // Límite por IP de 150 peticiones cada 15 min
  message: { success: false, message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.' }
})
app.use('/api', globalLimiter)

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Serve static uploads
import path from 'path'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
const API = '/api/v1'
app.use(`${API}/auth`, authRoutes)
app.use(`${API}/products`, productRoutes)
app.use(`${API}/categories`, categoryRoutes)
app.use(`${API}/sales`, saleRoutes)
app.use(`${API}/purchases`, purchaseRoutes)
app.use(`${API}/customers`, customerRoutes)
app.use(`${API}/suppliers`, supplierRoutes)
app.use(`${API}/reports`, reportRoutes)
app.use(`${API}/quotations`, quotationRoutes)
app.use(`${API}/credits`, creditsRoutes)
app.use(`${API}/expenses`, expensesRoutes)
app.use(`${API}/users`, usersRoutes)
app.use(`${API}/permissions`, permissionsRoutes)
app.use(`${API}/roles`, rolesRoutes)
app.use(`${API}/public`, publicRoutes)

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
