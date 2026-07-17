import { money } from '../config/app.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import KPICard from '../components/ui/KPICard.jsx'
import { AreaChart, DonutChart } from '../components/ui/Charts.jsx'
import { revenueSeries, statusBreakdown, menu, scopeBranches, aggregators, referralRecords } from '../data/db.js'

const refStatus = {
  rewarded: 'badge-success',
  pending: 'badge-warning',
  expired: 'badge-neutral',
}

export default function Reports() {
  const { user } = useAuth()
  const myBranches = scopeBranches(user)
  const revenue = myBranches.reduce((s, b) => s + b.revenue, 0)
  const orders = myBranches.reduce((s, b) => s + b.orders, 0)
  const aov = Math.round(revenue / (orders || 1))

  const topCats = [...menu].sort((a, b) => b.orders - a.orders).slice(0, 5)
  const maxCat = Math.max(...topCats.map((c) => c.orders))

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Reports & Analytics" subtitle="Performance insights for your operations">
        <select className="form-control btn-sm" style={{ width: 'auto', padding: '9px 38px 9px 14px', borderRadius: 'var(--radius-pill)' }}>
          <option>Last 12 months</option><option>Last 30 days</option><option>Last 7 days</option>
        </select>
        <button className="btn btn-primary btn-sm"><i className="las la-file-export" /> Export PDF</button>
      </PageHeader>

      <div className="kpi-grid stagger">
        <KPICard icon="las la-wallet" tone="green" label="Total Revenue" value={revenue} prefix="AED " trend="12.4%" spark={[30, 34, 32, 40, 44, 52, 68]} />
        <KPICard icon="las la-receipt" tone="ink" label="Total Orders" value={orders} trend="8.1%" spark={[20, 26, 22, 30, 28, 36, 44]} />
        <KPICard icon="las la-shopping-basket" tone="warn" label="Avg Order Value" value={aov} prefix="AED " trend="3.9%" spark={[70, 72, 74, 76, 78, 82, 85]} />
        <KPICard icon="las la-redo-alt" tone="grape" label="Repeat Rate" value={64} suffix="%" trend="5.0%" spark={[55, 57, 58, 60, 61, 63, 64]} />
      </div>

      <div className="dash-grid">
        <div className="section-card">
          <div className="section-head"><div><h3>Revenue vs Orders</h3><div className="sub">Trended over 12 months</div></div><span className="badge badge-success dot">Healthy growth</span></div>
          <AreaChart labels={revenueSeries.labels} series={[
            { name: 'Revenue (k)', color: '#84c168', data: revenueSeries.brand1 },
            { name: 'Orders (×10)', color: '#3b82c4', data: revenueSeries.brand2 },
          ]} />
          <div className="chart-legend">
            <span className="lg"><span className="sw" style={{ background: '#84c168' }} /> Revenue</span>
            <span className="lg"><span className="sw" style={{ background: '#3b82c4' }} /> Orders</span>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Sales by Channel</h3><div className="sub">Order distribution</div></div></div>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>
            <DonutChart segments={statusBreakdown} centerLabel="Orders" />
          </div>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="section-card">
          <div className="section-head"><div><h3>Top Selling Dishes</h3><div className="sub">By order volume</div></div></div>
          {topCats.map((c) => (
            <div className="progress-row" key={c.id}>
              <div className="pr-head"><b>{c.emoji} {c.name}</b><span>{c.orders} orders · {money(c.price)}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(c.orders / maxCat) * 100}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Branch Leaderboard</h3><div className="sub">Revenue ranking</div></div></div>
          {[...myBranches].sort((a, b) => b.revenue - a.revenue).map((b, i) => (
            <div className="rank-row" key={b.id}>
              <span className="rk-num">{i + 1}</span>
              <div className="rk-meta"><b>{b.name}</b><span>{b.orders} orders · {b.rating}★</span></div>
              <span className="rk-val">{money(b.revenue, { compact: true })}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="section-card">
          <div className="section-head"><div><h3>Aggregator Clicks</h3><div className="sub">Tap-throughs to delivery platforms</div></div><span className="badge badge-neutral">{aggregators.reduce((s, a) => s + a.clicks, 0).toLocaleString()} total</span></div>
          {(() => {
            const tracked = aggregators.filter((a) => a.clicks > 0)
            const maxClicks = Math.max(...tracked.map((a) => a.clicks), 1)
            return tracked.sort((a, b) => b.clicks - a.clicks).map((a) => (
              <div className="progress-row" key={a.name}>
                <div className="pr-head"><b><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: a.color, marginRight: 7 }} />{a.name}</b><span>{a.clicks.toLocaleString()} clicks</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(a.clicks / maxClicks) * 100}%` }} /></div>
              </div>
            ))
          })()}
        </div>

        <div className="section-card">
          <div className="section-head"><div><h3>Referral Records</h3><div className="sub">Member-get-member tracking</div></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Referrer</th><th>Referred</th><th>Date</th><th>Status</th><th>Points</th></tr></thead>
              <tbody>
                {referralRecords.map((r) => (
                  <tr key={r.id}>
                    <td><b style={{ color: 'var(--ink)' }}>{r.referrer}</b><div className="text-muted" style={{ fontSize: 11 }}>{r.code}</div></td>
                    <td>{r.referred}</td>
                    <td>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className={`badge ${refStatus[r.status]}`}>{r.status}</span></td>
                    <td className="td-strong">{r.points ? `+${r.points}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
