import { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export interface AppError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err instanceof multer.MulterError) {
    statusCode = 400
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es demasiado grande. El límite es 20MB.'
    }
  }

  // FORCE VERBOSE LOGGING
  let verboseMessage = message;
  if (message === 'Internal Server Error') {
    try {
      verboseMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    } catch(e) {
      verboseMessage = String(err);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: verboseMessage,
    errorObj: err
  })
}
