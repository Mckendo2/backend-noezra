import { Request, Response } from 'express'
import * as RolesService from './roles.service'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await RolesService.getAllRoles()
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener roles'
    res.status(500).json({ success: false, message })
  }
}

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'ID y nombre son obligatorios' })
    }
    await RolesService.createRole({ name, description })
    res.status(201).json({ success: true, message: 'Rol creado exitosamente' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear rol'
    res.status(500).json({ success: false, message })
  }
}

export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    
    const role = await RolesService.getRoleById(id)
    if (!role) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado' })
    }
    if (!role.is_custom) {
      return res.status(403).json({ success: false, message: 'No se puede modificar un rol del sistema' })
    }

    await RolesService.updateRole(id, req.body)
    res.json({ success: true, message: 'Rol actualizado exitosamente' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar rol'
    res.status(500).json({ success: false, message })
  }
}

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)

    const role = await RolesService.getRoleById(id)
    if (!role) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado' })
    }
    if (!role.is_custom) {
      return res.status(403).json({ success: false, message: 'No se puede eliminar un rol del sistema' })
    }

    await RolesService.deleteRole(id)
    res.json({ success: true, message: 'Rol eliminado exitosamente' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar rol'
    // Error 400 es lanzado si hay usuarios con ese rol (ver roles.service.ts throw new Error)
    res.status(400).json({ success: false, message })
  }
}
