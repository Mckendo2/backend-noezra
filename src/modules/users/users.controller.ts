import { Request, Response } from 'express'
import * as UsersService from './users.service'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await UsersService.getAll()
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(500).json({ success: false, message })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const data = await UsersService.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(400).json({ success: false, message })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const data = await UsersService.update(id, req.body)
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(400).json({ success: false, message })
  }
}

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user?.id
    if (!id) throw new Error('Usuario no autenticado')
    
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      throw new Error('Faltan datos de contraseña')
    }

    await UsersService.updatePassword(id, currentPassword, newPassword)
    res.json({ success: true, message: 'Contraseña actualizada' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(400).json({ success: false, message })
  }
}

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const data = await UsersService.toggleActive(id)
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(500).json({ success: false, message })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    await UsersService.remove(id)
    res.json({ success: true, message: 'Usuario eliminado' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(500).json({ success: false, message })
  }
}
