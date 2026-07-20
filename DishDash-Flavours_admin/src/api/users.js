/* Admin - Users (customer CRM) endpoints */
import client from './client.js'

export function listUsers(params = {}) {
  return client.get('/api/admin/users', { params })
}
export function getUser(id) {
  return client.get(`/api/admin/users/${id}`)
}
export function toggleUserStatus(id) {
  return client.patch(`/api/admin/users/${id}/toggle-status`)
}
