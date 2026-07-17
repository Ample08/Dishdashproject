import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { scopeOrders, orderStatusMeta, branchName } from '../data/db.js'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'collected', label: 'Collected' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function Orders() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [query, setQuery] = useState('')
  const isSuper = user.role === 'super_admin'
  const all = scopeOrders(user)

  const rows = useMemo(() => {
    return all.filter((o) =>
      (status === 'all' || o.status === status) &&
      (o.id.toLowerCase().includes(query.toLowerCase()) || o.customer.toLowerCase().includes(query.toLowerCase())),
    )
  }, [all, status, query])

  const setStatus = (s) => { if (s === 'all') { params.delete('status'); setParams(params) } else setParams({ status: s }) }
  const counts = (key) => key === 'all' ? all.length : all.filter((o) => o.status === key).length

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Orders" subtitle={`${all.length} orders in ${user.scopeLabel}`}>
        <button className="btn btn-outline btn-sm"><i className="las la-filter" /> Filters</button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> New Order</button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${status === f.key ? 'btn-ink' : 'btn-outline'}`}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
            <span className="badge badge-neutral" style={{ marginLeft: 2, background: status === f.key ? 'rgba(255,255,255,0.18)' : undefined, color: status === f.key ? '#fff' : undefined }}>{counts(f.key)}</span>
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h3>{FILTERS.find((f) => f.key === status)?.label} Orders</h3>
          <div className="table-search">
            <i className="las la-search" />
            <input placeholder="Search order or customer…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th>{isSuper && <th>Branch</th>}<th>Items</th><th>Type</th><th>Prep Time</th><th>Payment</th><th>Total</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const st = orderStatusMeta[o.status]
                return (
                  <tr key={o.id}>
                    <td className="td-strong">{o.id}</td>
                    <td>
                      <div className="cell-user">
                        <span className="avatar">{o.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                        <div className="cu-meta"><b>{o.customer}</b><span>{o.time}</span></div>
                      </div>
                    </td>
                    {isSuper && <td>{branchName(o.branchId)}</td>}
                    <td>{o.items} items</td>
                    <td><span className="badge badge-neutral">{o.type}</span></td>
                    <td>{o.prep ? <span className="badge badge-info"><i className="las la-clock" /> {o.prep}</span> : <span style={{ color: 'var(--muted, #9aa0a6)' }}>—</span>}</td>
                    <td><span className="badge badge-neutral">{o.pay}</span></td>
                    <td className="td-strong">{money(o.total)}</td>
                    <td><span className={`badge ${st.badge}`}><i className={st.icon} /> {st.label}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="View"><i className="las la-eye" /></button>
                        <button className="icon-btn" title="Print"><i className="las la-print" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={10}>
                  <div className="empty-state">
                    <div className="es-ic"><i className="las la-receipt" /></div>
                    <h4>No orders here</h4>
                    <p>Nothing matches this filter right now. New orders will show up live.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="table-foot">
            <span className="tf-info">Showing {rows.length} of {all.length} orders</span>
            <div className="pagination">
              <button disabled><i className="las la-angle-left" /></button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button><i className="las la-angle-right" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
