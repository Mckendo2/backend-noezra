import { Request, Response } from 'express'
import * as S from './purchases.service'
import { AuthRequest } from '../../middlewares/auth'
import * as fs from 'fs'
import * as path from 'path'

export let lastPayload: any = null

export const getAll = async (_req: Request, res: Response) => res.json({ success: true, data: await S.getAll() })

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const logPath = path.join(__dirname, '../../../../payload_log.txt')
    fs.writeFileSync(logPath, JSON.stringify(req.body, null, 2))
  } catch(e) {}
  
  lastPayload = req.body
  console.log('Purchase payload:', JSON.stringify(req.body, null, 2))
  const data = await S.create({ ...req.body, user_id: req.user!.id })
  res.status(201).json({ success: true, data })
}

export const getLastPayload = async (_req: Request, res: Response) => {
  res.json({ lastPayload })
}
