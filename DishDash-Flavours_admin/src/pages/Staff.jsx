import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import {
  ROLES, ROLE_ORDER, PERMISSIONS, ROLE_DEFAULTS, roleMetaFor,
  variantsFor, canManage,
} from '../config/roles.js'
import * as staffApi from '../api/staff.js'
import * as menuApi from '../api/menu.js'
import * as branchesApi from '../api/branches.js'

const PAGE_SIZE = 15
const ROLE_OPTIONS = ROLE_ORDER // ['super_admin','brand_manager','location_staff']

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Staff() {
  const { user } = useAuth()
  const isSuper = user.role === 'super_admin'
  const canEdit = canManage(user, 'staff')
  const [params, setParams] = useSearchParams()
  const tab = (isSuper && params.get('tab') === 'roles') ? 'roles' : 'staff'

  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editing, setEditing] = useState(null) // staff object, or {} for new
  const [brands, setBrands] = useState([])
  const [branches, setBranches] = useState([])

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  // Brand + branch options for the staff scope dropdowns.
  useEffect(() => {
    if (!canEdit) return
    menuApi.listBrands().then((r) => setBrands(r.data || [])).catch(() => setBrands([]))
    branchesApi.listBranches().then((r) => setBranches(r.data || [])).catch(() => setBranches([]))
  }, [canEdit])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await staffApi.listStaff({
        page, limit: PAGE_SIZE, sortBy: 'created_at', sortOrder: 'desc',
        ...(query && { search: query }),
      })
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      setError(err.apiMessage || 'Could not load staff.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, query])

  useEffect(() => { if (tab === 'staff') load() }, [load, tab])

  const openAdd = () => setEditing({})
  const openEdit = (s) => setEditing(s)

  const toggleStatus = async (s) => {
    setBusyId(s.id)
    try { await staffApi.toggleStaffStatus(s.id); await load() }
    catch (err) { setError(err.apiMessage || 'Could not update status.') }
    finally { setBusyId(null) }
  }

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}? This cannot be undone.`)) return
    setBusyId(s.id)
    try { await staffApi.deleteStaff(s.id); await load() }
    catch (err) { setError(err.apiMessage || 'Could not delete staff.') }
    finally { setBusyId(null) }
  }

  const total = pagination?.total ?? rows.length

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Organization']} title={isSuper ? 'Staff & Roles' : 'Staff'} subtitle="People and what they're allowed to do">
        {canEdit && tab === 'staff' && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="las la-user-plus" /> Add Staff</button>
        )}
      </PageHeader>

      {isSuper && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <button className={`btn btn-sm ${tab === 'staff' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({})}>
            <i className="las la-users" /> All Staff
          </button>
          <button className={`btn btn-sm ${tab === 'roles' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams({ tab: 'roles' })}>
            <i className="las la-user-shield" /> Roles &amp; Permissions
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      {tab === 'staff' ? (
        <div className="table-card">
          <div className="table-toolbar">
            <h3>{total} Team Members</h3>
            <div className="table-search">
              <i className="las la-search" />
              <input placeholder="Search staff…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Member</th><th>Role</th><th>Scope</th><th>Phone</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="spinner" /><p>Loading staff…</p></div></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="es-ic"><i className="las la-user-friends" /></div><h4>No staff yet</h4><p>Add a team member to get started.</p></div></td></tr>
                ) : (
                  rows.map((s) => {
                    const meta = roleMetaFor(s.role)
                    const scope = s.branch_key || s.brand_key || (s.role === 'super_admin' ? 'All Branches' : '—')
                    const busy = busyId === s.id
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="cell-user">
                            <span className="avatar">{initials(s.name)}</span>
                            <div className="cu-meta"><b>{s.name}</b><span>{s.email}</span></div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${meta.color === 'grape' ? 'grape' : meta.color}`}>{meta.name}</span></td>
                        <td>{scope}</td>
                        <td>{s.phone || '—'}</td>
                        <td>
                          <span className={`badge ${s.is_active ? 'badge-success' : 'badge-neutral'} dot`}>
                            {s.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            {canEdit && <button className="icon-btn" title="Edit" disabled={busy} onClick={() => openEdit(s)}><i className="las la-pen" /></button>}
                            {canEdit && (
                              <button className="icon-btn" title={s.is_active ? 'Deactivate' : 'Activate'} disabled={busy} onClick={() => toggleStatus(s)}>
                                <i className={s.is_active ? 'las la-toggle-on' : 'las la-toggle-off'} />
                              </button>
                            )}
                            {canEdit && s.id !== user.id && (
                              <button className="icon-btn" title="Delete" disabled={busy} onClick={() => remove(s)}><i className="las la-trash" /></button>
                            )}
                            {busy && <i className="las la-spinner la-spin" />}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && rows.length > 0 && (
            <div className="table-foot">
              <span className="tf-info">Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} · {total} staff</span>
              <div className="pagination">
                <button disabled={!pagination?.hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="las la-angle-left" /></button>
                <button className="active">{pagination?.page ?? page}</button>
                <button disabled={!pagination?.hasNextPage} onClick={() => setPage((p) => p + 1)}><i className="las la-angle-right" /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <RolesMatrix />
      )}

      {editing && (
        <StaffModal
          staff={editing}
          brands={brands}
          branches={branches}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

/* ---- Create / edit staff, with a permission editor ---- */
function StaffModal({ staff, brands, branches, onClose, onSaved }) {
  const isNew = !staff.id
  const [form, setForm] = useState({
    name: staff.name || '',
    email: staff.email || '',
    password: '',
    role: staff.role || 'location_staff',
    brand_key: staff.brand_key || '',
    branch_key: staff.branch_key || '',
    phone: staff.phone || '',
  })
  const [perms, setPerms] = useState(new Set(staff.permissions || staff.effectivePermissions || []))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const togglePerm = (p) => setPerms((prev) => {
    const next = new Set(prev)
    next.has(p) ? next.delete(p) : next.add(p)
    return next
  })
  const applyRoleDefaults = () => setPerms(new Set(ROLE_DEFAULTS[form.role] || []))

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (isNew && !form.password) { setErr('Password is required for a new account.'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        permissions: [...perms],
        ...(form.brand_key && { brand_key: form.brand_key }),
        ...(form.branch_key && { branch_key: form.branch_key }),
        ...(form.phone && { phone: form.phone }),
        ...(form.password && { password: form.password }),
      }
      if (isNew) await staffApi.createStaff(payload)
      else await staffApi.updateStaff(staff.id, payload)
      onSaved()
    } catch (error) {
      setErr(error.apiMessage || 'Could not save. Check the fields and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>{isNew ? 'Add Staff' : `Edit ${staff.name}`}</h3>
          <button type="button" className="icon-btn" onClick={onClose}><i className="las la-times" /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          {err && <div className="alert alert-danger"><i className="las la-exclamation-circle" /> {err}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="971501112233" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password {isNew ? '' : <span className="text-muted">(leave blank to keep current)</span>}</label>
            <input type="password" className="form-control" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={isNew ? 'Set a password' : '••••••'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={(e) => set('role', e.target.value)}>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLES[r].name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <select className="form-control" value={form.brand_key} onChange={(e) => set('brand_key', e.target.value)}>
                <option value="">All / None</option>
                {brands.map((b) => <option key={b.id} value={b.brand_key}>{b.name}</option>)}
                {/* keep an unknown saved value visible */}
                {form.brand_key && !brands.some((b) => b.brand_key === form.brand_key) && (
                  <option value={form.brand_key}>{form.brand_key}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Branch</label>
              <select className="form-control" value={form.branch_key} onChange={(e) => set('branch_key', e.target.value)}>
                <option value="">All / None</option>
                {branches.map((b) => <option key={b.id} value={b.branch_key}>{b.name}</option>)}
                {form.branch_key && !branches.some((b) => b.branch_key === form.branch_key) && (
                  <option value={form.branch_key}>{form.branch_key}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Permissions</label>
              <button type="button" className="btn btn-xs btn-outline" onClick={applyRoleDefaults}>
                <i className="las la-magic" /> Use {ROLES[form.role].name} defaults
              </button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {PERMISSIONS.map((mod) => {
                const variants = variantsFor(mod.key)
                return (
                  <div key={mod.key} className="flex-between" style={{ padding: '9px 12px', borderTop: '1px solid var(--border)', gap: 10 }}>
                    <span style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className={mod.icon} style={{ color: 'var(--text-tertiary)' }} />{mod.label}
                    </span>
                    <div style={{ display: 'flex', gap: 14 }}>
                      {variants.map((p) => {
                        const kind = p.split('.')[1]
                        return (
                          <label key={p} className="checkbox-label" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                            <input type="checkbox" checked={perms.has(p)} onChange={() => togglePerm(p)} />
                            <span>{kind}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create Staff' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---- Read-only role → permission reference (from API role defaults) ---- */
function RolesMatrix() {
  const [active, setActive] = useState('super_admin')
  const has = (role, modKey) => (ROLE_DEFAULTS[role] || []).some((p) => p.split('.')[0] === modKey)

  return (
    <div className="dash-grid-3">
      <div className="section-card">
        <div className="section-head"><div><h3>Permission Matrix</h3><div className="sub">Default access per role (server defaults)</div></div></div>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>Module</th>
                {ROLE_ORDER.map((r) => <th key={r} style={{ textAlign: 'center' }}>{ROLES[r].name.split(' ')[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.key}>
                  <td className="td-strong"><i className={p.icon} style={{ marginRight: 8, color: 'var(--text-tertiary)' }} />{p.label}</td>
                  {ROLE_ORDER.map((r) => (
                    <td key={r} style={{ textAlign: 'center' }}>
                      {has(r, p.key)
                        ? <i className="las la-check-circle" style={{ color: 'var(--success)', fontSize: 19 }} />
                        : <i className="las la-minus" style={{ color: 'var(--border-strong)', fontSize: 16 }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head"><div><h3>Roles</h3><div className="sub">Tap to inspect</div></div></div>
        <div className="grid-gap" style={{ gap: 10 }}>
          {ROLE_ORDER.map((r) => {
            const role = ROLES[r]
            const tone = { grape: 'grape', info: 'info', warning: 'warn' }[role.color] || 'green'
            const count = (ROLE_DEFAULTS[r] || []).length
            return (
              <button key={r} onClick={() => setActive(r)}
                className="flex-between"
                style={{ padding: 14, borderRadius: 'var(--radius)', textAlign: 'left', width: '100%',
                  border: `1.5px solid ${active === r ? 'var(--pistachio)' : 'var(--border)'}`,
                  background: active === r ? 'var(--pistachio-tint)' : 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`kpi-ic ${tone}`} style={{ width: 40, height: 40, fontSize: 19 }}><i className={role.icon} /></span>
                  <div>
                    <b style={{ fontSize: 13.5, color: 'var(--ink)' }}>{role.name}</b>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{count} permissions</div>
                  </div>
                </div>
                <span className="badge badge-neutral">{role.scope}</span>
              </button>
            )
          })}
        </div>
        <p className="text-muted" style={{ fontSize: 12, marginTop: 14 }}>
          <i className="las la-info-circle" /> {ROLES[active].desc}
        </p>
      </div>
    </div>
  )
}
