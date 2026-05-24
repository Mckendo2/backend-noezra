import { Request, Response } from 'express'
import * as PermissionsService from './permissions.service'
import { AuthRequest } from '../../middlewares/auth'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await PermissionsService.getAllPermissions()
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(500).json({ success: false, message })
  }
}

export const updateRole = async (req: Request, res: Response) => {
  try {
    const role_id = Number(req.params.id)
    await PermissionsService.updateRolePermissions(role_id, req.body)
    res.json({ success: true, message: `Permisos de rol actualizados` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(400).json({ success: false, message })
  }
}

/**
 * Returns permissions for the currently logged-in user's role.
 * Admin always gets full access (all true).
 * Other roles get their configured permissions from DB.
 */
export const getMyPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const role_id = Number(req.user?.role_id)

    // Admin has unrestricted access to everything
    if (role_id === 1) {
      const MODULES = [
        'dashboard','sales','quotations','products','categories',
        'customers','suppliers','purchases','expenses','credits','reports','users'
      ]
      const fullAccess: Record<string, object> = {}
      MODULES.forEach(m => {
        fullAccess[m] = { view: true, create: true, edit: true, delete: true }
      })
      return res.json({ success: true, role_id, data: fullAccess })
    }

    // For other roles — get from DB (with defaults fallback)
    const allPermissions = await PermissionsService.getAllPermissions()
    const myPermissions = allPermissions[role_id as number] ?? {}

    return res.json({ success: true, role_id, data: myPermissions })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error'
    res.status(500).json({ success: false, message })
  }
}
