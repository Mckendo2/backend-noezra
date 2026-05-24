import { Router } from 'express'
import { getDashboard, getSalesByPeriod, getProfitsReport, getInventoryReport, getDetailedSales, getCreditsReport, getTopProductsReport } from './reports.controller'
import { authenticate } from '../../middlewares/auth'
const router = Router()
router.use(authenticate)
router.get('/dashboard', getDashboard)
router.get('/sales', getSalesByPeriod)
router.get('/profits', getProfitsReport)
router.get('/inventory', getInventoryReport)
router.get('/sales-detailed', getDetailedSales)
router.get('/credits', getCreditsReport)
router.get('/top-products', getTopProductsReport)
export default router
