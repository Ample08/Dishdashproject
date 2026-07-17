import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { money } from '../config/app.js'
import KPICard from '../components/ui/KPICard.jsx'
import { AreaChart, DonutChart } from '../components/ui/Charts.jsx'
import {
  brands, menu, revenueSeries, ordersByDay, statusBreakdown,
  orderStatusMeta, scopeBranches, scopeOrders, scopeStaff, branchName,
} from '../data/db.js'

export default function Dashboard() {
  const { user } = useAuth()
  const myBranches = scopeBranches(user)
  const myOrders = scopeOrders(user)
  const myStaff = scopeStaff(user)
  const isSuper = user.role === 'super_admin'

  const totalRevenue = myBranches.reduce((s, b) => s + b.revenue, 0)
  const totalOrders = myBranches.reduce((s, b) => s + b.orders, 0)
  const avgRating = (myBranches.reduce((s, b) => s + b.rating, 0) / (myBranches.length || 1)).toFixed(1)

  // KPI set per role
  const kpis = isSuper
    ? [
        { icon: 'las la-wallet', tone: 'green', label: 'Total Revenue', value: totalRevenue, prefix: 'AED ', trend: '12.4%', spark: [30, 34, 32, 40, 44, 52, 68] },
        { icon: 'las la-receipt', tone: 'ink', label: 'Total Orders', value: totalOrders, trend: '8.1%', spark: [20, 26, 22, 30, 28, 36, 44] },
        { icon: 'las la-store', tone: 'grape', label: 'Active Brands', value: brands.length, trend: '2 new', spark: [1, 1, 1, 2, 2, 2, 2] },
        { icon: 'las la-map-marked-alt', tone: 'info', label: 'Branches', value: myBranches.length, trend: '4.2%', spark: [3, 3, 4, 4, 5, 6, 6] },
      ]
    : [
        { icon: 'las la-wallet', tone: 'green', label: "Today's Revenue", value: Math.round(totalRevenue / 30), prefix: 'AED ', trend: '5.4%', spark: [4, 5, 4, 6, 7, 6, 8] },
        { icon: 'las la-receipt', tone: 'ink', label: 'Orders Today', value: Math.round(totalOrders / 30), trend: '3.2%', spark: [12, 14, 13, 16, 18, 17, 20] },
        { icon: 'las la-clock', tone: 'warn', label: 'Avg Prep Time', value: 18, suffix: ' min', trend: '2 min', trendDir: 'down', spark: [22, 21, 20, 19, 19, 18, 18] },
        { icon: 'las la-star', tone: 'grape', label: 'Branch Rating', value: Number(avgRating), decimals: 1, suffix: ' ★', trend: '0.2', spark: [4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 4.9] },
      ]

  const chartSeries = isSuper
    ? [
        { name: 'Karaz', color: '#84c168', data: revenueSeries.brand1 },
        { name: 'Jade', color: '#e6a020', data: revenueSeries.brand2 },
      ]
    : [{ name: 'Orders', color: '#84c168', data: ordersByDay.values.map((v) => v / 10) }]
  const chartLabels = isSuper ? revenueSeries.labels : ordersByDay.labels

  const recentOrders = myOrders.slice(0, 6)
  const topDishes = [...menu].sort((a, b) => b.orders - a.orders).slice(0, 5)
  const topBranches = [...myBranches].sort((a, b) => b.revenue - a.revenue).slice(0, 4)

  return (
    <div className="anim-fade-in">
      <div className="page-head">
        <div className="ph-left">
          <div className="crumb"><span>Dashboard</span><i className="las la-angle-right" /><span>{user.roleMeta.name}</span></div>
          <h1>{isSuper ? 'Platform Overview' : 'Branch Overview'}</h1>
          <p>{user.scopeLabel} · live snapshot of your operations.</p>
        </div>
        <div className="ph-actions">
          <span className="live-pill"><span className="dot" /> Live</span>
          <button className="btn btn-outline btn-sm"><i className="las la-download" /> Export</button>
          <button className="btn btn-primary btn-sm"><i className="las la-plus" /> Quick Action</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid stagger">
        {kpis.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Chart + status donut */}
      <div className="dash-grid">
        <div className="section-card">
          <div className="section-head">
            <div>
              <h3>{isSuper ? 'Revenue Trend' : 'Orders This Week'}</h3>
              <div className="sub">{isSuper ? 'Last 12 months (AED, thousands)' : 'Daily order volume'}</div>
            </div>
            <span className="badge badge-success dot">+12.4% vs last period</span>
          </div>
          <AreaChart labels={chartLabels} series={chartSeries} />
          <div className="chart-legend">
            {chartSeries.map((s) => (
              <span className="lg" key={s.name}><span className="sw" style={{ background: s.color }} /> {s.name}</span>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <div><h3>Order Status</h3><div className="sub">Across {myBranches.length} branch{myBranches.length > 1 ? 'es' : ''}</div></div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}>
            <DonutChart segments={statusBreakdown} centerLabel="Orders" />
          </div>
          <div className="grid-gap" style={{ gap: 9, marginTop: 8 }}>
            {statusBreakdown.map((s) => (
              <div className="flex-between" key={s.key}>
                <span className="lg" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span className="sw" style={{ width: 11, height: 11, borderRadius: 4, background: s.color }} /> {s.label}
                </span>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{s.value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Super-admin: brand performance */}
      {isSuper && (
        <div className="section-card" style={{ marginBottom: 22 }}>
          <div className="section-head">
            <div><h3>Brand Performance</h3><div className="sub">How each brand is trending this month</div></div>
            <Link to="/brands" className="link-more">View all <i className="las la-arrow-right" /></Link>
          </div>
          <div className="grid-gap" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
            {brands.map((b) => (
              <div key={b.id} className="flex-between" style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="entity-logo" style={{ position: 'static', width: 46, height: 46, fontSize: 17 }}>{b.initials}</span>
                  <div>
                    <b style={{ fontSize: 14, color: 'var(--ink)' }}>{b.name}</b>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{b.branches} branches · {b.staff} staff</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--ink)' }}>{money(b.revenue, { compact: true })}</b>
                  <div className="badge badge-success" style={{ marginTop: 2 }}><i className="las la-star" /> {b.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders + side rankings */}
      <div className="dash-grid-3">
        <div className="table-card">
          <div className="table-toolbar">
            <h3>Recent Orders</h3>
            <span className="live-pill"><span className="dot" /> Updating live</span>
            <Link to="/orders" className="link-more" style={{ marginLeft: 'auto' }}>All orders <i className="las la-arrow-right" /></Link>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th>{isSuper && <th>Branch</th>}<th>Type</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = orderStatusMeta[o.status]
                  return (
                    <tr key={o.id}>
                      <td className="td-strong">{o.id}</td>
                      <td>{o.customer}</td>
                      {isSuper && <td>{branchName(o.branchId)}</td>}
                      <td>{o.type}</td>
                      <td className="td-strong">{money(o.total)}</td>
                      <td><span className={`badge ${st.badge}`}><i className={st.icon} /> {st.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <div><h3>{isSuper ? 'Top Branches' : 'Top Dishes'}</h3><div className="sub">By {isSuper ? 'revenue' : 'orders'}</div></div>
          </div>
          {isSuper
            ? topBranches.map((b, i) => (
                <div className="rank-row" key={b.id}>
                  <span className="rk-num">{i + 1}</span>
                  <div className="rk-meta"><b>{b.name}</b><span>{b.orders} orders</span></div>
                  <span className="rk-val">{money(b.revenue, { compact: true })}</span>
                </div>
              ))
            : topDishes.map((d, i) => (
                <div className="rank-row" key={d.id}>
                  <span className="rk-num">{i + 1}</span>
                  <span style={{ fontSize: 22 }}>{d.emoji}</span>
                  <div className="rk-meta"><b>{d.name}</b><span>{d.cat}</span></div>
                  <span className="rk-val">{d.orders}</span>
                </div>
              ))}
          <Link to={isSuper ? '/branches' : '/menu'} className="btn btn-outline btn-block btn-sm" style={{ marginTop: 14 }}>
            View {isSuper ? 'all branches' : 'full menu'}
          </Link>
        </div>
      </div>
    </div>
  )
}
