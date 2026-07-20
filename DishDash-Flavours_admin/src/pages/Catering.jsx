import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import * as cateringApi from '../api/catering.js'
import * as staffApi from '../api/staff.js'

// Real backend status vocabulary (the live data uses "awaiting", not the
// spec's "new"). Order defines the board columns / pipeline progression.
const cateringStages = [
  { key: 'awaiting', label: 'Awaiting', badge: 'badge-info', icon: 'las la-inbox' },
  { key: 'contacted', label: 'Contacted', badge: 'badge-grape', icon: 'las la-phone' },
  { key: 'quoted', label: 'Quoted', badge: 'badge-warning', icon: 'las la-file-invoice-dollar' },
  { key: 'confirmed', label: 'Confirmed', badge: 'badge-pistachio', icon: 'las la-handshake' },
  { key: 'completed', label: 'Completed', badge: 'badge-success', icon: 'las la-check-circle' },
  { key: 'cancelled', label: 'Cancelled', badge: 'badge-danger', icon: 'las la-times-circle' },
]

const stageMap = Object.fromEntries(cateringStages.map((s) => [s.key, s]))
const STATUS_OPTIONS = cateringStages.map((s) => s.key)

function fmtDate(label) {
  return label || '—'
}

export default function Catering() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'catering')
  const [view, setView] = useState('board') // 'board' | 'table'
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const [rows, setRows] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  // Board view needs every lead grouped by stage, so fetch wide and filter client-side.
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await cateringApi.listCatering({ page: 1, limit: 100, sortBy: 'created_at', sortOrder: 'DESC' })
      setRows(res.data || [])
    } catch (err) {
      setError(err.apiMessage || 'Could not load catering inquiries.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Staff list powers the "assign to" dropdown (assigned_to is an admin id).
  useEffect(() => {
    if (!canEdit) return
    staffApi.listStaff({ page: 1, limit: 100 })
      .then((res) => setStaff(res.data || []))
      .catch(() => setStaff([]))
  }, [canEdit])

  const act = async (id, fn) => {
    setBusyId(id)
    try { await fn(); await load() }
    catch (err) { setError(err.apiMessage || 'Action failed.') }
    finally { setBusyId(null) }
  }
  const setStatusFor = (c, next) => next !== c.status && act(c.id, () => cateringApi.setCateringStatus(c.id, next))
  const assignFor = (c, id) => act(c.id, () => cateringApi.assignCatering(c.id, { assigned_to: id ? Number(id) : null }))
  const noteFor = (c) => {
    const note = window.prompt(`Internal note for ${c.inquiry_ref}:`, c.internal_note || '')
    if (note === null) return
    act(c.id, () => cateringApi.setCateringNote(c.id, note))
  }

  const rowsFiltered = useMemo(() => rows.filter((c) => {
    if (status !== 'all' && c.status !== status) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(`${c.name} ${c.email} ${c.title} ${c.inquiry_ref}`.toLowerCase().includes(q))) return false
    }
    return true
  }), [rows, status, search])

  const openLeads = rows.filter((c) => !['cancelled', 'completed'].includes(c.status)).length

  const actions = { canEdit, staff, busyId, setStatusFor, assignFor, noteFor }

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Bait Um Abdallah" subtitle="Track every catering lead from first touch to delivered">
        <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('table')}><i className="las la-list" /> Table</button>
        <button className={`btn btn-sm ${view === 'board' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('board')}><i className="las la-columns" /> Board</button>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}><i className="las la-sync" /> Refresh</button>
      </PageHeader>

      <div className="kpi-grid stagger">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-inbox" /></span></div><div className="kpi-value">{rows.length}</div><div className="kpi-label">Total Inquiries</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-hourglass-half" /></span></div><div className="kpi-value">{openLeads}</div><div className="kpi-label">Open Leads</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-handshake" /></span></div><div className="kpi-value">{rows.filter((c) => c.status === 'confirmed').length}</div><div className="kpi-label">Confirmed</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-trophy" /></span></div><div className="kpi-value">{rows.filter((c) => c.status === 'completed').length}</div><div className="kpi-label">Completed</div></div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: '16px 0' }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="card card-pad" style={{ margin: '18px 0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${status === 'all' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setStatus('all')}>All</button>
          {cateringStages.map((s) => (
            <button key={s.key} className={`btn btn-sm ${status === s.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setStatus(s.key)}>{s.label}</button>
          ))}
        </div>
        <div className="table-search" style={{ marginLeft: 'auto', flex: '1 1 220px', maxWidth: 320 }}>
          <i className="las la-search" />
          <input placeholder="Search client, email, ref…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading inquiries…</p></div>
      ) : view === 'table' ? (
        <TableView rows={rowsFiltered} actions={actions} />
      ) : (
        <BoardView rows={rowsFiltered} actions={actions} />
      )}
    </div>
  )
}

