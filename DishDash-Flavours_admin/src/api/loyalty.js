/* Admin - Loyalty endpoints */
import client from './client.js'

export function listMembers(params = {}) {
  return client.get('/api/admin/loyalty/members', { params })
}
export function getMember(id) {
  return client.get(`/api/admin/loyalty/members/${id}`)
}
export function getMemberHistory(id, params = {}) {
  return client.get(`/api/admin/loyalty/members/${id}/history`, { params })
}
// body: { points, reason } — manual points adjustment
export function adjustMemberPoints(id, payload) {
  return client.post(`/api/admin/loyalty/members/${id}/adjust`, payload)
}
