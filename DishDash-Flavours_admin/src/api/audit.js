/* Admin - Audit Log endpoint (view-only) */
import client from './client.js'

// params: page, limit, user, module, ...
export function listAudit(params = {}) {
  return client.get('/api/admin/audit', { params })
}
