import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // close mobile drawer on route change
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className="admin-wrapper">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <div className="admin-content">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <main className="admin-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
