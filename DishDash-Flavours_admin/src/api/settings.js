/* Admin - Settings endpoints (key/value store) */
import client from './client.js'

export function listSettings(params = {}) {
  return client.get('/api/admin/settings', { params })
}
export function getSetting(key) {
  return client.get(`/api/admin/settings/${key}`)
}
// body: { value }
export function updateSetting(key, value) {
  return client.put(`/api/admin/settings/${key}`, { value })
}
export function deleteSetting(key) {
  return client.delete(`/api/admin/settings/${key}`)
}
