/* Admin - Orders endpoints */
import client from './client.js'

// GET /api/admin/orders -> { data: AdminOrder[], pagination }
// params: page, limit, sortBy, sortOrder, status, brand, search
export function listOrders(params = {}) {
  return client.get('/api/admin/orders', { params })
}

// GET /api/admin/orders/{id} -> AdminOrder
export function getOrder(id) {
  return client.get(`/api/admin/orders/${id}`)
}

// PATCH /api/admin/orders/{id}/accept  (optional prep_time)
export function acceptOrder(id, prepTime) {
  return client.patch(`/api/admin/orders/${id}/accept`, prepTime ? { prep_time: prepTime } : {})
}

// PATCH /api/admin/orders/{id}/ready
export function markOrderReady(id) {
  return client.patch(`/api/admin/orders/${id}/ready`)
}

// PATCH /api/admin/orders/{id}/collected
export function markOrderCollected(id) {
  return client.patch(`/api/admin/orders/${id}/collected`)
}

// PATCH /api/admin/orders/{id}/cancel  (optional reason)
export function cancelOrder(id, reason) {
  return client.patch(`/api/admin/orders/${id}/cancel`, reason ? { reason } : {})
}
