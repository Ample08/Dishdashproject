/* Admin - Flavours & Reviews endpoints */
import client from './client.js'

export function listFlavours(params = {}) {
  return client.get('/api/admin/flavours', { params })
}
export function createFlavour(payload) {
  return client.post('/api/admin/flavours', payload)
}
export function updateFlavour(id, payload) {
  return client.put(`/api/admin/flavours/${id}`, payload)
}
export function deleteFlavour(id) {
  return client.delete(`/api/admin/flavours/${id}`)
}
export function listReviews(params = {}) {
  return client.get('/api/admin/reviews', { params })
}
