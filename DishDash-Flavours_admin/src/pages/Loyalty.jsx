import { useSearchParams } from 'react-router-dom'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import {
  loyaltyMembers, loyaltyTiers, unmatchedPos, pointAdjustments,
  pointsLedger, loyaltyLedgerTypeMeta, effectiveTier, tierForPoints,
} from '../data/db.js'

const TABS = [
  { key: 'members', label: 'Members', icon: 'las la-users' },
  { key: 'ledger', label: 'Points Ledger', icon: 'las la-list-alt' },
  { key: 'unmatched', label: 'Unmatched POS', icon: 'las la-unlink' },
  { key: 'points', label: 'Point Adjustments', icon: 'las la-sliders-h' },
]

export default function Loyalty() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'members'

  const totalPoints = loyaltyMembers.reduce((s, m) => s + m.points, 0)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Loyalty Management" subtitle="Members, points and POS reconciliation">
        <button className="btn btn-outline btn-sm"><i className="las la-download" /> Export</button>
        <button className="btn btn-primary btn-sm"><i className="las la-medal" /> Adjust Points</button>
      </PageHeader>

      <div className="kpi-grid stagger" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-users" /></span></div><div className="kpi-value">{loyaltyMembers.length}</div><div className="kpi-label">Active Members</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-star" /></span></div><div className="kpi-value">{(totalPoints / 1000).toFixed(1)}k</div><div className="kpi-label">Points Issued</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic danger"><i className="las la-unlink" /></span></div><div className="kpi-value">{unmatchedPos.length}</div><div className="kpi-label">Unmatched POS</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-sliders-h" /></span></div><div className="kpi-value">{pointAdjustments.length}</div><div className="kpi-label">Adjustments (today)</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => setParams(t.key === 'members' ? {} : { tab: t.key })}>
            <i className={t.icon} /> {t.label}
            {t.key === 'unmatched' && <span className="badge badge-danger" style={{ marginLeft: 2 }}>{unmatchedPos.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="table-card">
          <div className="table-toolbar"><h3>Loyalty Members</h3><div className="table-search"><i className="las la-search" /><input placeholder="Search member…" /></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Member</th><th>Tier</th><th>Points</th><th>Lifetime Spend</th><th>Orders</th><th>Member Since</th><th></th></tr></thead>
              <tbody>
                {loyaltyMembers.map((m) => {
                  const tier = effectiveTier(m)
                  const overridden = m.override && m.override !== tierForPoints(m.points)
                  return (
                    <tr key={m.id}>
                      <td><div className="cell-user"><span className="avatar">{m.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span><div className="cu-meta"><b>{m.name}</b><span>{m.id}</span></div></div></td>
                      <td>
                        <span className={`badge ${loyaltyTiers[tier]}`}><i className="las la-medal" /> {tier}</span>
                        {overridden && <span className="badge badge-info" style={{ marginLeft: 4 }} title={`Manually overridden from ${tierForPoints(m.points)}`}><i className="las la-lock" /> override</span>}
                      </td>
                      <td className="td-strong">{m.points.toLocaleString()}</td>
                      <td className="td-strong">{money(m.spent)}</td>
                      <td>{m.orders}</td>
                      <td>{new Date(m.joined).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                      <td><div className="row-actions"><button className="icon-btn" title="View"><i className="las la-eye" /></button><button className="icon-btn" title="Override tier"><i className="las la-medal" /></button><button className="icon-btn" title="Adjust points"><i className="las la-plus-circle" /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="table-card">
          <div className="table-toolbar"><h3>Points Ledger</h3><div className="table-search"><i className="las la-search" /><input placeholder="Search member…" /></div></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Member</th><th>Type</th><th>Change</th><th>Note</th><th>When</th></tr></thead>
              <tbody>
                {pointsLedger.map((l) => {
                  const t = loyaltyLedgerTypeMeta[l.type]
                  return (
                    <tr key={l.id}>
                      <td className="td-strong">{l.id}</td>
                      <td>{l.member}</td>
                      <td><span className={`badge ${t.cls}`}><i className={t.icon} /> {t.label}</span></td>
                      <td><span className={`badge ${l.delta > 0 ? 'badge-success' : l.delta < 0 ? 'badge-danger' : 'badge-neutral'}`}>{l.delta > 0 ? '+' : ''}{l.delta.toLocaleString()} pts</span></td>
                      <td>{l.note}</td>
                      <td>{l.time}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'unmatched' && (
        <div className="table-card">
          <div className="table-toolbar"><h3>Unmatched POS Transactions</h3><button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}><i className="las la-sync" /> Retry All</button></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Txn ID</th><th>Amount</th><th>Branch</th><th>Reason</th><th>When</th><th></th></tr></thead>
              <tbody>
                {unmatchedPos.map((u) => (
                  <tr key={u.id}>
                    <td className="td-strong">{u.txn}</td>
                    <td className="td-strong">{money(u.amount)}</td>
                    <td>{u.branch}</td>
                    <td><span className="badge badge-danger dot">{u.reason}</span></td>
                    <td>{u.time}</td>
                    <td><div className="row-actions"><button className="icon-btn" title="Retry match"><i className="las la-link" /></button><button className="icon-btn"><i className="las la-ellipsis-h" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'points' && (
        <div className="table-card">
          <div className="table-toolbar"><h3>Point Adjustments</h3></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Member</th><th>Change</th><th>Reason</th><th>By</th><th>When</th></tr></thead>
              <tbody>
                {pointAdjustments.map((p) => (
                  <tr key={p.id}>
                    <td className="td-strong">{p.id}</td>
                    <td>{p.member}</td>
                    <td><span className={`badge ${p.delta > 0 ? 'badge-success' : 'badge-danger'}`}><i className={`las la-arrow-${p.delta > 0 ? 'up' : 'down'}`} /> {p.delta > 0 ? '+' : ''}{p.delta} pts</span></td>
                    <td>{p.reason}</td>
                    <td>{p.by}</td>
                    <td>{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
