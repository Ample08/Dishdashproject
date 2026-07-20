import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { can, homePathFor } from '../config/roles.js'

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

// Guards a route by permission; bounces home if the user lacks access.
// Permissions come from the API (effectivePermissions), not from the role.
export function RequirePerm({ perm, children }) {
  const { user } = useAuth()
  if (perm && !can(user, perm)) return <Navigate to={homePathFor(user)} replace />
  return children
}

// For pages the API has no permission for yet (e.g. Branches) — gate by role.
export function RequireRole({ roles, children }) {
  const { user } = useAuth()
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user)} replace />
  return children
}
