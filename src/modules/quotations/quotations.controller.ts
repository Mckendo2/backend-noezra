import { Request, Response } from 'express'
import * as S from './quotations.service'

export const getAll = async (req: Request, res: Response) => {
  const { status, from, to } = req.query as any
  const data = await S.getAll({ status, from, to })
  res.json({ success: true, data })
}

export const getById = async (req: Request, res: Response) => {
  const data = await S.getById(Number(req.params.id))
  if (!data) return res.status(404).json({ success: false, message: 'Cotización no encontrada' })
  res.json({ success: true, data })
}

export const create = async (req: Request, res: Response) => {
  const data = await S.create(req.body)
  res.status(201).json({ success: true, data })
}

export const update = async (req: Request, res: Response) => {
  try {
    const data = await S.update(Number(req.params.id), req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  const { status } = req.body
  if (!['pending', 'approved', 'expired', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' })
  }
  const data = await S.updateStatus(Number(req.params.id), status)
  res.json({ success: true, data })
}

export const convertToSale = async (req: Request, res: Response) => {
  try {
    const data = await S.convertToSale(Number(req.params.id), req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}
