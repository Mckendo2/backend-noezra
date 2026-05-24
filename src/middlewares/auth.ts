import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../config/db'

export interface AuthRequest extends Request {
  user?: { id: number; role_id: number; email: string }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    
    // Check if user is still active in the database
    const [rows] = await pool.query('SELECT active FROM users WHERE id = ? LIMIT 1', [decoded.id])
    const users = rows as any[]
    if (!users.length || !users[0].active) {
      res.status(401).json({ success: false, message: 'Tu cuenta ha sido desactivada' })
      return
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role_id: Number(decoded.role_id) || (decoded.role === 'admin' ? 1 : decoded.role === 'cashier' ? 3 : decoded.role === 'warehouse' ? 4 : 0)
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const authorize = (...roleIds: number[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const fs = require('fs')
    fs.writeFileSync('debug.json', JSON.stringify({ required: roleIds, user: req.user }))
    console.log('Authorize check:', { required: roleIds, actual: req.user?.role_id })
    if (!req.user || !roleIds.includes(req.user.role_id)) {
      res.status(403).json({ success: false, message: 'Forbidden', debug_user: req.user, debug_roleIds: roleIds })
      return
    }
    next()
  }
