/* Admin - POS sync endpoints */
import client from './client.js'

// Loyalty transactions that couldn't be matched to a member
export function listUnmatched(params = {}) {
  return client.get('/api/admin/pos/unmatched', { params })
}
export function syncPos(payload = {}) {
  return client.post('/api/admin/pos/sync', payload)
}
// body: { userId } — attach an unmatched transaction to a member
export function resolveUnmatched(id, payload) {
  return client.patch(`/api/admin/pos/unmatched/${id}/resolve`, payload)
}
