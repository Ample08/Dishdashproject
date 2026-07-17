import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute, { RequirePerm } from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { homePathForRole } from './config/roles.js'
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

// Sends each role to the first page it's actually allowed to see
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={homePathForRole(user.role)} replace />
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
        <Route path="dashboard" element={guarded('dashboard', <Dashboard />)} />
        <Route path="orders" element={guarded('orders', <Orders />)} />
        <Route path="reservations" element={guarded('reservations', <Reservations />)} />
        <Route path="catering" element={guarded('catering', <Catering />)} />
        <Route path="menu" element={guarded('menu', <Menu />)} />
        <Route path="customers" element={guarded('customers', <Customers />)} />
        <Route path="brands" element={guarded('brands', <Brands />)} />
        <Route path="branches" element={guarded('branches', <Branches />)} />
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
