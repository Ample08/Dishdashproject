import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { scopeStaff, branchName } from '../data/db.js'
import { ROLES, ROLE_ORDER, PERMISSIONS, ROLE_PERMISSIONS } from '../config/roles.js'

const staffStatus = {
  active: 'badge-success', on_leave: 'badge-warning', inactive: 'badge-neutral',
}

export default function Staff() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const myStaff = scopeStaff(user)
  const isSuper = user.role === 'super_admin'
  // Only Super Admin manages roles; everyone else is locked to the staff list.
  const tab = (isSuper && params.get('tab') === 'roles') ? 'roles' : 'staff'

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Organization']} title={isSuper ? 'Staff & Roles' : 'Staff'} subtitle="People and what they're allowed to do">
        <button className="btn btn-primary btn-sm"><i className="las la-user-plus" /> Add Staff</button>
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

      {tab === 'staff' ? (
        <div className="table-card">
          <div className="table-toolbar">
            <h3>{myStaff.length} Team Members</h3>
            <div className="table-search"><i className="las la-search" /><input placeholder="Search staff…" /></div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Member</th><th>Role</th>{isSuper && <th>Branch</th>}<th>Phone</th><th>Joined</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {myStaff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="cell-user">
                        <span className="avatar">{s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                        <div className="cu-meta"><b>{s.name}</b><span>{s.email}</span></div>
                      </div>
                    </td>
                    <td><span className={`badge ${ROLES[s.roleKey] ? `badge-${ROLES[s.roleKey].color === 'pistachio' ? 'pistachio' : ROLES[s.roleKey].color}` : 'badge-neutral'}`}>{s.role}</span></td>
                    {isSuper && <td>{branchName(s.branchId)}</td>}
                    <td>{s.phone}</td>
                    <td>{new Date(s.joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge ${staffStatus[s.status]} dot`}>{s.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn"><i className="las la-pen" /></button>
                        <button className="icon-btn"><i className="las la-ellipsis-h" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <RolesMatrix />
      )}
    </div>
  )
}

function RolesMatrix() {
  const [active, setActive] = useState('super_admin')
  return (
    <div className="dash-grid-3">
      <div className="section-card">
        <div className="section-head"><div><h3>Permission Matrix</h3><div className="sub">What each role can access</div></div></div>
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
                      {ROLE_PERMISSIONS[r].includes(p.key)
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
            const tone = { grape: 'grape', pistachio: 'green', info: 'info', warning: 'warn' }[role.color]
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
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{ROLE_PERMISSIONS[r].length} permissions</div>
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
