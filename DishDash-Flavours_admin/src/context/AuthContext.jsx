import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { roleMetaFor } from '../config/roles.js'
import { tokenStore, setUnauthorizedHandler } from '../api/client.js'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

/* The API returns snake_case with permissions under `effectivePermissions`.
   Normalise once here so no page has to know the wire format. */
function normalizeAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone ?? null,
    role: admin.role,
    roleMeta: roleMetaFor(admin.role),
    brandKey: admin.brand_key ?? null,
    branchKey: admin.branch_key ?? null,
    isActive: admin.is_active,
    permissions: admin.effectivePermissions || [],
    scopeLabel: scopeLabelFor(admin),
  }
}

function scopeLabelFor(admin) {
  const parts = [admin.brand_key, admin.branch_key].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'All Branches · System'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // A 401 anywhere means the token is dead — drop the session.
  // ProtectedRoute then bounces to /login on its own.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  // Restore the session on refresh: the token lives in localStorage, but the
  // user is re-fetched so permissions are always the server's current answer.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!tokenStore.get()) {
        setLoading(false)
        return
      }
      try {
        const { data } = await authApi.getProfile()
        if (!cancelled) setUser(normalizeAdmin(data))
      } catch {
        tokenStore.clear() // expired or backend unreachable — start clean
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restore()
    return () => { cancelled = true }
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await authApi.login(email, password)
      tokenStore.set(data.token)
      const nextUser = normalizeAdmin(data.admin)
      setUser(nextUser)
      return { success: true, user: nextUser }
    } catch (error) {
      tokenStore.clear()
      return { success: false, message: error.apiMessage || 'Login failed.' }
    }
  }

  const logout = () => {
    tokenStore.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: !!user }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
