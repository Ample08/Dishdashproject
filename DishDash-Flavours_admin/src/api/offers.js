/* Admin - Experience Offers endpoints */
import client from './client.js'

export function listOffers(params = {}) {
  return client.get('/api/admin/offers', { params })
}
export function getOffer(id) {
  return client.get(`/api/admin/offers/${id}`)
}
export function createOffer(payload) {
  return client.post('/api/admin/offers', payload)
}
export function updateOffer(id, payload) {
  return client.put(`/api/admin/offers/${id}`, payload)
}
export function deleteOffer(id) {
  return client.delete(`/api/admin/offers/${id}`)
}
export function toggleOffer(id) {
  return client.patch(`/api/admin/offers/${id}/toggle`)
}

/* ---- Offer bookings ---- */
export function listOfferBookings(params = {}) {
  return client.get('/api/admin/offers/bookings', { params })
}
// body: { status }
export function setOfferBookingStatus(id, status) {
  return client.patch(`/api/admin/offers/bookings/${id}/status`, { status })
}
