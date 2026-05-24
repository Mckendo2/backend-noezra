import { Request, Response } from 'express'
import * as S from './reports.service'
export const getDashboard = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
  res.json({ success: true, data: await S.getDashboard(startDate, endDate) })
}
export const getSalesByPeriod = async (req: Request, res: Response) => {
  const { from, to } = req.query as { from: string; to: string }
  res.json({ success: true, data: await S.getSalesByPeriod(from, to) })
}

export const getProfitsReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
  res.json({ success: true, data: await S.getProfitsReport(startDate, endDate) })
}

export const getInventoryReport = async (_req: Request, res: Response) => {
  res.json({ success: true, data: await S.getInventoryReport() })
}

export const getDetailedSales = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
  res.json({ success: true, data: await S.getDetailedSales(startDate, endDate) })
}

export const getCreditsReport = async (_req: Request, res: Response) => {
  res.json({ success: true, data: await S.getCreditsReport() })
}

export const getTopProductsReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
  res.json({ success: true, data: await S.getTopProductsReport(startDate, endDate) })
}
