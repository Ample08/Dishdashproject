import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import * as auditApi from '../api/audit.js'

const PAGE_SIZE = 20

const ACTION_BADGE = (action = '') =>
  action.includes('delete') || action.includes('cancel') ? 'badge-danger'
    : action.includes('create') || action.includes('claim') ? 'badge-success'
    : action.includes('toggle') || action.includes('status') ? 'badge-warning'
    : 'badge-info'

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

// Compact one-line preview of an audit value object.
function preview(val) {
  if (val == null) return '—'
  if (typeof val !== 'object') return String(val)
  return Object.entries(val).map(([k, v]) => `${k}: ${typeof v === 'object' ? '{…}' : v}`).join(', ')
}

export default function AuditLogs() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [entity, setEntity] = useState('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [entityOptions, setEntityOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await auditApi.listAudit({
        page, limit: PAGE_SIZE, sortBy: 'created_at', sortOrder: 'DESC',
        ...(entity !== 'all' && { entity }),
        ...(query && { search: query }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
      // Build the entity filter from whatever entities show up.
      setEntityOptions((prev) => {
        const set = new Set(prev)
        ;(res.data || []).forEach((r) => r.entity && set.add(r.entity))
        return [...set]
      })
    } catch (err) {
      setError(err.apiMessage || 'Could not load audit logs.')
      setRows([])
    } finally { setLoading(false) }
  }, [page, entity, query])

  useEffect(() => { load() }, [load])

  const total = pagination?.total ?? rows.length

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['System']} title="Audit Logs" subtitle="Every change, who made it and when — fully traceable" />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <select className="form-control" style={{ width: 'auto', padding: '8px 34px 8px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12.5 }}
            value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1) }}>
            <option value="all">All Entities</option>
            {entityOptions.map((en) => <option key={en} value={en} style={{ textTransform: 'capitalize' }}>{en}</option>)}
          </select>
          <div className="table-search" style={{ marginLeft: 'auto' }}>
            <i className="las la-search" /><input placeholder="Search action, entity…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th><th>Change</th><th>IP</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="spinner" /><p>Loading logs…</p></div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="es-ic"><i className="las la-clipboard-list" /></div><h4>No logs here</h4><p>Nothing matches this filter.</p></div></td></tr>
              ) : (
                rows.map((l) => {
                  const admin = l.admin?.name || l.admin_name || 'System'
                  return (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{l.created_at ? new Date(l.created_at).toLocaleString('en-GB') : '—'}</td>
                      <td>
                        <div className="cell-user">
                          <span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(admin)}</span>
                          <div className="cu-meta"><b style={{ fontSize: 12.5 }}>{admin}</b><span>{l.admin?.role || ''}</span></div>
                        </div>
                      </td>
                      <td><span className={`badge ${ACTION_BADGE(l.action)}`}>{l.action}</span></td>
                      <td className="td-strong" style={{ textTransform: 'capitalize' }}>{l.entity}{l.entity_id ? ` #${l.entity_id}` : ''}</td>
                      <td style={{ fontSize: 12, maxWidth: 320 }}>
                        {l.old_value != null && <span className="text-muted">{preview(l.old_value)} </span>}
                        {l.old_value != null && <i className="las la-long-arrow-alt-right" style={{ margin: '0 6px', color: 'var(--pistachio-700, var(--pistachio))' }} />}
                        <b style={{ color: 'var(--ink)' }}>{preview(l.new_value)}</b>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{l.ip_address || '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <div className="table-foot">
            <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} events</span>
            <div className="pagination">
              <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
              <button className="active">{pagination?.page ?? page}</button>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
