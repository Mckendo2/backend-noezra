import { Router } from 'express'
import { getAll, getById, create, update, remove } from './products.controller'
import { authenticate } from '../../middlewares/auth'
import { uploadProductImage } from '../../middlewares/upload'

const router = Router()
router.use(authenticate)
router.get('/', getAll)
router.get('/:id', getById)
router.post('/', uploadProductImage.single('image'), create)
router.put('/:id', uploadProductImage.single('image'), update)
router.delete('/:id', remove)

export default router
