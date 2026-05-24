import { Router } from 'express'
import { getAll, create, update, toggleActive, remove, updatePassword } from './users.controller'
import { authenticate, authorize } from '../../middlewares/auth'

const router = Router()

// Authentication required for all routes
router.use(authenticate)

// This route only requires authentication
router.put('/me/password', updatePassword)

// Admin role required for the rest
router.use(authorize(1))

router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id/toggle', toggleActive)
router.delete('/:id', remove)

export default router
