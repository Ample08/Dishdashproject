import { useEffect, useState } from 'react'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { tierBadge } from '../config/roles.js'
import * as reportsApi from '../api/reports.js'

const TIER_ORDER = ['Member', 'Bronze', 'Silver', 'Gold', 'Platinum']

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    Promise.all([
      reportsApi.reportOverview(),
      reportsApi.reportOrdersByBrand(),
      reportsApi.reportTierDistribution(),
      reportsApi.reportVoucherSummary(),
      reportsApi.reportOfferBookings(),
    ])
      .then(([overview, ordersByBrand, tiers, vouchers, offerBookings]) => {
        setData({
          overview: overview.data || {},
          ordersByBrand: ordersByBrand.data || [],
          tiers: tiers.data || {},
          vouchers: vouchers.data || [],
          offerBookings: offerBookings.data || [],
        })
      })
      .catch((err) => setError(err.apiMessage || 'Could not load reports.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <div className="empty-state"><div className="spinner" /><p>Loading reports…</p></div>
  if (error) return (
    <div className="alert alert-danger" style={{ margin: 16 }}>
      <i className="las la-exclamation-circle" /> {error}
      <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
    </div>
  )

  const o = data.overview
  const revenue = Number(o.revenueCollected || 0)
  const orderCount = o.orders?.total ?? 0
  const aov = orderCount ? Math.round(revenue / orderCount) : 0
  const tierTotal = TIER_ORDER.reduce((s, t) => s + (data.tiers[t] || 0), 0) || 1
  const brandRevenue = groupBrandRevenue(data.ordersByBrand)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Reports & Analytics" subtitle="Live performance insights across your operations">
        <button className="btn btn-outline btn-sm" onClick={load}><i className="las la-sync" /> Refresh</button>
      </PageHeader>

      <div className="kpi-grid stagger">
        <Kpi icon="las la-wallet" tone="green" label="Revenue Collected" value={money(revenue)} />
        <Kpi icon="las la-receipt" tone="ink" label="Total Orders" value={orderCount} sub={`${o.orders?.new ?? 0} new`} />
        <Kpi icon="las la-shopping-basket" tone="warn" label="Avg Order Value" value={money(aov)} />
        <Kpi icon="las la-users" tone="grape" label="Customers" value={o.users ?? 0} />
      </div>

      <div className="kpi-grid stagger" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Kpi icon="las la-calendar-check" tone="info" label="Reservations" value={o.reservations?.total ?? 0} sub={`${o.reservations?.pending ?? 0} pending`} />
        <Kpi icon="las la-concierge-bell" tone="grape" label="Open Catering Leads" value={o.cateringOpen ?? 0} />
      </div>

      <div className="dash-grid-2">
        <div className="section-card">
          <div className="section-head"><div><h3>Revenue by Brand</h3><div className="sub">From completed orders</div></div></div>
          {brandRevenue.length ? brandRevenue.map((b) => {
            const max = Math.max(...brandRevenue.map((x) => x.total), 1)
            return (
              <div className="progress-row" key={b.brand}>
                <div className="pr-head"><b>{b.brand}</b><span>{money(b.total)} · {b.count} orders</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(b.total / max) * 100}%` }} /></div>
              </div>
            )
          }) : <Empty text="No order data yet" />}
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Loyalty Tier Distribution</h3><div className="sub">Members per tier</div></div></div>
          {TIER_ORDER.filter((t) => data.tiers[t] != null).map((t) => {
            const n = data.tiers[t] || 0
            return (
              <div className="progress-row" key={t}>
                <div className="pr-head"><b><span className={`badge ${tierBadge(t)}`} style={{ marginRight: 6 }}><i className="las la-medal" /> {t}</span></b><span>{n} member{n === 1 ? '' : 's'}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(n / tierTotal) * 100}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="section-card">
          <div className="section-head"><div><h3>Voucher Summary</h3><div className="sub">By program and status</div></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Program</th><th>Status</th><th style={{ textAlign: 'right' }}>Count</th></tr></thead>
              <tbody>
                {data.vouchers.length ? data.vouchers.map((v, i) => (
                  <tr key={i}>
                    <td className="td-strong" style={{ textTransform: 'capitalize' }}>{v.kind}</td>
                    <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{v.status}</span></td>
                    <td style={{ textAlign: 'right' }} className="td-strong">{v.count}</td>
                  </tr>
                )) : <tr><td colSpan={3}><Empty text="No vouchers yet" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Experience Bookings</h3><div className="sub">By experience</div></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Experience</th><th>Status</th><th style={{ textAlign: 'right' }}>Count</th></tr></thead>
              <tbody>
                {data.offerBookings.length ? data.offerBookings.map((b, i) => (
                  <tr key={i}>
                    <td className="td-strong">{b.title || b.exp_key || '—'}</td>
                    <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{(b.status || '').replace('_', ' ')}</span></td>
                    <td style={{ textAlign: 'right' }} className="td-strong">{b.count}</td>
                  </tr>
                )) : <tr><td colSpan={3}><Empty text="No bookings yet" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// orders-by-brand returns one row per (brand, status) — fold into per-brand totals.
function groupBrandRevenue(rows) {
  const map = {}
  for (const r of rows) {
    const m = (map[r.brand_key] ||= { brand: r.brand_key, total: 0, count: 0 })
    m.total += Number(r.total || 0)
    m.count += Number(r.count || 0)
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
}

function Kpi({ icon, tone, label, value, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top"><span className={`kpi-ic ${tone}`}><i className={icon} /></span></div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}{sub ? <span className="text-muted"> · {sub}</span> : null}</div>
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-tertiary)', fontSize: 13 }}>{text}</div>
}
