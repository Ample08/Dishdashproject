import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage, tierBadge } from '../config/roles.js'
import * as loyaltyApi from '../api/loyalty.js'
import * as posApi from '../api/pos.js'

const PAGE_SIZE = 15
const TABS = [
  { key: 'members', label: 'Members', icon: 'las la-users' },
  { key: 'unmatched', label: 'Unmatched POS', icon: 'las la-unlink' },
]

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Loyalty() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'loyalty')
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'unmatched' ? 'unmatched' : 'members'

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Loyalty Management" subtitle="Members, points and POS reconciliation" />

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams(t.key === 'members' ? {} : { tab: t.key })}>
            <i className={t.icon} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'members' ? <MembersTab canEdit={canEdit} /> : <UnmatchedTab canEdit={canEdit} />}
    </div>
  )
}

function MembersTab({ canEdit }) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adjusting, setAdjusting] = useState(null)
  const [history, setHistory] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await loyaltyApi.listMembers({
        page, limit: PAGE_SIZE, sortBy: 'loyalty_points', sortOrder: 'DESC',
        ...(query && { search: query }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load members.')
      setRows([])
    } finally { setLoading(false) }
  }, [page, query])

  useEffect(() => { load() }, [load])

  const total = pagination?.total ?? rows.length

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <h3>{total} Loyalty Members</h3>
        <div className="table-search"><i className="las la-search" /><input placeholder="Search member…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Member</th><th>Tier</th><th>Points</th><th>Phone</th><th>Since</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="spinner" /><p>Loading members…</p></div></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="es-ic"><i className="las la-medal" /></div><h4>No members here</h4><p>Nothing matches this search.</p></div></td></tr>
            ) : (
              rows.map((m) => (
                <tr key={m.id}>
                  <td><div className="cell-user"><span className="avatar">{initials(m.name)}</span><div className="cu-meta"><b>{m.name}</b><span>Guest #{m.id}</span></div></div></td>
                  <td><span className={`badge ${tierBadge(m.tier)}`}><i className="las la-medal" /> {m.tier || '—'}</span></td>
                  <td className="td-strong">{Number(m.loyalty_points || 0).toLocaleString()}</td>
                  <td>{m.phone || '—'}</td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</td>
                  {canEdit && (
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Points history" onClick={() => setHistory(m)}><i className="las la-history" /></button>
                        <button className="icon-btn" title="Adjust points" onClick={() => setAdjusting(m)}><i className="las la-plus-circle" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && rows.length > 0 && (
        <div className="table-foot">
          <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} members</span>
          <div className="pagination">
            <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
            <button className="active">{pagination?.page ?? page}</button>
            <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
          </div>
        </div>
      )}

      {adjusting && <AdjustModal member={adjusting} onClose={() => setAdjusting(null)} onSaved={() => { setAdjusting(null); load() }} />}
      {history && <HistoryDrawer member={history} onClose={() => setHistory(null)} />}
    </div>
  )
}

function AdjustModal({ member, onClose, onSaved }) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (delta === '' || Number(delta) === 0) { setErr('Enter a non-zero points change.'); return }
    if (!reason.trim()) { setErr('A reason is required.'); return }
    setSaving(true)
    try {
      await loyaltyApi.adjustMemberPoints(member.id, { delta: Number(delta), reason: reason.trim() })
      onSaved()
    } catch (error) { setErr(error.apiMessage || 'Could not adjust points.'); setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head"><h3>Adjust Points</h3><button type="button" className="icon-btn" onClick={onClose}><i className="las la-times" /></button></div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          {err && <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {err}</div>}
          <div className="flex-between" style={{ padding: '10px 13px', borderRadius: 'var(--radius)', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{member.name}</span>
            <span className="badge badge-neutral">{Number(member.loyalty_points || 0).toLocaleString()} pts</span>
          </div>
          <div className="form-group">
            <label>Points change <span className="text-muted">(use a negative number to deduct)</span></label>
            <input type="number" className="form-control" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="e.g. -200" required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Goodwill correction" required />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Apply Adjustment'}</button>
        </div>
      </form>
    </div>
  )
}

function HistoryDrawer({ member, onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loyaltyApi.getMemberHistory(member.id, { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'DESC' })
      .then((res) => { if (!cancelled) setRows(res.data || []) })
      .catch((err) => { if (!cancelled) setError(err.apiMessage || 'Could not load history.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [member.id])

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyItems: 'end', padding: 0 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, height: '100vh', maxHeight: '100vh', borderRadius: 0, animation: 'slideInRight 0.3s var(--ease) both' }}>
        <div className="modal-head">
          <div><h3 style={{ fontSize: 18 }}>{member.name}</h3><div className="text-muted" style={{ fontSize: 12 }}>Points history</div></div>
          <button className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : error ? (
            <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {error}</div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)' }}><i className="las la-folder-open" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />No points activity yet</div>
          ) : (
            <div className="grid-gap" style={{ gap: 0 }}>
              {rows.map((l) => (
                <div className="order-mini" key={l.id}>
                  <span className="om-ic"><i className="las la-coins" /></span>
                  <div className="om-meta"><b>{l.title || 'Activity'}</b><span>{l.sub || ''}{l.created_at ? ` · ${new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : ''}</span></div>
                  <span className={`badge ${l.delta > 0 ? 'badge-success' : l.delta < 0 ? 'badge-danger' : 'badge-neutral'}`}>{l.delta > 0 ? '+' : ''}{Number(l.delta || 0).toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UnmatchedTab({ canEdit }) {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await posApi.listUnmatched({ page, limit: PAGE_SIZE })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load unmatched transactions.')
      setRows([])
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const resolve = async (row) => {
    const userId = window.prompt(`Attach transaction ${row.id} to which user id?`)
    if (!userId) return
    setBusyId(row.id)
    try { await posApi.resolveUnmatched(row.id, { user_id: Number(userId) }); await load() }
    catch (err) { setError(err.apiMessage || 'Could not resolve.') }
    finally { setBusyId(null) }
  }

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <h3>Unmatched POS Transactions</h3>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}><i className="las la-sync" /> Refresh</button>
      </div>
      {error && (
        <div className="alert alert-danger" style={{ margin: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Txn ID</th><th>Amount</th><th>Txn Date</th><th>Reason</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="spinner" /><p>Loading…</p></div></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="es-ic"><i className="las la-check-circle" /></div><h4>All matched</h4><p>No unmatched POS transactions right now.</p></div></td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id}>
                  <td className="td-strong">{u.transaction_id || u.id}</td>
                  <td className="td-strong">{u.amount ?? '—'}</td>
                  <td>{u.txn_date || (u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—')}</td>
                  <td><span className="badge badge-danger dot" title={u.note || ''}>{u.note || 'unmatched'}</span></td>
                  {canEdit && (
                    <td>
                      <button className="btn btn-xs btn-outline" disabled={busyId === u.id} onClick={() => resolve(u)}>
                        <i className="las la-link" /> Match
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && rows.length > 0 && pagination && (
        <div className="table-foot">
          <span className="tf-info">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="pagination">
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
            <button className="active">{pagination.page}</button>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
