import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { menuItems } from '../../data/menuItems.js'
import { APP_NAME } from '../../config/app.js'

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <NavLink to="/dashboard" onClick={onClose}>
          <img src="/logo.png" alt="Admin Logo" onError={(e) => { e.target.style.display = 'none' }} />
          <span className="logo-text">{APP_NAME}</span>
        </NavLink>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search in menu" className="sidebar-search-input" />
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <SidebarGroup item={item} onClose={onClose} />
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function SidebarGroup({ item, onClose }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`nav-link nav-group ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className={item.icon} />
        <span>{item.label}</span>
        <i className="las la-angle-right nav-arrow" />
      </button>
      {open && (
        <ul className="nav-submenu">
          {item.children.map((child) => (
            <li key={child.label}>
              <NavLink
                to={child.path}
                className={({ isActive }) => `nav-link sub ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span>{child.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
