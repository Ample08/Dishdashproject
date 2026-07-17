import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={`admin-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />}

      <div className="admin-content-wrapper">
        <Header onMenuToggle={toggleSidebar} />
        <main className="admin-main">
          <div className="admin-page-content">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
