/* Admin - Menu & Brands endpoints (API groups these under one permission) */
import client from './client.js'

/* ---- Brands ---- */
export function listBrands(params = {}) {
  return client.get('/api/admin/brands', { params })
}
export function createBrand(payload) {
  return client.post('/api/admin/brands', payload)
}
export function updateBrand(id, payload) {
  return client.put(`/api/admin/brands/${id}`, payload)
}
export function deleteBrand(id) {
  return client.delete(`/api/admin/brands/${id}`)
}

/* ---- Menu items ---- */
export function listMenu(params = {}) {
  return client.get('/api/admin/menu', { params })
}
export function getMenuItem(id) {
  return client.get(`/api/admin/menu/${id}`)
}
export function createMenuItem(payload) {
  return client.post('/api/admin/menu', payload)
}
export function updateMenuItem(id, payload) {
  return client.put(`/api/admin/menu/${id}`, payload)
}
export function deleteMenuItem(id) {
  return client.delete(`/api/admin/menu/${id}`)
}
export function toggleMenuStock(id) {
  return client.patch(`/api/admin/menu/${id}/toggle-stock`)
}
