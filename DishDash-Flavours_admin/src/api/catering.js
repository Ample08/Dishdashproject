/* Admin - Catering endpoints */
import client from './client.js'

export function listCatering(params = {}) {
  return client.get('/api/admin/catering', { params })
}
export function getCatering(id) {
  return client.get(`/api/admin/catering/${id}`)
}
// body: { status }
export function setCateringStatus(id, status) {
  return client.patch(`/api/admin/catering/${id}/status`, { status })
}
// body: { assignedTo } — assign a staff member to the inquiry
export function assignCatering(id, payload) {
  return client.patch(`/api/admin/catering/${id}/assign`, payload)
}
// body: { note }
export function setCateringNote(id, note) {
  return client.patch(`/api/admin/catering/${id}/note`, { note })
}
