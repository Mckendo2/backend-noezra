import { Request, Response } from 'express'
import * as S from './customers.service'
export const getAll = async (_req: Request, res: Response) => res.json({ success: true, data: await S.getAll() })
export const create = async (req: Request, res: Response) => res.status(201).json({ success: true, data: await S.create(req.body) })
export const update = async (req: Request, res: Response) => { await S.update(Number(req.params.id), req.body); res.json({ success: true }) }
export const remove = async (req: Request, res: Response) => { await S.remove(Number(req.params.id)); res.json({ success: true }) }
