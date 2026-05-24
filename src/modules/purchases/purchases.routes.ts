import { Router } from 'express'
import { getAll, create, getLastPayload } from './purchases.controller'
import { authenticate } from '../../middlewares/auth'
const router = Router()
router.use(authenticate)
router.get('/debug/last-payload', getLastPayload)
router.get('/', getAll)
router.post('/', create)
export default router
