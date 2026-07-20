import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute, { RequirePerm, RequireRole } from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { homePathFor } from './config/roles.js'
import AdminLayout from './components/layout/AdminLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Reservations from './pages/Reservations.jsx'
import Catering from './pages/Catering.jsx'
import Menu from './pages/Menu.jsx'
import Customers from './pages/Customers.jsx'
import Brands from './pages/Brands.jsx'
import Branches from './pages/Branches.jsx'
import Staff from './pages/Staff.jsx'
import Offers from './pages/Offers.jsx'
import Vouchers from './pages/Vouchers.jsx'
import Loyalty from './pages/Loyalty.jsx'
import Reports from './pages/Reports.jsx'
import AuditLogs from './pages/AuditLogs.jsx'
import Settings from './pages/Settings.jsx'

const guarded = (perm, element) => <RequirePerm perm={perm}>{element}</RequirePerm>

// Sends each user to the first page their permissions actually allow
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={homePathFor(user)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        {/* Dashboard is open to every signed-in admin — the API has no permission for it. */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={guarded('orders', <Orders />)} />
        <Route path="reservations" element={guarded('reservations', <Reservations />)} />
        <Route path="catering" element={guarded('catering', <Catering />)} />
        <Route path="menu" element={guarded('menu', <Menu />)} />
        <Route path="customers" element={guarded('users', <Customers />)} />
        {/* The API groups brands under the menu permission ("Menu & Brands"). */}
        <Route path="brands" element={guarded('menu', <Brands />)} />
        {/* No admin branches API yet — super admin only, still mock data. */}
        <Route
          path="branches"
          element={<RequireRole roles={['super_admin']}><Branches /></RequireRole>}
        />
        <Route path="staff" element={guarded('staff', <Staff />)} />
        <Route path="offers" element={guarded('offers', <Offers />)} />
        <Route path="vouchers" element={guarded('vouchers', <Vouchers />)} />
        <Route path="loyalty" element={guarded('loyalty', <Loyalty />)} />
        <Route path="reports" element={guarded('reports', <Reports />)} />
        <Route path="audit" element={guarded('audit', <AuditLogs />)} />
        <Route path="settings" element={guarded('settings', <Settings />)} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
