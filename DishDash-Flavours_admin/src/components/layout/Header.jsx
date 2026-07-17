import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLES, ROLE_ORDER, homePathForRole } from '../../config/roles.js'

const NOTIFS = [
  { icon: 'las la-receipt', tone: 'kpi-ic green', text: 'New order #FD-2841 placed', time: '2 min ago' },
  { icon: 'las la-fire', tone: 'kpi-ic info', text: 'Kitchen running 4 orders late', time: '15 min ago' },
  { icon: 'las la-star', tone: 'kpi-ic warn', text: 'Hannah left a 5★ review', time: '1 hr ago' },
  { icon: 'las la-user-plus', tone: 'kpi-ic grape', text: 'Daniel Cruz joined Karaz Dubai Mall', time: '3 hr ago' },
]

export default function Header({ onMenuToggle }) {
  const { user, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null) // 'profile' | 'notif' | null
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')

  const handleSwitch = (role) => { switchRole(role); navigate(homePathForRole(role)) }
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="admin-header" ref={ref}>
      <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
        <span /><span /><span />
      </button>

      <div className="header-greet">
        <b>{greet}, {user.name.split(' ')[0]} 👋</b>
        <span>Here's what's happening across {user.role === 'super_admin' ? 'your brands' : 'your kitchen'} today.</span>
      </div>

      <div className="header-search">
        <i className="las la-search" />
        <input placeholder="Search orders, dishes, staff…" />
      </div>

      <div className="header-right">
        {/* Role switcher — demo perspective */}
        <div className="role-switch" title="Switch perspective (demo)">
          {ROLE_ORDER.map((rk) => (
            <button
              key={rk}
              className={user.role === rk ? 'active' : ''}
              onClick={() => handleSwitch(rk)}
              title={ROLES[rk].name}
            >
              <i className={ROLES[rk].icon} />
              <span className="rs-text">{ROLES[rk].name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="dropdown">
          <button className="icon-btn" onClick={() => setOpen(open === 'notif' ? null : 'notif')} aria-label="Notifications">
            <i className="las la-bell" />
            <span className="header-dot" />
          </button>
          {open === 'notif' && (
            <div className="dropdown-menu" style={{ minWidth: 300 }}>
              <div className="dropdown-head flex-between">
                <div><b>Notifications</b><span>You have 4 new alerts</span></div>
                <span className="badge badge-danger">4</span>
              </div>
              {NOTIFS.map((n, i) => (
                <button className="dropdown-item" key={i} style={{ alignItems: 'flex-start' }}>
                  <span className={n.tone} style={{ width: 34, height: 34, fontSize: 16, borderRadius: 10, flexShrink: 0 }}>
                    <i className={n.icon} />
                  </span>
                  <span style={{ textAlign: 'left', lineHeight: 1.35 }}>
                    <span style={{ display: 'block', color: 'var(--ink)', fontWeight: 700, fontSize: 12.5 }}>{n.text}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{n.time}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="dropdown">
          <button className="profile-toggle" onClick={() => setOpen(open === 'profile' ? null : 'profile')}>
            <span className="avatar">{initials}</span>
            <span className="profile-info">
              <b>{user.name}</b>
              <span>{user.roleMeta.name}</span>
            </span>
            <i className="las la-angle-down hide-mobile" style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {open === 'profile' && (
            <div className="dropdown-menu">
              <div className="dropdown-head">
                <b>{user.name}</b>
                <span>{user.email}</span>
              </div>
              <button className="dropdown-item"><i className="las la-user-circle" /> My Profile</button>
              <button className="dropdown-item"><i className="las la-cog" /> Account Settings</button>
              <button className="dropdown-item"><i className="las la-question-circle" /> Help Center</button>
              <button className="dropdown-item danger" onClick={handleLogout}><i className="las la-sign-out-alt" /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
