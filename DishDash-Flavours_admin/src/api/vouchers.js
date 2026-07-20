/* Admin - Vouchers endpoints */
import client from './client.js'

export function listVouchers(params = {}) {
  return client.get('/api/admin/vouchers', { params })
}
export function getVoucherByCode(code) {
  return client.get(`/api/admin/vouchers/code/${code}`)
}
// body: { bill } — claim/redeem a voucher against a bill amount
export function claimVoucher(id, payload) {
  return client.patch(`/api/admin/vouchers/${id}/claim`, payload)
}
