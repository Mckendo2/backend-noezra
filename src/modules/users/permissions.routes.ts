import { Router } from 'express'
import { getAll, updateRole, getMyPermissions } from './permissions.controller'
import { authenticate, authorize } from '../../middlewares/auth'

const router = Router()

router.use(authenticate)

// Any authenticated user can get their own role's permissions
router.get('/me', getMyPermissions)

// Admin-only routes
router.get('/', authorize(1), getAll)
router.put('/:id', authorize(1), updateRole)

export default router
