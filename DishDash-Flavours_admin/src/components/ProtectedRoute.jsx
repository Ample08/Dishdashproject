import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { can, homePathForRole } from '../config/roles.js'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Guards a route by permission; bounces to dashboard if the role lacks access
export function RequirePerm({ perm, children }) {
  const { user } = useAuth()
  if (perm && !can(user.role, perm)) return <Navigate to={homePathForRole(user.role)} replace />
  return children
}
