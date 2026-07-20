import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { APP_SHORT } from '../../config/app.js'
import { navFor } from '../../config/roles.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { scopeOrders, ACTIVE_ORDER_STATUSES } from '../../data/db.js'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const nav = navFor(user)
  const pendingCount = scopeOrders(user).filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <NavLink to="/dashboard" className="logo-mark" onClick={onClose}>
          <img src="/app-icon.jpeg" alt="logo" />
        </NavLink>
        <div className="logo-text">
          <b>{APP_SHORT}</b>
          <span>Admin Suite</span>
        </div>
      </div>

      <div className="sidebar-scope">
        <span className="scope-badge"><i className={user.roleMeta.icon} /></span>
        <div className="scope-meta">
          <b>{user.roleMeta.name}</b>
          <span>{user.scopeLabel}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item, i) =>
          item.section ? (
            <div className="nav-section-label" key={`s-${i}`}>{item.section}</div>
          ) : item.children ? (
            <NavGroup key={item.label} item={item} onClose={onClose} pendingCount={pendingCount} />
          ) : (
            <NavLink
              key={item.label}
              to={item.path}
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  )
}

function NavGroup({ item, onClose, pendingCount }) {
  const location = useLocation()
  const onBase = item.children.some((c) => c.path.split('?')[0] === location.pathname)
  const [open, setOpen] = useState(onBase)

  return (
    <>
      <button
        type="button"
        className={`nav-link nav-group ${open ? 'open' : ''} ${onBase ? 'active' : ''}`}
        onClick={() => setOpen((p) => !p)}
      >
        <i className={item.icon} />
        <span>{item.label}</span>
        {item.badge === 'live' && pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
        <i className="las la-angle-right nav-arrow" />
      </button>
      {open && (
        <div className="nav-submenu">
          {item.children.map((child) => (
            <NavLink
              key={child.label}
              to={child.path}
              end
              className={({ isActive }) => `nav-link sub ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}
