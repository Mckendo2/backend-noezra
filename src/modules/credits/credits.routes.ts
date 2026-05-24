import { Router } from 'express'
import { getAllCredits, getCreditDetail, addPayment } from './credits.controller'

const router = Router()

router.get('/', getAllCredits)
router.get('/:id', getCreditDetail)
router.post('/:id/payments', addPayment)

export default router
