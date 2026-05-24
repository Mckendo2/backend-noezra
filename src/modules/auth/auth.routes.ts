import { Router } from 'express'
import { login, register, getProfile } from './auth.controller'
import { authenticate } from '../../middlewares/auth'
import rateLimit from 'express-rate-limit'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Límite de 10 intentos por IP
  message: { success: false, message: 'Demasiados intentos de inicio de sesión desde esta IP, por favor intenta nuevamente después de una hora.' },
})

router.post('/login', loginLimiter, login)
router.post('/register', register)
router.get('/profile', authenticate, getProfile)

export default router
