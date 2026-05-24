import { Router } from 'express'
import * as C from './expenses.controller'
import { authenticate } from '../../middlewares/auth'

const router = Router()

router.use(authenticate)

router.get('/', C.getAll)
router.get('/:id', C.getById)
router.post('/', C.create)
router.put('/:id', C.update)
router.delete('/:id', C.remove)

export default router
