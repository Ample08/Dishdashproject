import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import { auditLogs, auditActionBadge } from '../data/db.js'

export default function AuditLogs() {
  const [params, setParams] = useSearchParams()
  const group = params.get('group') || 'all'
  const [moduleF, setModuleF] = useState('All')
  const [userF, setUserF] = useState('All')

  const modules = ['All', ...new Set(auditLogs.map((l) => l.module))]
  const users = ['All', ...new Set(auditLogs.map((l) => l.user))]

  const rows = useMemo(() => auditLogs.filter((l) =>
    (moduleF === 'All' || l.module === moduleF) && (userF === 'All' || l.user === userF),
  ), [moduleF, userF])

  // group rows for the grouped views
  const grouped = useMemo(() => {
    if (group === 'all') return null
    const key = group === 'user' ? 'user' : 'module'
    const map = {}
    rows.forEach((l) => { (map[l[key]] ||= []).push(l) })
    return Object.entries(map)
  }, [rows, group])

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['System']} title="Audit Logs" subtitle="Every change, who made it and when — fully traceable">
        <button className="btn btn-outline btn-sm"><i className="las la-download" /> Export CSV</button>
      </PageHeader>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="role-switch" style={{ marginRight: 'auto' }}>
            <button className={group === 'all' ? 'active' : ''} onClick={() => setParams({})}>All</button>
            <button className={group === 'user' ? 'active' : ''} onClick={() => setParams({ group: 'user' })}>By User</button>
            <button className={group === 'module' ? 'active' : ''} onClick={() => setParams({ group: 'module' })}>By Module</button>
          </div>
          <select className="form-control" style={{ width: 'auto', padding: '8px 34px 8px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12.5 }} value={moduleF} onChange={(e) => setModuleF(e.target.value)}>
            {modules.map((m) => <option key={m}>{m === 'All' ? 'All Modules' : m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto', padding: '8px 34px 8px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12.5 }} value={userF} onChange={(e) => setUserF(e.target.value)}>
            {users.map((u) => <option key={u}>{u === 'All' ? 'All Users' : u}</option>)}
          </select>
        </div>

        {group === 'all' ? (
          <LogTable rows={rows} />
        ) : (
          <div style={{ padding: '6px 0' }}>
            {grouped.map(([label, list]) => (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 8px' }}>
                  <span className="badge badge-pistachio">{group === 'user' ? 'User' : 'Module'}</span>
                  <b style={{ color: 'var(--ink)', fontSize: 14 }}>{label}</b>
                  <span className="text-muted" style={{ fontSize: 12 }}>· {list.length} event{list.length > 1 ? 's' : ''}</span>
                </div>
                <LogTable rows={list} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LogTable({ rows }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Module</th><th>Entity</th><th>Change</th><th>IP</th></tr></thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{l.time}</td>
              <td><div className="cell-user"><span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{l.user.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span><div className="cu-meta"><b style={{ fontSize: 12.5 }}>{l.user}</b><span>{l.role}</span></div></div></td>
              <td><span className={`badge ${auditActionBadge[l.action]}`}>{l.action}</span></td>
              <td className="td-strong">{l.module}</td>
              <td>{l.entity}</td>
              <td style={{ fontSize: 12 }}>
                <span className="text-muted">{l.oldValue}</span>
                <i className="las la-long-arrow-alt-right" style={{ margin: '0 6px', color: 'var(--pistachio-700)' }} />
                <b style={{ color: 'var(--ink)' }}>{l.newValue}</b>
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{l.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
