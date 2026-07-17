import { money } from '../config/app.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { scopeBranches, brandForBranch } from '../data/db.js'

const statusBadge = {
  open: { cls: 'badge-success', label: 'Open' },
  busy: { cls: 'badge-warning', label: 'Busy' },
  closed: { cls: 'badge-neutral', label: 'Closed' },
}

export default function Branches() {
  const { user } = useAuth()
  // Catering-only brands (e.g. Bait Um Abdallah) have their own section — not listed as branches.
  const myBranches = scopeBranches(user).filter((b) => !brandForBranch(b)?.catering)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Organization']} title="Branches" subtitle={`${myBranches.length} branches in ${user.scopeLabel}`}>
        <button className="btn btn-outline btn-sm"><i className="las la-th-list" /> List View</button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> Add Branch</button>
      </PageHeader>

      <div className="entity-grid stagger">
        {myBranches.map((b) => {
          const st = statusBadge[b.status]
          const brand = brandForBranch(b)
          return (
            <div className="entity-card" key={b.id}>
              <div
                className={`entity-banner ${b.banner}`}
                style={b.photo ? { backgroundImage: `linear-gradient(180deg, rgba(28,35,48,0.05), rgba(28,35,48,0.45)), url(${b.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="entity-logo" style={brand?.logo ? { padding: 0, overflow: 'hidden', background: '#fff' } : undefined}>
                  {brand?.logo ? <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="las la-store-alt" style={{ fontSize: 26 }} />}
                </div>
              </div>
              <div className="entity-body">
                <div className="eb-top">
                  <div>
                    <h3>{b.name}</h3>
                    <div className="eb-sub"><i className="las la-map-marker" /> {b.area}</div>
                    {brand && <div className="eb-sub" style={{ marginTop: 2 }}><i className="las la-utensils" /> {brand.cuisine}</div>}
                    {b.phone && <div className="eb-sub" style={{ marginTop: 2 }}><i className="las la-phone" /> {b.phone}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge ${st.cls} dot`}>{st.label}</span>
                    <span className={`badge ${b.active ? 'badge-success' : 'badge-neutral'}`} title={b.active ? 'Accepting orders' : 'Not accepting orders'}>
                      <i className={`las ${b.active ? 'la-toggle-on' : 'la-toggle-off'}`} /> {b.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="eb-sub" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '10px 0 2px' }}>
                  <span><i className="las la-clock" /> {b.hours}</span>
                  <span><i className="las la-bolt" /> Max {b.maxConcurrent} concurrent</span>
                  <span title={`${b.gps.lat}, ${b.gps.lng}`}><i className="las la-map-marked-alt" /> {b.gps.lat.toFixed(4)}, {b.gps.lng.toFixed(4)}</span>
                </div>
                <div className="entity-stats">
                  <div className="entity-stat"><b>{money(b.revenue, { compact: true }).replace('AED ', '')}</b><span>Revenue</span></div>
                  <div className="entity-stat"><b>{b.staff}</b><span>Staff</span></div>
                  <div className="entity-stat"><b>{b.rating}★</b><span>Rating</span></div>
                </div>
                <div className="entity-foot">
                  <button className="btn btn-outline btn-sm"><i className="las la-chart-line" /> Stats</button>
                  <button className="btn btn-ink btn-sm"><i className="las la-cog" /> Manage</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
