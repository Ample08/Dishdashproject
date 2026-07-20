import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { orderStatusMeta } from '../data/db.js'
import * as ordersApi from '../api/orders.js'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'collected', label: 'Collected' },
  { key: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 15

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)}d ago`
}

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Orders() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'orders')
  const isSuper = user.role === 'super_admin'

  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('') // debounced value actually sent

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await ordersApi.listOrders({
        page,
        limit: PAGE_SIZE,
        sortBy: 'placed_at',
        sortOrder: 'desc',
        ...(status !== 'all' && { status }),
        ...(query && { search: query }),
      })
      setOrders(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, status, query])

  useEffect(() => { load() }, [load])

  const setStatus = (s) => {
    setPage(1)
    if (s === 'all') { params.delete('status'); setParams(params) }
    else { params.set('status', s); setParams(params) }
  }

  // Run an action, then refresh the list to reflect the new status.
  const runAction = async (fn, id) => {
    setActingId(id)
    try {
      await fn()
      await load()
    } catch (err) {
      setError(err.apiMessage || 'Action failed.')
    } finally {
      setActingId(null)
    }
  }

  const accept = (o) => runAction(() => ordersApi.acceptOrder(o.id), o.id)
  const ready = (o) => runAction(() => ordersApi.markOrderReady(o.id), o.id)
  const collect = (o) => runAction(() => ordersApi.markOrderCollected(o.id), o.id)
  const cancel = (o) => {
    const reason = window.prompt(`Cancel order ${o.order_ref}? Optional reason:`)
    if (reason === null) return // user dismissed the prompt
    runAction(() => ordersApi.cancelOrder(o.id, reason || undefined), o.id)
  }

  const total = pagination?.total ?? orders.length
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Orders" subtitle={`${total} orders in ${user.scopeLabel}`}>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          <i className="las la-sync" /> Refresh
        </button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${status === f.key ? 'btn-ink' : 'btn-outline'}`}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <h3>{FILTERS.find((f) => f.key === status)?.label} Orders</h3>
          <div className="table-search">
            <i className="las la-search" />
            <input placeholder="Search order or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th><th>Customer</th>{isSuper && <th>Branch</th>}<th>Items</th><th>Payment</th><th>Prep Time</th><th>Total</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="spinner" /><p>Loading orders…</p></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="es-ic"><i className="las la-receipt" /></div>
                    <h4>No orders here</h4>
                    <p>Nothing matches this filter right now. New orders will show up live.</p>
                  </div>
                </td></tr>
              ) : (
                orders.map((o) => {
                  const st = orderStatusMeta[o.admin_status] || orderStatusMeta.new
                  const busy = actingId === o.id
                  const customer = o.user?.name || '—'
                  return (
                    <tr key={o.id}>
                      <td className="td-strong">{o.order_ref}</td>
                      <td>
                        <div className="cell-user">
                          <span className="avatar">{initials(customer)}</span>
                          <div className="cu-meta"><b>{customer}</b><span>{timeAgo(o.placed_at)}</span></div>
                        </div>
                      </td>
                      {isSuper && <td>{o.branch || o.brand_key || '—'}</td>}
                      <td>{o.item_count ?? o.items?.length ?? 0} items</td>
                      <td><span className="badge badge-neutral">{o.payment_method || '—'}</span></td>
                      <td>{o.prep_time ? <span className="badge badge-info"><i className="las la-clock" /> {o.prep_time}</span> : <span style={{ color: 'var(--muted, #9aa0a6)' }}>—</span>}</td>
                      <td className="td-strong">{money(o.total)}</td>
                      <td><span className={`badge ${st.badge}`}><i className={st.icon} /> {st.label}</span></td>
                      <td>
                        <div className="row-actions">
                          {canEdit && o.admin_status === 'new' && (
                            <button className="btn btn-xs btn-primary" disabled={busy} onClick={() => accept(o)}>Accept</button>
                          )}
                          {canEdit && o.admin_status === 'accepted' && (
                            <button className="btn btn-xs btn-primary" disabled={busy} onClick={() => ready(o)}>Mark Ready</button>
                          )}
                          {canEdit && o.admin_status === 'ready' && (
                            <button className="btn btn-xs btn-primary" disabled={busy} onClick={() => collect(o)}>Collected</button>
                          )}
                          {canEdit && ['new', 'accepted', 'ready'].includes(o.admin_status) && (
                            <button className="icon-btn" title="Cancel" disabled={busy} onClick={() => cancel(o)}><i className="las la-times" /></button>
                          )}
                          {busy && <i className="las la-spinner la-spin" />}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && orders.length > 0 && (
          <div className="table-foot">
            <span className="tf-info">Page {pagination?.page ?? page} of {totalPages} · {total} orders</span>
            <div className="pagination">
              <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <i className="las la-angle-left" />
              </button>
              <button className="active">{pagination?.page ?? page}</button>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                <i className="las la-angle-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
