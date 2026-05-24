import { Request, Response } from 'express'
import * as AuthService from './auth.service'
import * as UsersService from '../users/users.service'

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = await AuthService.login(email, password)
    res.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(401).json({ success: false, message })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(400).json({ success: false, message })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      return
    }
    const user = await UsersService.getById(userId)
    console.log('HELLO THIS IS GETPROFILE EXECUTION. User from DB:', user)
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return
    }
    res.json({ success: true, data: user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener perfil'
    res.status(500).json({ success: false, message })
  }
}
