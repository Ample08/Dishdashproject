import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import {
  scopeExperienceOffers, experienceBookings, experienceOfferById,
  experienceBookingStatusMeta, brandName, branchName,
} from '../data/db.js'

const TODAY = '2026-07-01'

export default function Offers() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'bookings' ? 'bookings' : 'offers'
  const isSuper = user.role === 'super_admin'
  const offers = scopeExperienceOffers(user)
  const offerIds = useMemo(() => new Set(offers.map((o) => o.id)), [offers])

  const [scope, setScope] = useState('today')
  const bookings = experienceBookings
    .filter((b) => offerIds.has(b.offerId))
    .filter((b) => (scope === 'today' ? b.date === TODAY : true))

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Experience Offers" subtitle="Curated experiences guests book with loyalty points">
        <button className="btn btn-outline btn-sm"><i className="las la-calendar-check" /> Bookings</button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> New Experience</button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${tab === 'offers' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({})}>Experiences <span className="badge badge-neutral">{offers.length}</span></button>
        <button className={`btn btn-sm ${tab === 'bookings' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({ tab: 'bookings' })}>Bookings</button>
      </div>

      {tab === 'offers' ? (
        <div className="entity-grid stagger">
          {offers.map((o) => (
            <div className="section-card" key={o.id} style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <span className="badge badge-pistachio"><i className="las la-store" /> {brandName(o.brandId)}</span>
                <span className={`badge ${o.active ? 'badge-success' : 'badge-neutral'} dot`}>{o.active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 style={{ fontSize: 17 }}>{o.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '6px 0 14px' }}>{o.desc}</p>

              <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--cream-2)', borderRadius: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}><i className="las la-coins" /> Points cost</span>
                <b style={{ fontSize: 16, color: 'var(--ink)' }}>{o.points.toLocaleString()} pts</b>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span><i className="las la-user-friends" /> Party {o.partyMin}–{o.partyMax}</span>
                <span><i className="las la-hourglass-half" /> {o.slots.length} slot{o.slots.length > 1 ? 's' : ''} · max {o.maxPerSlot}/slot</span>
                <span style={{ gridColumn: '1 / -1' }}>
                  <i className="las la-calendar" />{' '}
                  {o.availability === 'recurring'
                    ? `Every ${o.days.join(', ')}`
                    : `On ${o.dates.map((d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })).join(', ')}`}
                </span>
                <span style={{ gridColumn: '1 / -1' }}><i className="las la-clock" /> {o.slots.join(' · ')}</span>
              </div>

              <div className="flex-between" style={{ marginTop: 14, fontSize: 12, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <span>{new Date(o.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} → {new Date(o.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                <span className={`badge ${o.availability === 'recurring' ? 'badge-info' : 'badge-grape'}`}>{o.availability === 'recurring' ? 'Recurring' : 'Specific dates'}</span>
              </div>
            </div>
          ))}
          {offers.length === 0 && <div className="empty-state"><div className="es-ic"><i className="las la-star" /></div><h4>No experiences yet</h4><p>Create curated experiences guests can unlock with their loyalty points.</p></div>}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-toolbar">
            <h3>{scope === 'today' ? "Today’s Bookings" : 'All Bookings'}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn btn-sm ${scope === 'today' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setScope('today')}>Today</button>
              <button className={`btn btn-sm ${scope === 'all' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setScope('all')}>All</button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Booking</th><th>Guest</th><th>Experience</th>{isSuper && <th>Branch</th>}<th>Party</th><th>Slot</th><th>Points</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.map((b) => {
                  const offer = experienceOfferById(b.offerId)
                  const st = experienceBookingStatusMeta[b.status]
                  return (
                    <tr key={b.id}>
                      <td className="td-strong">{b.id}</td>
                      <td>{b.guest}</td>
                      <td>{offer?.name || '—'}</td>
                      {isSuper && <td>{branchName(b.branchId)}</td>}
                      <td>{b.party} guests</td>
                      <td>{new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {b.slot}</td>
                      <td className="td-strong">{b.points.toLocaleString()} pts</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div className="row-actions">
                          {b.status === 'upcoming' ? (
                            <>
                              <button className="icon-btn" title="Mark Completed"><i className="las la-check-circle" /></button>
                              <button className="icon-btn" title="Mark No-show"><i className="las la-user-slash" /></button>
                            </>
                          ) : (
                            <button className="icon-btn" title="View"><i className="las la-eye" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan={isSuper ? 9 : 8}>
                    <div className="empty-state"><div className="es-ic"><i className="las la-calendar-check" /></div><h4>No bookings {scope === 'today' ? 'today' : 'yet'}</h4><p>Confirmed experience bookings appear here and auto-create a reservation.</p></div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
