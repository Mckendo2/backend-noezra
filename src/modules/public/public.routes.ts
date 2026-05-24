import { Router } from 'express'
import { getPublicProducts, getPublicCategories } from './public.controller'

const router = Router()

// Public endpoints, no authenticate middleware
router.get('/products', getPublicProducts)
router.get('/categories', getPublicCategories)

export default router
