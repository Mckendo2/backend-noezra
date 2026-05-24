import { Request, Response } from 'express'
import * as ProductService from './products.service'

export const getAll = async (_req: Request, res: Response) => {
  const data = await ProductService.getAll()
  res.json({ success: true, data })
}
export const getById = async (req: Request, res: Response) => {
  const data = await ProductService.getById(Number(req.params.id))
  if (!data) { res.status(404).json({ success: false, message: 'Not found' }); return }
  res.json({ success: true, data })
}
export const create = async (req: Request, res: Response) => {
  // Cloudinary devuelve la URL completa (HTTPS) en req.file.path
  const image_url = req.file ? req.file.path : undefined
  const payload = { ...req.body, image_url }
  const data = await ProductService.create(payload)
  res.status(201).json({ success: true, data })
}
export const update = async (req: Request, res: Response) => {
  // Cloudinary devuelve la URL completa (HTTPS) en req.file.path
  const image_url = req.file ? req.file.path : undefined
  const payload = image_url ? { ...req.body, image_url } : req.body
  const data = await ProductService.update(Number(req.params.id), payload)
  res.json({ success: true, data })
}
export const remove = async (req: Request, res: Response) => {
  await ProductService.remove(Number(req.params.id))
  res.json({ success: true, message: 'Deleted' })
}
