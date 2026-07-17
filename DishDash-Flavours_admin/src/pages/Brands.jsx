import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { brands } from '../data/db.js'

export default function Brands() {
  const totalRevenue = brands.reduce((s, b) => s + b.revenue, 0)
  const totalBranches = brands.reduce((s, b) => s + b.branches, 0)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Organization']} title="Brands" subtitle="Every brand running on the platform">
        <button className="btn btn-outline btn-sm"><i className="las la-download" /> Export</button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> Add Brand</button>
      </PageHeader>

      <div className="kpi-grid stagger" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-store" /></span></div><div className="kpi-value">{brands.length}</div><div className="kpi-label">Total Brands</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-map-marked-alt" /></span></div><div className="kpi-value">{totalBranches}</div><div className="kpi-label">Total Branches</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-wallet" /></span></div><div className="kpi-value">{money(totalRevenue, { compact: true })}</div><div className="kpi-label">Combined Revenue</div></div>
      </div>

      <div className="entity-grid stagger mt-22">
        {brands.map((b) => (
          <div className="entity-card" key={b.id}>
            <div className={`entity-banner ${b.banner}`}>
              <div className="entity-logo" style={b.logo ? { padding: 0, overflow: 'hidden', background: '#fff' } : undefined}>
                {b.logo ? <img src={b.logo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : b.initials}
              </div>
            </div>
            <div className="entity-body">
              <div className="eb-top">
                <div>
                  <h3>{b.name}</h3>
                  <div className="eb-sub"><i className="las la-map-marker" /> {b.city} · {b.tag}</div>
                </div>
                <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-neutral'} dot`}>{b.status}</span>
              </div>
              <div className="entity-stats">
                <div className="entity-stat"><b>{b.branches}</b><span>Branches</span></div>
                <div className="entity-stat"><b>{b.staff}</b><span>Staff</span></div>
                <div className="entity-stat"><b>{b.rating}★</b><span>Rating</span></div>
              </div>
              <div className="entity-foot">
                <button className="btn btn-outline btn-sm"><i className="las la-eye" /> View</button>
                <button className="btn btn-ink btn-sm"><i className="las la-cog" /> Manage</button>
              </div>
            </div>
          </div>
        ))}

        <button className="entity-card" style={{ display: 'grid', placeItems: 'center', minHeight: 280, border: '2px dashed var(--border-strong)', background: 'var(--surface-soft)', cursor: 'pointer' }}>
          <div className="empty-state" style={{ padding: 20 }}>
            <div className="es-ic"><i className="las la-plus" /></div>
            <h4>Add a new brand</h4>
            <p>Launch another brand with its own branches, menu &amp; team.</p>
          </div>
        </button>
      </div>
    </div>
  )
}
