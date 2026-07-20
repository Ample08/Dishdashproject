/* Admin - Auth endpoints */
import client from './client.js'

// POST /api/admin/login -> { admin, token }
export function login(email, password) {
  return client.post('/api/admin/login', { email, password })
}

// GET /api/admin/profile -> admin (with effectivePermissions)
export function getProfile() {
  return client.get('/api/admin/profile')
}

// GET /api/admin/permissions -> { roles, permissions, groups, roleDefaults }
export function getPermissionCatalog() {
  return client.get('/api/admin/permissions')
}

// GET /api/admin/dashboard -> stats
export function getDashboard() {
  return client.get('/api/admin/dashboard')
}
