import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="admin-header">
      <div className="header-left">
        <button type="button" className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="header-right">
        <button type="button" className="btn-cache">
          <i className="las la-bell" />
          <span className="d-none-mobile">New Orders (8)</span>
        </button>

        <div className="profile-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="profile-toggle"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
          >
            <span className="avatar">
              <img
                src={user?.avatar || '/avatar.png'}
                alt={user?.name}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f77b0b"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>'
                }}
              />
            </span>
            <span className="profile-info d-none-mobile">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">{user?.user_type}</span>
            </span>
            <i className="las la-angle-down d-none-mobile" />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <button type="button" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <i className="las la-user-circle" />
                <span>Profile</span>
              </button>
              <button type="button" className="dropdown-item" onClick={handleLogout}>
                <i className="las la-sign-out-alt" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
