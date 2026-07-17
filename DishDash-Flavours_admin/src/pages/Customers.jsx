import { useMemo, useState } from 'react'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import {
  customers, orders, reservations, loyaltyMembers, vouchers,
  orderStatusMeta, reservationStatusMeta, loyaltyTiers, effectiveTier,
} from '../data/db.js'

const custStatus = {
  vip: { cls: 'badge-grape', label: 'VIP', icon: 'las la-crown' },
  active: { cls: 'badge-success', label: 'Active' },
  new: { cls: 'badge-info', label: 'New' },
  blocked: { cls: 'badge-danger', label: 'Blocked' },
}

export default function Customers() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const rows = useMemo(() => customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.mobile.includes(query),
  ), [query])

  const vip = customers.filter((c) => c.status === 'vip').length
  const spend = customers.reduce((s, c) => s + c.spent, 0)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Customers / CRM" subtitle="Search guests and dive into their full history">
        <button className="btn btn-outline btn-sm"><i className="las la-download" /> Export</button>
        <button className="btn btn-primary btn-sm"><i className="las la-paper-plane" /> Send Offer</button>
      </PageHeader>

      <div className="kpi-grid stagger" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-user-friends" /></span></div><div className="kpi-value">{customers.length}</div><div className="kpi-label">Total Customers</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-crown" /></span></div><div className="kpi-value">{vip}</div><div className="kpi-label">VIP Members</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-coins" /></span></div><div className="kpi-value">{money(spend, { compact: true })}</div><div className="kpi-label">Lifetime Spend</div></div>
      </div>

      <div className="table-card mt-22">
        <div className="table-toolbar">
          <h3>All Customers</h3>
          <div className="table-search"><i className="las la-search" /><input placeholder="Search by name or number…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Mobile</th><th>City</th><th>Orders</th><th>Spent</th><th>Last Order</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((c) => {
                const st = custStatus[c.status]
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td><div className="cell-user"><span className="avatar">{c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span><div className="cu-meta"><b>{c.name}</b><span>Customer #{c.id}</span></div></div></td>
                    <td>{c.mobile}</td>
                    <td>{c.city}</td>
                    <td className="td-strong">{c.orders}</td>
                    <td className="td-strong">{money(c.spent)}</td>
                    <td>{c.last}</td>
                    <td><span className={`badge ${st.cls}`}>{st.icon && <i className={st.icon} />} {st.label}</span></td>
                    <td><button className="icon-btn"><i className="las la-angle-right" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function CustomerDrawer({ customer, onClose }) {
  const [tab, setTab] = useState('overview')
  const cOrders = orders.filter((o) => o.customer === customer.name)
  const cRes = reservations.filter((r) => r.name === customer.name)
  const member = loyaltyMembers.find((m) => m.name === customer.name)
  const cVouchers = vouchers.filter((v) => v.claimedBy === customer.name)
  const st = custStatus[customer.status]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: `Orders (${cOrders.length})` },
    { key: 'reservations', label: `Reservations (${cRes.length})` },
    { key: 'loyalty', label: 'Loyalty' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyItems: 'end', padding: 0 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, height: '100vh', maxHeight: '100vh', borderRadius: 0, animation: 'slideInRight 0.3s var(--ease) both' }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span className="avatar" style={{ width: 48, height: 48, fontSize: 17 }}>{customer.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
            <div>
              <h3 style={{ fontSize: 18 }}>{customer.name}</h3>
              <div className="text-muted" style={{ fontSize: 12 }}>{customer.mobile}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>

        <div className="modal-body" style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span className={`badge ${st.cls}`}>{st.icon && <i className={st.icon} />} {st.label}</span>
            {member && <span className={`badge ${loyaltyTiers[effectiveTier(member)]}`}><i className="las la-medal" /> {effectiveTier(member)}</span>}
            <span className="badge badge-neutral"><i className="las la-map-marker" /> {customer.city}</span>
          </div>

          <div className="entity-stats" style={{ marginTop: 16, marginBottom: 18 }}>
            <div className="entity-stat"><b>{customer.orders}</b><span>Orders</span></div>
            <div className="entity-stat"><b>{money(customer.spent, { compact: true }).replace('AED ', '')}</b><span>Spent</span></div>
            <div className="entity-stat"><b>{member ? member.points.toLocaleString() : 0}</b><span>Points</span></div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-ghost'}`} onClick={() => setTab(t.key)} style={{ padding: '6px 11px', fontSize: 11.5 }}>{t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid-gap" style={{ gap: 11 }}>
              <InfoRow icon="las la-shopping-bag" label="Total Orders" value={`${customer.orders} orders`} />
              <InfoRow icon="las la-wallet" label="Lifetime Spend" value={money(customer.spent)} />
              <InfoRow icon="las la-clock" label="Last Order" value={customer.last} />
              <InfoRow icon="las la-ticket-alt" label="Vouchers Claimed" value={`${cVouchers.length}`} />
              <InfoRow icon="las la-calendar-check" label="Reservations" value={`${cRes.length}`} />
              {customer.dob && <InfoRow icon="las la-birthday-cake" label="Date of Birth" value={new Date(customer.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />}
              {customer.preferredContact && <InfoRow icon="las la-comment-dots" label="Preferred Contact" value={customer.preferredContact} />}
              {customer.referralCode && <InfoRow icon="las la-hashtag" label="Referral Code" value={customer.referralCode} />}
              {customer.referredBy && <InfoRow icon="las la-user-friends" label="Referred By" value={customer.referredBy} />}
              {customer.welcomeVoucher && <InfoRow icon="las la-gift" label="Welcome Voucher" value={customer.welcomeVoucher.charAt(0).toUpperCase() + customer.welcomeVoucher.slice(1)} />}
            </div>
          )}

          {tab === 'orders' && (
            <div className="grid-gap" style={{ gap: 0 }}>
              {cOrders.length ? cOrders.map((o) => {
                const os = orderStatusMeta[o.status]
                return (
                  <div className="order-mini" key={o.id}>
                    <span className="om-ic"><i className="las la-receipt" /></span>
                    <div className="om-meta"><b>{o.id} · {o.type}</b><span>{o.items} items · {o.time}</span></div>
                    <div style={{ textAlign: 'right' }}><div className="om-amt">{money(o.total)}</div><span className={`badge ${os.badge}`} style={{ fontSize: 10 }}>{os.label}</span></div>
                  </div>
                )
              }) : <Empty text="No orders yet" />}
            </div>
          )}

          {tab === 'reservations' && (
            <div className="grid-gap" style={{ gap: 0 }}>
              {cRes.length ? cRes.map((r) => {
                const rs = reservationStatusMeta[r.status]
                return (
                  <div className="order-mini" key={r.id}>
                    <span className="om-ic"><i className="las la-calendar-check" /></span>
                    <div className="om-meta"><b>{r.id} · Table {r.table}</b><span>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {r.time} · {r.guests} guests</span></div>
                    <span className={`badge ${rs.badge}`} style={{ fontSize: 10 }}>{rs.label}</span>
                  </div>
                )
              }) : <Empty text="No reservations yet" />}
            </div>
          )}

          {tab === 'loyalty' && (
            member ? (
              <div className="grid-gap" style={{ gap: 11 }}>
                <InfoRow icon="las la-medal" label="Tier" value={effectiveTier(member)} />
                <InfoRow icon="las la-star" label="Points Balance" value={member.points.toLocaleString()} />
                <InfoRow icon="las la-shopping-bag" label="Lifetime Orders" value={member.orders} />
                <InfoRow icon="las la-calendar" label="Member Since" value={new Date(member.joined).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
              </div>
            ) : <Empty text="Not a loyalty member yet" />
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm"><i className="las la-paper-plane" /> Message</button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex-between" style={{ padding: '10px 13px', borderRadius: 'var(--radius)', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}><i className={icon} style={{ fontSize: 17, color: 'var(--text-tertiary)' }} /> {label}</span>
      <b style={{ fontSize: 13, color: 'var(--ink)' }}>{value}</b>
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)', fontSize: 13 }}><i className="las la-folder-open" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />{text}</div>
}
