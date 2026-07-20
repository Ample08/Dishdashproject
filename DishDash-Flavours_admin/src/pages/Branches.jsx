import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import * as branchesApi from '../api/branches.js'

// Several fields (tags, facts) come back as JSON strings — parse defensively.
function parseList(raw) {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw || '[]') } catch { return [] }
}

export default function Branches() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    branchesApi.listBranches()
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.apiMessage || 'Could not load branches.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Organization']} title="Branches" subtitle={`${rows.length} branches in ${user.scopeLabel}`}>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}><i className="las la-sync" /> Refresh</button>
      </PageHeader>

      {/* The backend has no admin branches CRUD yet — this view is read-only. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '11px 14px', borderRadius: 'var(--radius)', background: 'var(--info-soft)', color: 'var(--info)', fontSize: 13, fontWeight: 600 }}>
        <i className="las la-info-circle" style={{ fontSize: 17 }} /> Branches are read-only for now — the backend doesn't expose an admin endpoint to add or edit them yet.
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading branches…</p></div>
      ) : rows.length === 0 ? (
        <div className="empty-state"><div className="es-ic"><i className="las la-map-marked-alt" /></div><h4>No branches</h4><p>Nothing to show yet.</p></div>
      ) : (
        <div className="entity-grid stagger">
          {rows.map((b) => {
            const tags = parseList(b.tags)
            const facts = parseList(b.facts)
            return (
              <div className="entity-card" key={b.id}>
                <div className="entity-banner b1">
                  <div className="entity-logo"><i className="las la-store-alt" style={{ fontSize: 26 }} /></div>
                </div>
                <div className="entity-body">
                  <div className="eb-top">
                    <div>
                      <h3>{b.name}</h3>
                      <div className="eb-sub"><i className="las la-map-marker" /> {b.area}</div>
                      <div className="eb-sub" style={{ marginTop: 2 }}><i className="las la-key" /> {b.branch_key}</div>
                    </div>
                    <span className="badge badge-success"><i className="las la-star" /> {b.rating} <span className="text-muted" style={{ fontWeight: 400 }}>({b.rating_count})</span></span>
                  </div>

                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0 4px' }}>
                      {tags.map((t) => <span key={t} className="badge badge-neutral">{t}</span>)}
                    </div>
                  )}

                  {b.highlight && <div className="eb-sub" style={{ marginTop: 6 }}><i className="las la-lightbulb" /> {b.highlight}</div>}
                  {b.most_loved && <div className="eb-sub" style={{ marginTop: 2 }}><i className="las la-heart" /> Most loved: {b.most_loved}</div>}

                  {facts.length > 0 && (
                    <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                      {facts.map((f, i) => (
                        <li key={i} style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', gap: 8 }}>
                          <i className="las la-check-circle" style={{ color: 'var(--pistachio)', marginTop: 1 }} /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
