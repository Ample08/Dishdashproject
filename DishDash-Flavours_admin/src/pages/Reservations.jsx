import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import * as reservationsApi from '../api/reservations.js'

// API status set (differs from the old mock): awaiting/confirmed/completed/cancelled
const STATUS_META = {
  awaiting: { label: 'Awaiting', badge: 'badge-warning' },
  confirmed: { label: 'Confirmed', badge: 'badge-success' },
  completed: { label: 'Completed', badge: 'badge-neutral' },
  cancelled: { label: 'Cancelled', badge: 'badge-danger' },
}
const STATUS_OPTIONS = Object.keys(STATUS_META)
const FILTERS = ['all', ...STATUS_OPTIONS]

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Reservations() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'reservations')
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  // Small dataset — fetch a wide page and filter client-side so the KPI
  // counts stay accurate without juggling pagination.
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await reservationsApi.listReservations({ page: 1, limit: 100, sortBy: 'created_at', sortOrder: 'DESC' })
      setRows(res.data || [])
    } catch (err) {
      setError(err.apiMessage || 'Could not load reservations.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setFilter = (s) => setParams(s === 'all' ? {} : { status: s })

  const changeStatus = async (r, next) => {
    if (next === r.status) return
    setBusyId(r.id)
    try { await reservationsApi.setReservationStatus(r.id, next); await load() }
    catch (err) { setError(err.apiMessage || 'Could not update status.') }
    finally { setBusyId(null) }
  }

  const editNote = async (r) => {
    const note = window.prompt(`Internal note for ${r.booking_ref}:`, r.internal_note || '')
    if (note === null) return
    setBusyId(r.id)
    try { await reservationsApi.setReservationNote(r.id, note); await load() }
    catch (err) { setError(err.apiMessage || 'Could not save note.') }
    finally { setBusyId(null) }
  }

  const visible = useMemo(
    () => (status === 'all' ? rows : rows.filter((r) => r.status === status)),
    [rows, status],
  )

  const counts = useMemo(() => ({
    total: rows.length,
    guests: rows.reduce((s, r) => s + (r.guests || 0), 0),
    awaiting: rows.filter((r) => r.status === 'awaiting').length,
    confirmed: rows.filter((r) => r.status === 'confirmed').length,
  }), [rows])

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Reservations" subtitle={`Table bookings for ${user.scopeLabel}`}>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}><i className="las la-sync" /> Refresh</button>
      </PageHeader>

      <div className="kpi-grid stagger">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-calendar-day" /></span></div><div className="kpi-value">{counts.total}</div><div className="kpi-label">Total Bookings</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-users" /></span></div><div className="kpi-value">{counts.guests}</div><div className="kpi-label">Total Guests</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-clock" /></span></div><div className="kpi-value">{counts.awaiting}</div><div className="kpi-label">Awaiting Confirm</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-check-double" /></span></div><div className="kpi-value">{counts.confirmed}</div><div className="kpi-label">Confirmed</div></div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: '16px 0' }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0' }}>
        {FILTERS.map((f) => (
          <button key={f} className={`btn btn-sm ${status === f ? 'btn-ink' : 'btn-outline'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : STATUS_META[f].label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-toolbar"><h3>{status === 'all' ? 'All' : STATUS_META[status].label} Reservations</h3></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Ref</th><th>Guest</th><th>Date &amp; Time</th><th>Guests</th><th>Branch</th><th>Seating</th><th>Status</th>{canEdit && <th></th>}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="spinner" /><p>Loading reservations…</p></div></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="es-ic"><i className="las la-calendar-check" /></div><h4>No reservations here</h4><p>Nothing matches this filter right now.</p></div></td></tr>
              ) : (
                visible.map((r) => {
                  const st = STATUS_META[r.status] || { label: r.status, badge: 'badge-neutral' }
                  const busy = busyId === r.id
                  const guest = r.user?.name || r.name || '—'
                  return (
                    <tr key={r.id}>
                      <td className="td-strong">{r.booking_ref}</td>
                      <td>
                        <div className="cell-user">
                          <span className="avatar">{initials(guest)}</span>
                          <div className="cu-meta"><b>{guest}</b><span>{r.user?.phone || ''}</span></div>
                        </div>
                      </td>
                      <td>{r.date_full || r.date_label} · {r.time_label}</td>
                      <td className="td-strong">{r.guests}</td>
                      <td>{r.branch_name || r.branch_key || '—'}</td>
                      <td>{r.seating_label || '—'}</td>
                      <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                      {canEdit && (
                        <td>
                          <div className="row-actions" style={{ alignItems: 'center' }}>
                            <select
                              className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                              value={r.status} disabled={busy} onChange={(e) => changeStatus(r, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                            </select>
                            <button className="icon-btn" title="Internal note" disabled={busy} onClick={() => editNote(r)}>
                              <i className={r.internal_note ? 'las la-comment-dots' : 'las la-comment'} />
                            </button>
                            {busy && <i className="las la-spinner la-spin" />}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
