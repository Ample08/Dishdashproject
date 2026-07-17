import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { scopeReservations, reservationStatusMeta, branchName } from '../data/db.js'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
}

export default function Reservations() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'list' ? 'list' : 'calendar'
  const rows = scopeReservations(user)
  const isSuper = user.role === 'super_admin'

  const byDate = useMemo(() => {
    const map = {}
    rows.forEach((r) => { (map[r.date] ||= []).push(r) })
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)))
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  const counts = {
    today: rows.filter((r) => r.date === '2026-06-29').length,
    guests: rows.reduce((s, r) => s + r.guests, 0),
    confirmed: rows.filter((r) => r.status === 'confirmed').length,
    pending: rows.filter((r) => r.status === 'pending').length,
  }

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Reservations" subtitle={`Table bookings for ${user.scopeLabel}`}>
        <div className="role-switch">
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setParams({})}><i className="las la-calendar" /> Calendar</button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setParams({ view: 'list' })}><i className="las la-list" /> List</button>
        </div>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> New Booking</button>
      </PageHeader>

      <div className="kpi-grid stagger">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-calendar-day" /></span></div><div className="kpi-value">{counts.today}</div><div className="kpi-label">Today's Bookings</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-users" /></span></div><div className="kpi-value">{counts.guests}</div><div className="kpi-label">Total Guests</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-clock" /></span></div><div className="kpi-value">{counts.pending}</div><div className="kpi-label">Awaiting Confirm</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-check-double" /></span></div><div className="kpi-value">{counts.confirmed}</div><div className="kpi-label">Confirmed</div></div>
      </div>

      {view === 'calendar' ? (
        <div className="grid-gap" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', display: 'grid' }}>
          {byDate.map(([date, list]) => (
            <div className="section-card" key={date}>
              <div className="section-head" style={{ marginBottom: 14 }}>
                <div><h3 style={{ fontSize: 16 }}>{fmtDate(date)}</h3><div className="sub">{list.length} booking{list.length > 1 ? 's' : ''} · {list.reduce((s, r) => s + r.guests, 0)} guests</div></div>
              </div>
              <div className="grid-gap" style={{ gap: 10 }}>
                {list.map((r) => {
                  const st = reservationStatusMeta[r.status]
                  return (
                    <div key={r.id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
                      <div style={{ textAlign: 'center', minWidth: 48 }}>
                        <b style={{ fontFamily: 'Playfair Display', fontSize: 15, color: 'var(--ink)', display: 'block' }}>{r.time}</b>
                        <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{r.table}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex-between">
                          <b style={{ fontSize: 13, color: 'var(--ink)' }}>{r.name}</b>
                          <span className={`badge ${st.badge}`} style={{ fontSize: 10 }}>{st.label}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          <i className="las la-user-friends" /> {r.guests} guests{isSuper ? ` · ${branchName(r.branchId)}` : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-toolbar"><h3>All Reservations</h3><div className="table-search"><i className="las la-search" /><input placeholder="Search guest…" /></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Guest</th><th>Date &amp; Time</th><th>Guests</th><th>Table</th>{isSuper && <th>Branch</th>}<th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const st = reservationStatusMeta[r.status]
                  return (
                    <tr key={r.id}>
                      <td className="td-strong">{r.id}</td>
                      <td><div className="cell-user"><span className="avatar">{r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span><div className="cu-meta"><b>{r.name}</b><span>{r.phone}</span></div></div></td>
                      <td>{fmtDate(r.date)} · {r.time}</td>
                      <td className="td-strong">{r.guests}</td>
                      <td>{r.table}</td>
                      {isSuper && <td>{branchName(r.branchId)}</td>}
                      <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                      <td><div className="row-actions"><button className="icon-btn"><i className="las la-check" /></button><button className="icon-btn"><i className="las la-ellipsis-h" /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
