import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import * as vouchersApi from '../api/vouchers.js'

const PAGE_SIZE = 15
const KIND_META = {
  welcome: { label: 'Welcome', tone: 'info', icon: 'las la-gift' },
  celebration: { label: 'Celebration', tone: 'grape', icon: 'las la-birthday-cake' },
}
const STATUS_META = {
  pending: { label: 'Pending', cls: 'badge-warning' },
  available: { label: 'Available', cls: 'badge-info' },
  claimed: { label: 'Claimed', cls: 'badge-success' },
}
// Filter tabs map to the ?tab= param (kind or status).
const TABS = [
  { key: 'all', label: 'All Vouchers' },
  { key: 'welcome', label: 'Welcome', kind: 'welcome' },
  { key: 'celebration', label: 'Celebration', kind: 'celebration' },
  { key: 'claimed', label: 'Claimed', status: 'claimed' },
]

export default function Vouchers() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'vouchers')
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'all'
  const active = TABS.find((t) => t.key === tab)

  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claiming, setClaiming] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await vouchersApi.listVouchers({
        page, limit: PAGE_SIZE, sortBy: 'created_at', sortOrder: 'DESC',
        ...(active?.kind && { kind: active.kind }),
        ...(active?.status && { status: active.status }),
        ...(query && { code: query }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load vouchers.')
      setRows([])
    } finally { setLoading(false) }
  }, [page, active?.kind, active?.status, query])

  useEffect(() => { load() }, [load])

  const setTab = (k) => { setPage(1); setParams(k === 'all' ? {} : { tab: k }) }
  const total = pagination?.total ?? rows.length

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Voucher Management" subtitle="Welcome & Celebration discount vouchers — track unlocks and claims">
        <div className="table-search"><i className="las la-search" /><input placeholder="Search by code…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Program</th><th>Discount</th><th>Owner</th><th>Status</th><th>Claim Details</th>{canEdit && <th></th>}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="spinner" /><p>Loading vouchers…</p></div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="es-ic"><i className="las la-ticket-alt" /></div><h4>No vouchers here</h4><p>Nothing matches this filter.</p></div></td></tr>
              ) : (
                rows.map((v) => {
                  const kind = KIND_META[v.kind] || { label: v.kind, tone: 'neutral', icon: 'las la-ticket-alt' }
                  const st = STATUS_META[v.status] || { label: v.status, cls: 'badge-neutral' }
                  return (
                    <tr key={v.id}>
                      <td><code style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--ink)', background: 'var(--cream-2, var(--surface-soft))', padding: '4px 9px', borderRadius: 7, border: '1px dashed var(--border-strong)' }}>{v.code}</code></td>
                      <td><span className={`badge badge-${kind.tone}`}><i className={kind.icon} /> {kind.label}</span></td>
                      <td className="td-strong">{v.discount}{v.scope ? <span className="text-muted" style={{ fontWeight: 400 }}> · {v.scope}</span> : null}</td>
                      <td>{v.user?.name || '—'}</td>
                      <td><span className={`badge ${st.cls} dot`}>{st.label}</span></td>
                      <td>
                        {v.status === 'claimed'
                          ? <span className="text-muted">{v.claim_location || '—'}{v.claim_bill_amount ? ` · bill ${money(v.claim_bill_amount)}` : ''}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      {canEdit && (
                        <td>
                          {v.status === 'available' ? (
                            <button className="btn btn-xs btn-primary" onClick={() => setClaiming(v)}><i className="las la-hand-holding-usd" /> Claim</button>
                          ) : <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <div className="table-foot">
            <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} vouchers</span>
            <div className="pagination">
              <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
              <button className="active">{pagination?.page ?? page}</button>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
            </div>
          </div>
        )}
      </div>

      {claiming && <ClaimModal voucher={claiming} onClose={() => setClaiming(null)} onSaved={() => { setClaiming(null); load() }} />}
    </div>
  )
}

function ClaimModal({ voucher, onClose, onSaved }) {
  const [location, setLocation] = useState('')
  const [bill, setBill] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setSaving(true)
    try {
      await vouchersApi.claimVoucher(voucher.id, {
        ...(location && { location }),
        ...(bill !== '' && { bill_amount: Number(bill) }),
      })
      onSaved()
    } catch (error) { setErr(error.apiMessage || 'Could not claim voucher.'); setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head"><h3>Claim Voucher</h3><button type="button" className="icon-btn" onClick={onClose}><i className="las la-times" /></button></div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          {err && <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {err}</div>}
          <div className="flex-between" style={{ padding: '10px 13px', borderRadius: 'var(--radius)', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
            <code style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--ink)' }}>{voucher.code}</code>
            <span className="badge badge-neutral">{voucher.discount} off</span>
          </div>
          <div className="form-group">
            <label>Location <span className="text-muted">(branch)</span></label>
            <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dubai Mall" />
          </div>
          <div className="form-group">
            <label>Bill amount (AED)</label>
            <input type="number" step="0.01" min="0" className="form-control" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="320" />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Claiming…' : 'Mark Claimed'}</button>
        </div>
      </form>
    </div>
  )
}
