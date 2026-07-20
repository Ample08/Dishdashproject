import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import * as offersApi from '../api/offers.js'
import * as menuApi from '../api/menu.js'

const BOOKING_STATUS = {
  booked: { label: 'Booked', badge: 'badge-warning' },
  completed: { label: 'Completed', badge: 'badge-success' },
  no_show: { label: 'No-show', badge: 'badge-danger' },
  cancelled: { label: 'Cancelled', badge: 'badge-neutral' },
}
const BOOKING_STATUS_OPTIONS = Object.keys(BOOKING_STATUS)
const BOOKING_FILTERS = ['all', ...BOOKING_STATUS_OPTIONS]
const PAGE_SIZE = 15

export default function Offers() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'offers')
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'bookings' ? 'bookings' : 'offers'

  const [offers, setOffers] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    menuApi.listBrands().then((r) => setBrands(r.data || [])).catch(() => setBrands([]))
  }, [])

  // Offers endpoint returns the full list (no pagination).
  const loadOffers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await offersApi.listOffers()
      setOffers(res.data || [])
    } catch (err) {
      setError(err.apiMessage || 'Could not load experiences.')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (tab === 'offers') loadOffers() }, [loadOffers, tab])

  const toggle = async (o) => {
    setBusyId(o.id)
    try { await offersApi.toggleOffer(o.id); await loadOffers() }
    catch (err) { setError(err.apiMessage || 'Could not toggle.') }
    finally { setBusyId(null) }
  }
  const remove = async (o) => {
    if (!window.confirm(`Delete "${o.title}"? This cannot be undone.`)) return
    setBusyId(o.id)
    try { await offersApi.deleteOffer(o.id); await loadOffers() }
    catch (err) { setError(err.apiMessage || 'Could not delete.') }
    finally { setBusyId(null) }
  }

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Experience Offers" subtitle="Curated experiences guests book with loyalty points">
        {canEdit && tab === 'offers' && (
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({})}><i className="las la-plus" /> New Experience</button>
        )}
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${tab === 'offers' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({})}>
          Experiences <span className="badge badge-neutral">{offers.length}</span>
        </button>
        <button className={`btn btn-sm ${tab === 'bookings' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({ tab: 'bookings' })}>Bookings</button>
      </div>

      {error && tab === 'offers' && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={loadOffers}>Retry</button>
        </div>
      )}

      {tab === 'offers' ? (
        loading ? (
          <div className="empty-state"><div className="spinner" /><p>Loading experiences…</p></div>
        ) : offers.length === 0 ? (
          <div className="empty-state"><div className="es-ic"><i className="las la-star" /></div><h4>No experiences yet</h4><p>Create curated experiences guests can unlock with loyalty points.</p></div>
        ) : (
          <div className="entity-grid stagger">
            {offers.map((o) => {
              const busy = busyId === o.id
              return (
                <div className="section-card" key={o.id} style={{ position: 'relative' }}>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <span className="badge badge-pistachio"><i className="las la-store" /> {o.brand}</span>
                    <span className={`badge ${o.active ? 'badge-success' : 'badge-neutral'} dot`}>{o.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <h3 style={{ fontSize: 17 }}>{o.title}</h3>
                  {o.description && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '6px 0 14px' }}>{o.description}</p>}

                  <div className="flex-between" style={{ padding: '10px 12px', background: 'var(--cream-2, var(--surface-soft))', borderRadius: 10, margin: '10px 0 12px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}><i className="las la-coins" /> Points cost</span>
                    <b style={{ fontSize: 16, color: 'var(--ink)' }}>{Number(o.pts).toLocaleString()} pts</b>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {o.party_size_required && <span><i className="las la-user-friends" /> Party {o.min_party}–{o.max_party}</span>}
                    <span><i className="las la-hourglass-half" /> {(o.time_slots || []).length} slot(s) · max {o.max_per_slot}/slot</span>
                    <span style={{ gridColumn: '1 / -1' }}>
                      <i className="las la-calendar" />{' '}
                      {o.availability_type === 'RECURRING'
                        ? `Every ${(o.days || []).join(', ') || '—'}`
                        : `${o.start_date || '?'} → ${o.end_date || '?'}`}
                    </span>
                    {(o.time_slots || []).length > 0 && <span style={{ gridColumn: '1 / -1' }}><i className="las la-clock" /> {o.time_slots.join(' · ')}</span>}
                  </div>

                  {canEdit && (
                    <div className="row-actions" style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <button className="btn btn-xs btn-outline" disabled={busy} onClick={() => toggle(o)}>
                        <i className={o.active ? 'las la-toggle-on' : 'las la-toggle-off'} /> {o.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn" title="Edit" disabled={busy} onClick={() => setEditing(o)}><i className="las la-pen" /></button>
                      <button className="icon-btn" title="Delete" disabled={busy} onClick={() => remove(o)}><i className="las la-trash" /></button>
                      {busy && <i className="las la-spinner la-spin" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        <BookingsTab canEdit={canEdit} />
      )}

      {editing && (
        <OfferModal
          offer={editing}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadOffers() }}
        />
      )}
    </div>
  )
}

/* ---- Bookings tab (paginated, status change) ---- */
function BookingsTab({ canEdit }) {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await offersApi.listOfferBookings({
        page, limit: PAGE_SIZE, sortBy: 'created_at', sortOrder: 'DESC',
        ...(status !== 'all' && { status }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load bookings.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const changeStatus = async (b, next) => {
    if (next === b.status) return
    setBusyId(b.id)
    try { await offersApi.setOfferBookingStatus(b.id, next); await load() }
    catch (err) { setError(err.apiMessage || 'Could not update status.') }
    finally { setBusyId(null) }
  }

  const total = pagination?.total ?? rows.length

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <h3>Experience Bookings</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BOOKING_FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${status === f ? 'btn-ink' : 'btn-outline'}`}
              onClick={() => { setStatus(f); setPage(1) }}>
              {f === 'all' ? 'All' : BOOKING_STATUS[f].label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Ref</th><th>Guest</th><th>Experience</th><th>Brand</th><th>When</th><th>Status</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="spinner" /><p>Loading bookings…</p></div></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="es-ic"><i className="las la-calendar-check" /></div><h4>No bookings here</h4><p>Confirmed experience bookings appear here.</p></div></td></tr>
            ) : (
              rows.map((b) => {
                const st = BOOKING_STATUS[b.status] || { label: b.status, badge: 'badge-neutral' }
                const busy = busyId === b.id
                return (
                  <tr key={b.id}>
                    <td className="td-strong">{b.booking_key}</td>
                    <td>
                      <div className="cu-meta"><b>{b.user?.name || '—'}</b><span>{b.user?.phone || ''}</span></div>
                    </td>
                    <td>{b.title}</td>
                    <td>{b.brand || '—'}</td>
                    <td>{b.date_label}</td>
                    <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                    {canEdit && (
                      <td>
                        <div className="row-actions" style={{ alignItems: 'center' }}>
                          <select className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                            value={b.status} disabled={busy} onChange={(e) => changeStatus(b, e.target.value)}>
                            {BOOKING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}
                          </select>
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
      {!loading && rows.length > 0 && (
        <div className="table-foot">
          <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} bookings</span>
          <div className="pagination">
            <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
            <button className="active">{pagination?.page ?? page}</button>
            <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Create / edit an experience ---- */
function OfferModal({ offer, brands, onClose, onSaved }) {
  const isNew = !offer.id
  const [form, setForm] = useState({
    title: offer.title || '',
    exp_key: offer.exp_key || '',
    brand: offer.brand || brands[0]?.brand_key || '',
    pts: offer.pts ?? '',
    description: offer.description || '',
    availability_type: offer.availability_type || 'RECURRING',
    party_size_required: !!offer.party_size_required,
    min_party: offer.min_party ?? '',
    max_party: offer.max_party ?? '',
    max_per_slot: offer.max_per_slot ?? 10,
    days: (offer.days || []).join(', '),
    time_slots: (offer.time_slots || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onTitle = (v) => {
    set('title', v)
    if (isNew) set('exp_key', v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }
  const splitList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.title || !form.exp_key || !form.brand || form.pts === '') {
      setErr('Title, key, brand and points are required.'); return
    }
    setSaving(true)
    try {
      const payload = {
        exp_key: form.exp_key,
        title: form.title,
        brand: form.brand,
        pts: Number(form.pts),
        description: form.description || undefined,
        availability_type: form.availability_type,
        party_size_required: form.party_size_required,
        ...(form.party_size_required && form.min_party !== '' && { min_party: Number(form.min_party) }),
        ...(form.party_size_required && form.max_party !== '' && { max_party: Number(form.max_party) }),
        max_per_slot: Number(form.max_per_slot) || 1,
        days: splitList(form.days),
        time_slots: splitList(form.time_slots),
      }
      if (isNew) await offersApi.createOffer(payload)
      else await offersApi.updateOffer(offer.id, payload)
      onSaved()
    } catch (error) {
      setErr(error.apiMessage || 'Could not save the experience.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>{isNew ? 'New Experience' : `Edit ${offer.title}`}</h3>
          <button type="button" className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          {err && <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {err}</div>}

          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={form.title} onChange={(e) => onTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Key (exp_key)</label>
              <input className="form-control" value={form.exp_key} onChange={(e) => set('exp_key', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Points cost</label>
              <input type="number" min="0" className="form-control" value={form.pts} onChange={(e) => set('pts', e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Brand</label>
              <select className="form-control" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
                {brands.map((b) => <option key={b.id} value={b.brand_key}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select className="form-control" value={form.availability_type} onChange={(e) => set('availability_type', e.target.value)}>
                <option value="RECURRING">Recurring</option>
                <option value="SPECIFIC_DATES">Specific dates</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Days <span className="text-muted">(comma-sep)</span></label>
              <input className="form-control" value={form.days} onChange={(e) => set('days', e.target.value)} placeholder="Fri, Sat" />
            </div>
            <div className="form-group">
              <label>Time slots <span className="text-muted">(comma-sep)</span></label>
              <input className="form-control" value={form.time_slots} onChange={(e) => set('time_slots', e.target.value)} placeholder="11:00, 14:00" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 12, alignItems: 'end' }}>
            <label className="checkbox-label" style={{ paddingBottom: 10 }}>
              <input type="checkbox" checked={form.party_size_required} onChange={(e) => set('party_size_required', e.target.checked)} />
              <span>Party size</span>
            </label>
            <div className="form-group">
              <label>Min party</label>
              <input type="number" min="0" className="form-control" value={form.min_party} disabled={!form.party_size_required} onChange={(e) => set('min_party', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Max party</label>
              <input type="number" min="0" className="form-control" value={form.max_party} disabled={!form.party_size_required} onChange={(e) => set('max_party', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: 160 }}>
            <label>Max per slot</label>
            <input type="number" min="1" className="form-control" value={form.max_per_slot} onChange={(e) => set('max_per_slot', e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
