import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'

dotenv.config()

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, _file) => {
    return {
      folder: 'noezra-pos/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: 'product-' + Date.now() + '-' + Math.round(Math.random() * 1e9)
    }
  }
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato de imagen inválido. Solo JPG, PNG y WEBP.'))
  }
}

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
})
