import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage, tierBadge } from '../config/roles.js'
import * as usersApi from '../api/users.js'

const PAGE_SIZE = 15
const STATUS_FILTERS = ['all', 'active', 'inactive']

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Customers() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'users')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await usersApi.listUsers({
        page, limit: PAGE_SIZE, sortBy: 'created_at', sortOrder: 'DESC',
        ...(query && { search: query }),
        ...(status !== 'all' && { status }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load customers.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, query, status])

  useEffect(() => { load() }, [load])

  const total = pagination?.total ?? rows.length

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Customers / CRM" subtitle="Search guests and dive into their full profile" />

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f) => (
              <button key={f} className={`btn btn-sm ${status === f ? 'btn-ink' : 'btn-outline'}`} onClick={() => { setStatus(f); setPage(1) }} style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
          <div className="table-search"><i className="las la-search" /><input placeholder="Search name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Tier</th><th>Points</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="spinner" /><p>Loading customers…</p></div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="es-ic"><i className="las la-user-friends" /></div><h4>No customers here</h4><p>Nothing matches this filter.</p></div></td></tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td><div className="cell-user"><span className="avatar">{initials(c.name)}</span><div className="cu-meta"><b>{c.name}</b><span>Guest #{c.id}</span></div></div></td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td><span className={`badge ${tierBadge(c.tier)}`}><i className="las la-medal" /> {c.tier || '—'}</span></td>
                    <td className="td-strong">{Number(c.loyalty_points || 0).toLocaleString()}</td>
                    <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'} dot`}>{c.is_active ? 'active' : 'inactive'}</span></td>
                    <td><button className="icon-btn"><i className="las la-angle-right" /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <div className="table-foot">
            <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} customers</span>
            <div className="pagination">
              <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
              <button className="active">{pagination?.page ?? page}</button>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <CustomerDrawer id={selected.id} fallback={selected} canEdit={canEdit} onClose={() => setSelected(null)} onChanged={load} />
      )}
    </div>
  )
}

function CustomerDrawer({ id, fallback, canEdit, onClose, onChanged }) {
  const [c, setC] = useState(fallback)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    usersApi.getUser(id)
      .then((res) => { if (!cancelled && res.data) setC(res.data) })
      .catch(() => {}) // keep the row data we already have
    return () => { cancelled = true }
  }, [id])

  const toggle = async () => {
    setBusy(true); setErr('')
    try {
      const res = await usersApi.toggleUserStatus(id)
      if (res.data) setC(res.data)
      onChanged?.()
    } catch (e) { setErr(e.apiMessage || 'Could not update status.') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyItems: 'end', padding: 0 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, height: '100vh', maxHeight: '100vh', borderRadius: 0, animation: 'slideInRight 0.3s var(--ease) both' }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span className="avatar" style={{ width: 48, height: 48, fontSize: 17 }}>{initials(c.name)}</span>
            <div>
              <h3 style={{ fontSize: 18 }}>{c.name}</h3>
              <div className="text-muted" style={{ fontSize: 12 }}>{c.phone || c.email || `Guest #${c.id}`}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>

        <div className="modal-body" style={{ paddingTop: 16 }}>
          {err && <div className="alert alert-danger" style={{ marginBottom: 12 }}><i className="las la-exclamation-circle" /> {err}</div>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'} dot`}>{c.is_active ? 'Active' : 'Inactive'}</span>
            <span className={`badge ${tierBadge(c.tier)}`}><i className="las la-medal" /> {c.tier || '—'}</span>
          </div>

          <div className="grid-gap" style={{ gap: 11 }}>
            <InfoRow icon="las la-star" label="Loyalty Points" value={Number(c.loyalty_points || 0).toLocaleString()} />
            <InfoRow icon="las la-phone" label="Phone" value={c.phone || '—'} />
            <InfoRow icon="las la-envelope" label="Email" value={c.email || '—'} />
            {c.dob && <InfoRow icon="las la-birthday-cake" label="Date of Birth" value={new Date(c.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />}
            {c.referral_code && <InfoRow icon="las la-hashtag" label="Referral Code" value={c.referral_code} />}
            {c.referred_by && <InfoRow icon="las la-user-friends" label="Referred By" value={c.referred_by} />}
            <InfoRow icon="las la-bullhorn" label="Marketing Opt-in" value={c.marketing_opt_in ? 'Yes' : 'No'} />
            {c.created_at && <InfoRow icon="las la-calendar" label="Member Since" value={new Date(c.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          {canEdit && (
            <button className={`btn btn-sm ${c.is_active ? 'btn-outline' : 'btn-primary'}`} onClick={toggle} disabled={busy}>
              <i className={c.is_active ? 'las la-user-slash' : 'las la-user-check'} /> {busy ? 'Saving…' : c.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex-between" style={{ padding: '10px 13px', borderRadius: 'var(--radius)', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}><i className={icon} style={{ fontSize: 17, color: 'var(--text-tertiary)' }} /> {label}</span>
      <b style={{ fontSize: 13, color: 'var(--ink)' }}>{value}</b>
    </div>
  )
}
