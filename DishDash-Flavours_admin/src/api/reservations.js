/* Admin - Reservations endpoints */
import client from './client.js'

export function listReservations(params = {}) {
  return client.get('/api/admin/reservations', { params })
}
export function getReservation(id) {
  return client.get(`/api/admin/reservations/${id}`)
}
export function updateReservation(id, payload) {
  return client.put(`/api/admin/reservations/${id}`, payload)
}
// body: { status }
export function setReservationStatus(id, status) {
  return client.patch(`/api/admin/reservations/${id}/status`, { status })
}
// body: { note }
export function setReservationNote(id, note) {
  return client.patch(`/api/admin/reservations/${id}/note`, { note })
}