function AssignSelect({ c, actions }) {
  const { staff, busyId, assignFor } = actions
  return (
    <select
      className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
      value={c.assigned_to || ''} disabled={busyId === c.id}
      onChange={(e) => assignFor(c, e.target.value)}
    >
      <option value="">Unassigned</option>
      {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  )
}

function StatusSelect({ c, actions }) {
  const { busyId, setStatusFor } = actions
  return (
    <select
      className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
      value={c.status} disabled={busyId === c.id}
      onChange={(e) => setStatusFor(c, e.target.value)}
    >
      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{stageMap[s].label}</option>)}
    </select>
  )
}

function BoardView({ rows, actions }) {
  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
      {cateringStages.map((stage) => {
        const items = rows.filter((c) => c.status === stage.key)
        return (
          <div key={stage.key} style={{ minWidth: 280, flex: '0 0 280px' }}>
            <div className="flex-between" style={{ marginBottom: 12, padding: '0 4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                <i className={stage.icon} style={{ fontSize: 16 }} /> {stage.label}
              </span>
              <span className={`badge ${stage.badge}`}>{items.length}</span>
            </div>
            <div className="grid-gap" style={{ gap: 11 }}>
              {items.map((c) => (
                <div className="card card-pad" key={c.id} style={{ padding: 15, borderRadius: 'var(--radius)' }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <b style={{ fontSize: 13.5, color: 'var(--ink)' }}>{c.name}</b>
                    <span className="text-muted" style={{ fontSize: 10.5 }}>{c.inquiry_ref}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}><i className="las la-utensils" /> {c.title || c.event_type}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="badge badge-pistachio">{c.event_type}</span>
                    <span className="badge badge-neutral"><i className="las la-users" /> {c.guests}</span>
                    <span className="badge badge-neutral"><i className="las la-calendar" /> {fmtDate(c.date_label)}</span>
                  </div>
                  {actions.canEdit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <StatusSelect c={c} actions={actions} />
                      <div className="flex-between" style={{ gap: 6 }}>
                        <AssignSelect c={c} actions={actions} />
                        <button className="icon-btn" title="Internal note" disabled={actions.busyId === c.id} onClick={() => actions.noteFor(c)}>
                          <i className={c.internal_note ? 'las la-comment-dots' : 'las la-comment'} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      <i className="las la-user-tie" /> {c.assignee?.name || 'Unassigned'}
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ padding: 18, textAlign: 'center', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  No leads here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView({ rows, actions }) {
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Inquiry</th><th>Client</th><th>Type</th><th>Guests</th><th>Event Date</th><th>Location</th><th>Assigned</th><th>Status</th>{actions.canEdit && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const stage = stageMap[c.status]
            return (
              <tr key={c.id}>
                <td className="text-muted" style={{ fontWeight: 700 }}>{c.inquiry_ref}</td>
                <td><b style={{ color: 'var(--ink)' }}>{c.name}</b><div className="text-muted" style={{ fontSize: 11 }}>{c.email}</div></td>
                <td><span className="badge badge-neutral">{c.event_type}</span></td>
                <td>{c.guests}</td>
                <td>{fmtDate(c.date_label)}</td>
                <td className="text-muted">{c.location || '—'}</td>
                <td>{actions.canEdit ? <AssignSelect c={c} actions={actions} /> : (c.assignee?.name || <span className="text-muted">Unassigned</span>)}</td>
                <td>{actions.canEdit ? <StatusSelect c={c} actions={actions} /> : <span className={`badge ${stage?.badge || 'badge-neutral'}`}>{stage?.label || c.status}</span>}</td>
                {actions.canEdit && (
                  <td>
                    <button className="icon-btn" title="Internal note" disabled={actions.busyId === c.id} onClick={() => actions.noteFor(c)}>
                      <i className={c.internal_note ? 'las la-comment-dots' : 'las la-comment'} />
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr><td colSpan={actions.canEdit ? 9 : 8} style={{ textAlign: 'center', padding: 28, color: 'var(--text-tertiary)' }}>No inquiries yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
