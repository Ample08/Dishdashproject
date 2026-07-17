import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { menu, categories, menuPages } from '../data/db.js'

const toneCls = { green: 'badge-success', warn: 'badge-warning', grape: 'badge-grape', danger: 'badge-danger', info: 'badge-info' }
const thumbBg = { green: 'var(--pistachio-soft)', warn: 'var(--warning-soft)', grape: 'var(--grape-soft)', danger: 'var(--danger-soft)', info: 'var(--info-soft)' }

export default function Menu() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'items'
  const [cat, setCat] = useState('All')

  const filtered = cat === 'All' ? menu : menu.filter((m) => m.cat === cat)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Menu']} title="Menu Management" subtitle={`${menu.length} dishes across ${categories.length} categories`}>
        <button className="btn btn-outline btn-sm"><i className="las la-layer-group" /> Categories</button>
        <button className="btn btn-primary btn-sm"><i className="las la-plus" /> Add Dish</button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['items', 'pages', 'categories', 'addons'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams(t === 'items' ? {} : { tab: t })}>
            {t === 'items' ? 'Food Items' : t === 'pages' ? 'Menu Pages' : t === 'categories' ? 'Categories' : 'Add-ons & Flavours'}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <>
          <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
            {['All', ...categories].map((c) => (
              <button key={c}
                onClick={() => setCat(c)}
                className="badge"
                style={{ cursor: 'pointer', padding: '7px 14px', fontSize: 12.5,
                  background: cat === c ? 'var(--ink)' : 'var(--surface)',
                  color: cat === c ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)' }}>
                {c}
              </button>
            ))}
          </div>

          <div className="food-grid stagger">
            {filtered.map((m) => (
              <div className="food-card" key={m.id}>
                <div className="food-thumb" style={{ background: thumbBg[m.tone], padding: 0, overflow: 'hidden' }}>
                  <span style={{ color: m.veg ? 'var(--success)' : 'var(--danger)', zIndex: 2 }} className="veg-dot" />
                  <button className="fav" style={{ zIndex: 2 }}><i className="las la-heart" /></button>
                  {m.img
                    ? <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>{m.emoji}</span>}
                </div>
                <div className="food-body">
                  <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <h4>{m.name}</h4>
                      <div className="fb-cat">{m.cat}</div>
                    </div>
                    <span className={`badge ${m.status === 'available' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                      {m.status === 'available' ? 'Live' : 'Sold out'}
                    </span>
                  </div>
                  <div className="fb-foot">
                    <span className="fb-price">{money(m.price)}</span>
                    <span className="fb-rating"><i className="las la-star" /> {m.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'pages' && (
        <>
          <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="kpi-ic grape" style={{ flexShrink: 0 }}><i className="las la-book-open" /></span>
            <div>
              <b style={{ color: 'var(--ink)' }}>Karaz — Official Menu ({menuPages.length} pages)</b>
              <div className="text-muted" style={{ fontSize: 12.5 }}>The live published menu from dishdashuae.com · click any page to open full size</div>
            </div>
          </div>
          <div className="menu-pages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
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

      {tab === 'categories' && (
        <div className="entity-grid stagger">
          {categories.map((c, i) => (
            <div className="section-card" key={c}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`kpi-ic ${['green', 'warn', 'info', 'grape'][i % 4]}`}><i className="las la-utensils" /></span>
                  <div><b style={{ fontSize: 15, color: 'var(--ink)' }}>{c}</b><div className="text-muted" style={{ fontSize: 12 }}>{menu.filter((m) => m.cat === c).length} items</div></div>
                </div>
                <button className="icon-btn"><i className="las la-pen" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'addons' && (
        <div className="entity-grid stagger">
          {['Extra Cheese', 'Spicy Mayo', 'Peri Peri', 'Garlic Dip', 'Double Patty', 'Mint Yogurt'].map((a, i) => (
            <div className="section-card flex-between" key={a}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`kpi-ic ${['green', 'warn', 'grape', 'info'][i % 4]}`}><i className="las la-plus-circle" /></span>
                <div><b style={{ fontSize: 14.5, color: 'var(--ink)' }}>{a}</b><div className="text-muted" style={{ fontSize: 12 }}>Add-on</div></div>
              </div>
              <span className="fb-price" style={{ fontSize: 16 }}>{money([5, 6, 7, 4, 12, 5][i])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
