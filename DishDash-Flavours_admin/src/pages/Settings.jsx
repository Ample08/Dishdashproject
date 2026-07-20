import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { canManage } from '../config/roles.js'
import * as settingsApi from '../api/settings.js'

function titleFor(key = '') {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Settings() {
  const { user } = useAuth()
  const canEdit = canManage(user, 'settings')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    settingsApi.listSettings()
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.apiMessage || 'Could not load settings.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <div className="anim-fade-in">
      <PageHeader crumb={['System']} title="Settings" subtitle="Configuration values that drive the app (SRS-defined)">
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}><i className="las la-sync" /> Refresh</button>
      </PageHeader>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <i className="las la-exclamation-circle" /> {error}
          <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={load}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading settings…</p></div>
      ) : rows.length === 0 ? (
        <div className="empty-state"><div className="es-ic"><i className="las la-cog" /></div><h4>No settings</h4><p>Nothing configured yet.</p></div>
      ) : (
        <div className="grid-gap" style={{ gap: 16 }}>
          {rows.map((s) => <SettingCard key={s.setting_key} setting={s} canEdit={canEdit} onSaved={load} />)}
        </div>
      )}
    </div>
  )
}

function SettingCard({ setting, canEdit, onSaved }) {
  // Scalars get a plain input; objects/arrays get a JSON editor.
  const isScalar = setting.value === null || ['string', 'number', 'boolean'].includes(typeof setting.value)
  const [draft, setDraft] = useState(isScalar ? String(setting.value ?? '') : JSON.stringify(setting.value, null, 2))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null) // {ok, text}

  const save = async () => {
    setMsg(null)
    let value
    if (isScalar) {
      // Preserve number/boolean types where the original was one.
      if (typeof setting.value === 'number') value = Number(draft)
      else if (typeof setting.value === 'boolean') value = draft === 'true'
      else value = draft
      if (typeof setting.value === 'number' && Number.isNaN(value)) { setMsg({ ok: false, text: 'Must be a number.' }); return }
    } else {
      try { value = JSON.parse(draft) }
      catch { setMsg({ ok: false, text: 'Invalid JSON.' }); return }
    }
    setSaving(true)
    try {
      await settingsApi.updateSetting(setting.setting_key, value)
      setMsg({ ok: true, text: 'Saved' })
      onSaved?.()
    } catch (err) {
      setMsg({ ok: false, text: err.apiMessage || 'Could not save.' })
    } finally { setSaving(false) }
  }

  return (
    <div className="section-card">
      <div className="section-head">
        <div>
          <h3 style={{ fontSize: 16 }}>{titleFor(setting.setting_key)}</h3>
          <div className="sub">{setting.description || <code>{setting.setting_key}</code>}</div>
        </div>
        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            <i className="las la-save" /> {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      {isScalar ? (
        <input
          className="form-control" value={draft} disabled={!canEdit}
          type={typeof setting.value === 'number' ? 'number' : 'text'}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <textarea
          className="form-control" value={draft} disabled={!canEdit}
          rows={Math.min(12, draft.split('\n').length + 1)}
          style={{ fontFamily: 'monospace', fontSize: 12.5 }}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}

      {msg && (
        <div className={`alert ${msg.ok ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 10, marginBottom: 0 }}>
          <i className={`las ${msg.ok ? 'la-check-circle' : 'la-exclamation-circle'}`} /> {msg.text}
        </div>
      )}
    </div>
  )
}
