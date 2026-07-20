/* Branches — there is no admin branches endpoint, so we read the public
   branch list from the App API (same server, same auth headers). Used to
   populate brand/branch dropdowns when assigning staff scope. */
import client from './client.js'

// GET /api/app/branches -> [{ branch_key, name, area, ... }]
export function listBranches(params = {}) {
  return client.get('/api/app/branches', { params })
}
