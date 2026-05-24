import { Request, Response } from 'express'
import * as S from './credits.service'

export async function getAllCredits(req: Request, res: Response) {
  const data = await S.getAllCreditsWithBalance()
  res.json({ success: true, data })
}

export async function getCreditDetail(req: Request, res: Response) {
  const id = Number(req.params.id)
  const data = await S.getCreditDetail(id)
  res.json({ success: true, data })
}

export async function addPayment(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { amount, notes } = req.body
  await S.addPayment(id, amount, notes)
  res.json({ success: true })
}
