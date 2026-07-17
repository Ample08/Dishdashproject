import { useState } from 'react'
import { money } from '../config/app.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { scopeCatering, cateringStages, brandName } from '../data/db.js'

const stageMap = Object.fromEntries(cateringStages.map((s) => [s.key, s]))

export default function Catering() {
  const { user } = useAuth()
  const all = scopeCatering(user)
  const isSuper = user.role === 'super_admin'
  const [view, setView] = useState('board') // 'board' | 'table'
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const hasFilters = status !== 'all' || from || to
  const rows = all.filter((c) => {
    if (status !== 'all' && c.status !== status) return false
    if (from && c.date < from) return false
    if (to && c.date > to) return false
    return true
  })
  const resetFilters = () => { setStatus('all'); setFrom(''); setTo('') }

  const pipelineValue = rows.filter((c) => !['cancelled', 'completed'].includes(c.status)).reduce((s, c) => s + c.value, 0)
  const wonValue = rows.filter((c) => c.status === 'completed').reduce((s, c) => s + c.value, 0)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Operations']} title="Bait Um Abdallah" subtitle="Track every catering lead from first touch to delivered">
        <button
          className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setView('table')}
        >
          <i className="las la-list" /> Table View
        </button>
        <button
          className={`btn btn-sm ${view === 'board' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setView('board')}
        >
          <i className="las la-columns" /> Board View
        </button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> New Inquiry</button>
      </PageHeader>

      <div className="card card-pad" style={{ marginBottom: 18, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="text-muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Status</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${status === 'all' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setStatus('all')}>All</button>
            {cateringStages.map((s) => (
              <button key={s.key} className={`btn btn-sm ${status === s.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setStatus(s.key)}>{s.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="text-muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Event date from</label>
          <input type="date" className="form-control" style={{ width: 168 }} value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="text-muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>To</label>
          <input type="date" className="form-control" style={{ width: 168 }} value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="text-muted" style={{ fontSize: 12.5 }}>Showing <b style={{ color: 'var(--ink)' }}>{rows.length}</b> of {all.length}</span>
          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={resetFilters}><i className="las la-times" /> Clear</button>
          )}
        </div>
      </div>

      <div className="kpi-grid stagger">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-inbox" /></span></div><div className="kpi-value">{rows.length}</div><div className="kpi-label">Total Inquiries</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-hourglass-half" /></span></div><div className="kpi-value">{rows.filter((c) => !['cancelled', 'completed'].includes(c.status)).length}</div><div className="kpi-label">Open Leads</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-coins" /></span></div><div className="kpi-value">{money(pipelineValue, { compact: true })}</div><div className="kpi-label">Pipeline Value</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-trophy" /></span></div><div className="kpi-value">{money(wonValue, { compact: true })}</div><div className="kpi-label">Won (Completed)</div></div>
      </div>

      {view === 'table' ? (
        <TableView rows={rows} isSuper={isSuper} />
      ) : (
        <BoardView rows={rows} isSuper={isSuper} />
      )}
    </div>
  )
}

function BoardView({ rows, isSuper }) {
  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
      {cateringStages.map((stage) => {
        const items = rows.filter((c) => c.status === stage.key)
        return (
          <div key={stage.key} style={{ minWidth: 270, flex: '0 0 270px' }}>
            <div className="flex-between" style={{ marginBottom: 12, padding: '0 4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                <i className={stage.icon} style={{ fontSize: 16 }} /> {stage.label}
              </span>
              <span className={`badge ${stage.badge}`}>{items.length}</span>
            </div>
            <div className="grid-gap" style={{ gap: 11 }}>
              {items.map((c) => (
                <div className="card card-pad" key={c.id} style={{ padding: 15, cursor: 'grab', borderRadius: 'var(--radius)' }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <b style={{ fontSize: 13.5, color: 'var(--ink)' }}>{c.name}</b>
                    <span className="text-muted" style={{ fontSize: 10.5 }}>{c.id}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}><i className="las la-utensils" /> {c.event}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="badge badge-pistachio">{c.eventType}</span>
                    <span className="badge badge-neutral"><i className="las la-users" /> {c.guests}</span>
                    <span className="badge badge-neutral"><i className="las la-calendar" /> {new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 8 }}><i className="las la-user-tie" /> {c.assignedTo || 'Unassigned'}</div>
                  <div className="flex-between" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <b style={{ fontFamily: 'Playfair Display', fontSize: 15, color: 'var(--ink)' }}>{c.value ? money(c.value) : '—'}</b>
                    {isSuper && <span className="text-muted" style={{ fontSize: 10.5 }}>{brandName(c.brandId)}</span>}
                  </div>
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

function TableView({ rows, isSuper }) {
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Inquiry</th>
            <th>Client</th>
            <th>Type</th>
            <th>Guests</th>
            <th>Event Date</th>
            <th>Assigned</th>
            {isSuper && <th>Brand</th>}
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Budget</th>
            <th style={{ textAlign: 'right' }}>Quote</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const stage = stageMap[c.status]
            return (
              <tr key={c.id}>
                <td className="text-muted" style={{ fontWeight: 700 }}>{c.id}</td>
                <td><b style={{ color: 'var(--ink)' }}>{c.name}</b><div className="text-muted" style={{ fontSize: 11 }}>{c.email}</div></td>
                <td><span className="badge badge-neutral">{c.eventType}</span></td>
                <td>{c.guests}</td>
                <td>{new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{c.assignedTo || <span className="text-muted">Unassigned</span>}</td>
                {isSuper && <td className="text-muted">{brandName(c.brandId)}</td>}
                <td><span className={`badge ${stage?.badge || 'badge-neutral'}`}>{stage?.label || c.status}</span></td>
                <td style={{ textAlign: 'right' }} className="text-muted">{c.budget ? money(c.budget) : '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--ink)' }}>{c.value ? money(c.value) : '—'}</td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={isSuper ? 10 : 9} style={{ textAlign: 'center', padding: 28, color: 'var(--text-tertiary)' }}>
                No inquiries yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
