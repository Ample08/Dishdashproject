import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { money } from '../config/app.js'
import KPICard from '../components/ui/KPICard.jsx'
import { DonutChart } from '../components/ui/Charts.jsx'
import { orderStatusMeta } from '../data/db.js'
import * as reportsApi from '../api/reports.js'
import * as ordersApi from '../api/orders.js'

const STATUS_COLOR = {
  new: '#e6a020', accepted: '#3b82c4', ready: '#8b6fc7', collected: '#9ed387', cancelled: '#e5484d',
}

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    // allSettled so one flaky endpoint doesn't blank the whole dashboard —
    // render whatever succeeds; only error out if everything fails.
    Promise.allSettled([
      reportsApi.reportOverview(),
      reportsApi.reportOrdersByBrand(),
      ordersApi.listOrders({ page: 1, limit: 6, sortBy: 'placed_at', sortOrder: 'desc' }),
    ])
      .then(([overview, byBrand, recent]) => {
        if ([overview, byBrand, recent].every((r) => r.status === 'rejected')) {
          setError(overview.reason?.apiMessage || 'Could not load the dashboard.')
          return
        }
        setData({
          overview: overview.status === 'fulfilled' ? overview.value.data || {} : {},
          byBrand: byBrand.status === 'fulfilled' ? byBrand.value.data || [] : [],
          recent: recent.status === 'fulfilled' ? recent.value.data || [] : [],
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <div className="empty-state"><div className="spinner" /><p>Loading dashboard…</p></div>
  if (error) return (
    <div className="alert alert-danger" style={{ margin: 16 }}>
      <i className="las la-exclamation-circle" /> {error}
      <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
    </div>
  )

  const o = data.overview
  const revenue = Number(o.revenueCollected || 0)
  const orderCount = o.orders?.total ?? 0

  // Aggregate orders-by-brand into a status donut + per-brand revenue.
  const statusAgg = {}
  const brandAgg = {}
  for (const r of data.byBrand) {
    statusAgg[r.admin_status] = (statusAgg[r.admin_status] || 0) + Number(r.count || 0)
    const b = (brandAgg[r.brand_key] ||= { brand: r.brand_key, revenue: 0, orders: 0 })
    b.revenue += Number(r.total || 0)
    b.orders += Number(r.count || 0)
  }
  const segments = Object.entries(statusAgg).map(([key, value]) => ({
    key, value, label: orderStatusMeta[key]?.label || key, color: STATUS_COLOR[key] || '#9aa0a6',
  }))
  const brands = Object.values(brandAgg).sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="anim-fade-in">
      <div className="page-head">
        <div className="ph-left">
          <div className="crumb"><span>Dashboard</span><i className="las la-angle-right" /><span>{user.roleMeta.name}</span></div>
          <h1>Overview</h1>
          <p>{user.scopeLabel} · live snapshot of your operations.</p>
        </div>
        <div className="ph-actions">
          <span className="live-pill"><span className="dot" /> Live</span>
          <button className="btn btn-outline btn-sm" onClick={load}><i className="las la-sync" /> Refresh</button>
        </div>
      </div>

      <div className="kpi-grid stagger">
        <KPICard icon="las la-wallet" tone="green" label="Revenue Collected" value={revenue} prefix="AED " />
        <KPICard icon="las la-receipt" tone="ink" label="Total Orders" value={orderCount} />
        <KPICard icon="las la-users" tone="grape" label="Customers" value={o.users ?? 0} />
        <KPICard icon="las la-concierge-bell" tone="info" label="Open Catering Leads" value={o.cateringOpen ?? 0} />
      </div>

      <div className="dash-grid">
        <div className="section-card">
          <div className="section-head">
            <div><h3>Reservations</h3><div className="sub">Table bookings snapshot</div></div>
            <Link to="/reservations" className="link-more">View all <i className="las la-arrow-right" /></Link>
          </div>
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-calendar-check" /></span></div><div className="kpi-value">{o.reservations?.total ?? 0}</div><div className="kpi-label">Total Bookings</div></div>
            <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-clock" /></span></div><div className="kpi-value">{o.reservations?.pending ?? 0}</div><div className="kpi-label">Awaiting Confirm</div></div>
          </div>
          <div className="flex-between" style={{ marginTop: 14, padding: '10px 13px', borderRadius: 'var(--radius)', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}><i className="las la-receipt" /> New orders waiting</span>
            <b style={{ color: 'var(--ink)' }}>{o.orders?.new ?? 0}</b>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Order Status</h3><div className="sub">By current stage</div></div></div>
          {segments.length ? (
            <>
              <div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                <DonutChart segments={segments} centerLabel="Orders" />
              </div>
              <div className="grid-gap" style={{ gap: 9, marginTop: 8 }}>
                {segments.map((s) => (
                  <div className="flex-between" key={s.key}>
                    <span className="lg" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <span className="sw" style={{ width: 11, height: 11, borderRadius: 4, background: s.color }} /> {s.label}
                    </span>
                    <b style={{ fontSize: 13, color: 'var(--ink)' }}>{s.value}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-tertiary)', fontSize: 13 }}>No orders yet</div>
          )}
        </div>
      </div>

      {brands.length > 0 && (
        <div className="section-card" style={{ marginBottom: 22 }}>
          <div className="section-head">
            <div><h3>Revenue by Brand</h3><div className="sub">From completed orders</div></div>
            <Link to="/reports" className="link-more">Reports <i className="las la-arrow-right" /></Link>
          </div>
          <div className="grid-gap" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
            {brands.map((b) => (
              <div key={b.brand} className="flex-between" style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="entity-logo" style={{ position: 'static', width: 46, height: 46, fontSize: 15 }}>{initials(b.brand)}</span>
                  <div><b style={{ fontSize: 14, color: 'var(--ink)' }}>{b.brand}</b><div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{b.orders} orders</div></div>
                </div>
                <b style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--ink)' }}>{money(b.revenue, { compact: true })}</b>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <h3>Recent Orders</h3>
          <Link to="/orders" className="link-more" style={{ marginLeft: 'auto' }}>All orders <i className="las la-arrow-right" /></Link>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Brand</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {data.recent.length ? data.recent.map((o) => {
                const st = orderStatusMeta[o.admin_status] || orderStatusMeta.new
                return (
                  <tr key={o.id}>
                    <td className="td-strong">{o.order_ref}</td>
                    <td>{o.user?.name || '—'}</td>
                    <td>{o.branch || o.brand_key || '—'}</td>
                    <td>{o.item_count ?? o.items?.length ?? 0}</td>
                    <td className="td-strong">{money(o.total)}</td>
                    <td><span className={`badge ${st.badge}`}><i className={st.icon} /> {st.label}</span></td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={6}><div className="empty-state"><div className="es-ic"><i className="las la-receipt" /></div><h4>No orders yet</h4></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
