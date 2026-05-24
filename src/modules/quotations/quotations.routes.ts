import { Router } from 'express'
import { getAll, getById, create, update, updateStatus, convertToSale } from './quotations.controller'
import { authenticate } from '../../middlewares/auth'

const router = Router()
router.use(authenticate)

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id/status', updateStatus)
router.post('/:id/convert', convertToSale)

export default router
