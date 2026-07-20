import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { menuPages } from '../data/db.js'
import * as menuApi from '../api/menu.js'

const PAGE_SIZE = 12
const TABS = [
  { key: 'items', label: 'Food Items' },
  { key: 'pages', label: 'Menu Pages' },
  { key: 'addons', label: 'Add-ons & Flavours' },
]

// Brand's `categories` comes back as a JSON string — parse defensively.
function parseCategories(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

export default function Menu() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'menu')
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'items'

  const [brands, setBrands] = useState([])
  const [brand, setBrand] = useState('all')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editing, setEditing] = useState(null)

  // Brands drive the brand filter + the category chips + the Add form dropdown.
  useEffect(() => {
    menuApi.listBrands()
      .then((res) => setBrands(res.data || []))
      .catch(() => setBrands([]))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await menuApi.listMenu({
        page, limit: PAGE_SIZE, sortBy: 'sort_order', sortOrder: 'asc',
        ...(brand !== 'all' && { brand }),
        ...(category !== 'All' && { category }),
        ...(query && { search: query }),
      })
      setItems(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load menu.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, brand, category, query])

  useEffect(() => { if (tab === 'items') load() }, [load, tab])

  // Category chips: union of every brand's declared categories.
  const categories = useMemo(() => {
    const set = new Set()
    brands.forEach((b) => parseCategories(b.categories).forEach((c) => set.add(c)))
    return [...set]
  }, [brands])

  const toggleStock = async (item) => {
    setBusyId(item.id)
    try { await menuApi.toggleMenuStock(item.id); await load() }
    catch (err) { setError(err.apiMessage || 'Could not update stock.') }
    finally { setBusyId(null) }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setBusyId(item.id)
    try { await menuApi.deleteMenuItem(item.id); await load() }
    catch (err) { setError(err.apiMessage || 'Could not delete item.') }
    finally { setBusyId(null) }
  }

  const total = pagination?.total ?? items.length
  const setTab = (t) => setParams(t === 'items' ? {} : { tab: t })

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Menu']} title="Menu Management" subtitle={`${total} dishes across ${brands.length} brands`}>
        {canEdit && tab === 'items' && (
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({})}><i className="las la-plus" /> Add Dish</button>
        )}
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {error && tab === 'items' && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      {tab === 'items' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {brands.length > 1 && (
              <select className="form-control" style={{ width: 'auto' }} value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1) }}>
                <option value="all">All Brands</option>
                {brands.map((b) => <option key={b.id} value={b.brand_key}>{b.name}</option>)}
              </select>
            )}
            <div className="table-search" style={{ flex: '1 1 220px' }}>
              <i className="las la-search" />
              <input placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
              {['All', ...categories].map((c) => (
                <button key={c} onClick={() => { setCategory(c); setPage(1) }} className="badge"
                  style={{ cursor: 'pointer', padding: '7px 14px', fontSize: 12.5,
                    background: category === c ? 'var(--ink)' : 'var(--surface)',
                    color: category === c ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="empty-state"><div className="spinner" /><p>Loading dishes…</p></div>
          ) : items.length === 0 ? (
            <div className="empty-state"><div className="es-ic"><i className="las la-utensils" /></div><h4>No dishes here</h4><p>Nothing matches this filter. Add a dish to get started.</p></div>
          ) : (
            <div className="food-grid stagger">
              {items.map((m) => {
                const busy = busyId === m.id
                return (
                  <div className="food-card" key={m.id}>
                    <div className="food-thumb" style={{ background: 'var(--pistachio-soft)', display: 'grid', placeItems: 'center' }}>
                      <i className="las la-utensils" style={{ fontSize: 34, color: 'var(--pistachio)' }} />
                      {m.popular && <span className="badge badge-warning" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10 }}>Popular</span>}
                    </div>
                    <div className="food-body">
                      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                        <div>
                          <h4>{m.name}</h4>
                          <div className="fb-cat">{m.category} · {m.brand_key}</div>
                        </div>
                        <span className={`badge ${m.sold_out ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 10 }}>
                          {m.sold_out ? 'Sold out' : 'Live'}
                        </span>
                      </div>
                      <div className="fb-foot">
                        <span className="fb-price">{money(m.price)}</span>
                        {canEdit && (
                          <div className="row-actions">
                            <button className="icon-btn" title={m.sold_out ? 'Mark in stock' : 'Mark sold out'} disabled={busy} onClick={() => toggleStock(m)}>
                              <i className={m.sold_out ? 'las la-toggle-off' : 'las la-toggle-on'} />
                            </button>
                            <button className="icon-btn" title="Edit" disabled={busy} onClick={() => setEditing(m)}><i className="las la-pen" /></button>
                            <button className="icon-btn" title="Delete" disabled={busy} onClick={() => remove(m)}><i className="las la-trash" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && items.length > 0 && pagination && (
            <div className="table-foot" style={{ marginTop: 18 }}>
              <span className="tf-info">Page {pagination.page} of {pagination.totalPages} · {total} dishes</span>
              <div className="pagination">
                <button disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
                <button className="active">{pagination.page}</button>
                <button disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'pages' && (
        <>
          <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="kpi-ic grape" style={{ flexShrink: 0 }}><i className="las la-book-open" /></span>
            <div>
              <b style={{ color: 'var(--ink)' }}>Karaz — Official Menu ({menuPages.length} pages)</b>
              <div className="text-muted" style={{ fontSize: 12.5 }}>Published menu images · no API yet, shown from local assets</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {menuPages.map((p) => (
              <a key={p.n} href={p.img} target="_blank" rel="noreferrer" className="card" style={{ overflow: 'hidden', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '3 / 4', background: 'var(--surface-soft)', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <b style={{ fontSize: 12.5, color: 'var(--ink)' }}>{p.title}</b>
                  <span className="text-muted" style={{ fontSize: 11 }}>P{p.n}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {tab === 'addons' && (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
          <span className="kpi-ic grape" style={{ margin: '0 auto 12px' }}><i className="las la-plus-circle" /></span>
          <b style={{ color: 'var(--ink)', display: 'block' }}>Add-ons & Flavours</b>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>No dedicated API for add-ons yet — this will light up once the backend exposes it.</p>
        </div>
      )}

      {editing && (
        <DishModal
          dish={editing}
          brands={brands}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

/* ---- Create / edit a dish ---- */
function DishModal({ dish, brands, categories, onClose, onSaved }) {
  const isNew = !dish.id
  const [form, setForm] = useState({
    name: dish.name || '',
    slug: dish.slug || '',
    brand_key: dish.brand_key || brands[0]?.brand_key || '',
    category: dish.category || categories[0] || '',
    price: dish.price ?? '',
    description: dish.description || '',
    popular: !!dish.popular,
    sold_out: !!dish.sold_out,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Auto-suggest a slug from the name for new dishes.
  const onName = (v) => {
    set('name', v)
    if (isNew) set('slug', v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.name || !form.slug || !form.brand_key || !form.category || form.price === '') {
      setErr('Name, slug, brand, category and price are required.'); return
    }
    setSaving(true)
    try {
      const payload = {
        slug: form.slug,
        brand_key: form.brand_key,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description || undefined,
        popular: form.popular,
        sold_out: form.sold_out,
      }
      if (isNew) await menuApi.createMenuItem(payload)
      else await menuApi.updateMenuItem(dish.id, payload)
      onSaved()
    } catch (error) {
      setErr(error.apiMessage || 'Could not save the dish.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>{isNew ? 'Add Dish' : `Edit ${dish.name}`}</h3>
          <button type="button" className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          {err && <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {err}</div>}

          <div className="form-group">
            <label>Dish name</label>
            <input className="form-control" value={form.name} onChange={(e) => onName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Slug</label>
              <input className="form-control" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Price (AED)</label>
              <input type="number" step="0.01" min="0" className="form-control" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Brand</label>
              <select className="form-control" value={form.brand_key} onChange={(e) => set('brand_key', e.target.value)}>
                {brands.map((b) => <option key={b.id} value={b.brand_key}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" list="dish-cats" value={form.category} onChange={(e) => set('category', e.target.value)} required />
              <datalist id="dish-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <label className="checkbox-label"><input type="checkbox" checked={form.popular} onChange={(e) => set('popular', e.target.checked)} /><span>Popular</span></label>
            <label className="checkbox-label"><input type="checkbox" checked={form.sold_out} onChange={(e) => set('sold_out', e.target.checked)} /><span>Sold out</span></label>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create Dish' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
