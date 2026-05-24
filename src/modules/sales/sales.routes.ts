import { Router } from 'express'
import { getAll, getById, create } from './sales.controller'
import { authenticate } from '../../middlewares/auth'
const router = Router()
router.use(authenticate)
router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
export default router
