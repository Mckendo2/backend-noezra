import { Router } from 'express'
import { getAll, createRole, updateRole, deleteRole } from './roles.controller'
import { authenticate, authorize } from '../../middlewares/auth'

const router = Router()

router.use(authenticate)
// Generalmente los roles solo pueden ser gestionados por admin
router.use(authorize(1))

router.get('/', getAll)
router.post('/', createRole)
router.put('/:id', updateRole)
router.delete('/:id', deleteRole)

export default router
