/* Admin - Reports endpoints (all view-only) */
import client from './client.js'

export function reportOverview(params = {}) {
  return client.get('/api/admin/reports/overview', { params })
}
export function reportOrdersByBrand(params = {}) {
  return client.get('/api/admin/reports/orders-by-brand', { params })
}
export function reportTierDistribution(params = {}) {
  return client.get('/api/admin/reports/tier-distribution', { params })
}
export function reportOfferBookings(params = {}) {
  return client.get('/api/admin/reports/offer-bookings', { params })
}
export function reportVoucherSummary(params = {}) {
  return client.get('/api/admin/reports/voucher-summary', { params })
}
