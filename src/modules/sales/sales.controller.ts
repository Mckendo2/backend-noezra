import { Request, Response } from 'express'
import * as S from './sales.service'
import { AuthRequest } from '../../middlewares/auth'

export const getAll = async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string }
  const data = await S.getAll({ from, to })
  res.json({ success: true, data })
}

export const getById = async (req: Request, res: Response) => {
  const data = await S.getById(Number(req.params.id))
  if (!data) { res.status(404).json({ success: false, message: 'Not found' }); return }
  res.json({ success: true, data })
}

export const create = async (req: AuthRequest, res: Response) => {
  const data = await S.create({ ...req.body, user_id: req.user!.id })
  res.status(201).json({ success: true, data })
}
