import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { money } from '../config/app.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import { vouchers, voucherTypeMeta, voucherStatusMeta, branchName } from '../data/db.js'

const TABS = [
  { key: 'all', label: 'All Vouchers' },
  { key: 'welcome', label: 'Welcome' },
  { key: 'celebration', label: 'Celebration' },
  { key: 'claimed', label: 'Claimed' },
]

export default function Vouchers() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'all'
  const [query, setQuery] = useState('')

  const rows = vouchers.filter((v) => {
    const matchTab =
      tab === 'all' ? true :
      tab === 'claimed' ? v.status === 'claimed' :
      v.type === tab
    const q = query.trim().toLowerCase()
    const matchQuery = !q || v.code.toLowerCase().includes(q) || (v.owner || '').toLowerCase().includes(q)
    return matchTab && matchQuery
  })

  const claimed = vouchers.filter((v) => v.status === 'claimed')
  const unlocked = vouchers.filter((v) => v.status === 'unlocked').length
  const redeemedValue = claimed.reduce((s, v) => s + (v.claim?.discount || 0), 0)

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['Growth']} title="Voucher Management" subtitle="Welcome & Celebration discount vouchers — track unlocks and claims">
        <div className="table-search"><i className="las la-search" /><input placeholder="Search code or guest…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </PageHeader>

      <div className="kpi-grid stagger" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic green"><i className="las la-ticket-alt" /></span></div><div className="kpi-value">{vouchers.length}</div><div className="kpi-label">Total Vouchers</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic info"><i className="las la-unlock" /></span></div><div className="kpi-value">{unlocked}</div><div className="kpi-label">Unlocked</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic grape"><i className="las la-hand-holding-usd" /></span></div><div className="kpi-value">{claimed.length}</div><div className="kpi-label">Claimed</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-ic warn"><i className="las la-coins" /></span></div><div className="kpi-value">{money(redeemedValue, { compact: true })}</div><div className="kpi-label">Discount Given</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '4px 0 18px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-ink' : 'btn-outline'}`} onClick={() => (t.key === 'all' ? setParams({}) : setParams({ tab: t.key }))}>{t.label}</button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Program</th><th>Discount</th><th>Owner</th><th>Status</th><th>Claim Details</th><th>Issued</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {rows.map((v) => {
                const meta = voucherTypeMeta[v.type]
                const st = voucherStatusMeta[v.status]
                return (
                  <tr key={v.code}>
                    <td><code style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--ink)', background: 'var(--cream-2)', padding: '4px 9px', borderRadius: 7, border: '1px dashed var(--border-strong)' }}>{v.code}</code></td>
                    <td><span className={`badge badge-${meta.tone}`}><i className={meta.icon} /> {meta.label}</span></td>
                    <td className="td-strong">{meta.discount}% off{meta.minParty ? <span className="text-muted" style={{ fontWeight: 400 }}> · party {meta.minParty}+</span> : meta.firstDineInOnly ? <span className="text-muted" style={{ fontWeight: 400 }}> · 1st dine-in</span> : null}</td>
                    <td>{v.owner}</td>
                    <td><span className={`badge ${st.cls} dot`}>{st.label}</span></td>
                    <td>
                      {v.claim
                        ? <span className="text-muted">{branchName(v.claim.branchId)} · bill {money(v.claim.bill)} · −{money(v.claim.discount)}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>{new Date(v.issued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>{new Date(v.expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><div className="row-actions"><button className="icon-btn" title="Copy"><i className="las la-copy" /></button><button className="icon-btn" title="Details"><i className="las la-eye" /></button></div></td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="es-ic"><i className="las la-ticket-alt" /></div>
                    <h4>No vouchers here</h4>
                    <p>Nothing matches this filter. Welcome vouchers are issued on signup; Celebration vouchers unlock for large parties.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
