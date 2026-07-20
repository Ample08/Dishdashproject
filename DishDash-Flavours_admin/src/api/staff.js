/* Admin - Staff & Access endpoints */
import client from './client.js'

export function getPermissionCatalog() {
  return client.get('/api/admin/permissions')
}

// params: page, limit, sortBy, sortOrder, search, status, role
export function listStaff(params = {}) {
  return client.get('/api/admin/staff', { params })
}

export function getStaff(id) {
  return client.get(`/api/admin/staff/${id}`)
}

// body: { name, email, password, role?, permissions?, brand_key?, branch_key?, phone? }
export function createStaff(payload) {
  return client.post('/api/admin/staff', payload)
}

export function updateStaff(id, payload) {
  return client.put(`/api/admin/staff/${id}`, payload)
}

export function deleteStaff(id) {
  return client.delete(`/api/admin/staff/${id}`)
}

// body: { permissions: string[] }
export function setStaffPermissions(id, permissions) {
  return client.patch(`/api/admin/staff/${id}/permissions`, { permissions })
}

export function toggleStaffStatus(id) {
  return client.patch(`/api/admin/staff/${id}/toggle-status`)
}
