import { Request, Response } from 'express'
import pool from '../../config/db'

export const getPublicProducts = async (_req: Request, res: Response) => {
  try {
    // We only select fields that are safe for the public. NO PRICES.
    // Also we filter by active = 1
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.image_url, 
        p.category_id, 
        c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1
    `)
    res.json({ success: true, data: rows })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getPublicCategories = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM categories WHERE active = 1')
    res.json({ success: true, data: rows })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
