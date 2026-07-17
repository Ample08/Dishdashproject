import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { APP_NAME } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { aggregators } from '../data/db.js'
import { PREP_TIME_OPTIONS } from '../data/db.js'

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on}
      style={{ width: 44, height: 25, borderRadius: 999, padding: 3, background: on ? 'var(--pistachio)' : 'var(--border-strong)', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ display: 'block', width: 19, height: 19, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transform: on ? 'translateX(19px)' : 'translateX(0)', transition: 'transform 0.2s var(--ease)' }} />
    </button>
  )
}

const TABS = [
  { key: 'profile', label: 'Profile', icon: 'las la-store' },
  { key: 'order', label: 'Order & Prep', icon: 'las la-clock' },
  { key: 'aggregators', label: 'Aggregators', icon: 'las la-link' },
  { key: 'notifications', label: 'Notifications', icon: 'las la-bell' },
]

const aggStatus = {
  connected: { cls: 'badge-success', label: 'Connected' },
  pending: { cls: 'badge-warning', label: 'Pending' },
  disconnected: { cls: 'badge-neutral', label: 'Not linked' },
}

export default function Settings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const [toggles, setToggles] = useState({ orders: true, sound: true, marketing: false, reviews: true, lowstock: true })
  const set = (k) => (v) => setToggles((t) => ({ ...t, [k]: v }))

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['System']} title="Settings" subtitle="Configure your restaurant profile, integrations and preferences">
        <button className="btn btn-primary btn-sm"><i className="las la-save" /> Save Changes</button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setTab(t.key)}><i className={t.icon} /> {t.label}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="dash-grid-2">
          <div className="section-card">
            <div className="section-head"><div><h3>Restaurant Profile</h3><div className="sub">Public details for {APP_NAME}</div></div></div>
            <div className="form-group"><label>Restaurant Name</label><input className="form-control" defaultValue={APP_NAME} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group"><label>Contact Email</label><input className="form-control" defaultValue={user.email} /></div>
              <div className="form-group"><label>Phone</label><input className="form-control" defaultValue="+971 4 123 4567" /></div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Address</label><input className="form-control" defaultValue="Marina Walk, Dubai, UAE" /></div>
          </div>
          <div className="section-card">
            <div className="section-head"><div><h3>Brand &amp; Location Config</h3><div className="sub">Defaults applied to new branches</div></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group"><label>Currency</label><select className="form-control"><option>AED — UAE Dirham</option><option>SAR — Saudi Riyal</option><option>INR — Indian Rupee</option></select></div>
              <div className="form-group"><label>Timezone</label><select className="form-control"><option>GST (UTC+4)</option><option>AST (UTC+3)</option><option>IST (UTC+5:30)</option></select></div>
              <div className="form-group"><label>VAT</label><input className="form-control" defaultValue="5%" /></div>
              <div className="form-group"><label>Service Charge</label><input className="form-control" defaultValue="10%" /></div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Brand Theme Colour</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#9ed387', '#e6a020', '#3b82c4', '#8b6fc7', '#e5484d'].map((c, i) => (
                  <span key={c} style={{ width: 34, height: 34, borderRadius: 9, background: c, cursor: 'pointer', border: i === 0 ? '2px solid var(--ink)' : '2px solid transparent' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'order' && (
        <div className="dash-grid-2">
          <div className="section-card">
            <div className="section-head"><div><h3>Order Settings</h3><div className="sub">Pickup &amp; dine-in only — no delivery</div></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group"><label>Min Order Value</label><input className="form-control" defaultValue="AED 25" /></div>
              <div className="form-group"><label>Order Types</label><select className="form-control"><option>Pickup + Dine-in</option><option>Pickup only</option><option>Dine-in only</option></select></div>
              <div className="form-group"><label>Auto-accept New Orders</label><select className="form-control"><option>Manual (staff accepts)</option><option>Auto-accept</option></select></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label>Cancellation Window</label><input className="form-control" defaultValue="Before Accepted" /></div>
            </div>
          </div>
          <div className="section-card">
            <div className="section-head"><div><h3>Preparation Time</h3><div className="sub">Configurable prep-time buckets shown to guests</div></div></div>
            {[
              { label: 'Pickup', def: PREP_TIME_OPTIONS[0], icon: 'las la-shopping-bag' },
              { label: 'Dine-in', def: PREP_TIME_OPTIONS[0], icon: 'las la-utensils' },
              { label: 'Peak Hours', def: PREP_TIME_OPTIONS[1], icon: 'las la-fire' },
              { label: 'Catering', def: '24 hrs', icon: 'las la-concierge-bell' },
            ].map((p) => (
              <div className="flex-between" key={p.label} style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}><i className={p.icon} style={{ fontSize: 18, color: 'var(--text-tertiary)' }} /> {p.label}</span>
                {p.label === 'Catering'
                  ? <input className="form-control" defaultValue={p.def} style={{ width: 130, padding: '8px 12px', textAlign: 'center' }} />
                  : <select className="form-control" defaultValue={p.def} style={{ width: 130, padding: '8px 12px' }}>{PREP_TIME_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'aggregators' && (
        <div className="section-card">
          <div className="section-head"><div><h3>Aggregator Links</h3><div className="sub">Connect your delivery-platform storefronts</div></div><button className="btn btn-outline btn-sm"><i className="las la-plus" /> Add Platform</button></div>
          <div className="grid-gap" style={{ gap: 12 }}>
            {aggregators.map((a) => {
              const st = aggStatus[a.status]
              return (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-soft)' }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: a.color, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>{a.name[0]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex-between"><b style={{ fontSize: 14, color: 'var(--ink)' }}>{a.name}</b><span className={`badge ${st.cls} dot`}>{st.label}</span></div>
                    <input className="form-control" defaultValue={a.url} placeholder="Paste storefront URL…" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12.5 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="dash-grid-2">
          <div className="section-card">
            <div className="section-head"><div><h3>Alerts</h3><div className="sub">What you get pinged about</div></div></div>
            {[
              { k: 'orders', label: 'New order alerts', icon: 'las la-receipt' },
              { k: 'sound', label: 'Order sound', icon: 'las la-volume-up' },
              { k: 'reviews', label: 'New reviews', icon: 'las la-star' },
              { k: 'lowstock', label: 'Low stock warnings', icon: 'las la-box' },
              { k: 'marketing', label: 'Marketing emails', icon: 'las la-bullhorn' },
            ].map((row) => (
              <div className="flex-between" key={row.k} style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}><i className={row.icon} style={{ fontSize: 18, color: 'var(--text-tertiary)' }} /> {row.label}</span>
                <Toggle on={toggles[row.k]} onChange={set(row.k)} />
              </div>
            ))}
          </div>
          <div className="section-card">
            <div className="section-head"><div><h3>Notification Templates</h3><div className="sub">Messages sent to customers</div></div></div>
            {[
              { t: 'OTP / Login', d: 'Your Flavours code is {code}', icon: 'las la-key' },
              { t: 'Order Accepted', d: 'Order {id} accepted — ready in {prep} 🍳', icon: 'las la-check-circle' },
              { t: 'Ready for Pickup', d: 'Order {id} is ready — collect it at the counter 🛍️', icon: 'las la-shopping-bag' },
              { t: 'Reservation', d: 'Table booked for {guests} at {time} ✨', icon: 'las la-calendar-check' },
              { t: 'Loyalty Reward', d: 'You earned {points} points 🎉', icon: 'las la-medal' },
            ].map((tpl) => (
              <div className="flex-between" key={tpl.t} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <span className="kpi-ic green" style={{ width: 36, height: 36, fontSize: 16, flexShrink: 0 }}><i className={tpl.icon} /></span>
                  <div style={{ minWidth: 0 }}><b style={{ fontSize: 13, color: 'var(--ink)', display: 'block' }}>{tpl.t}</b><span className="text-muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{tpl.d}</span></div>
                </div>
                <button className="icon-btn"><i className="las la-pen" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
