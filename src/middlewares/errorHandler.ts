import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export interface AppError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: AppError | multer.MulterError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = (err as AppError).statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err instanceof multer.MulterError) {
    statusCode = 400
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es demasiado grande. El límite es 20MB.'
    }
  }

  // Always return the real error message to help debug in production temporarily
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
