import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ROLES } from '../config/roles.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'flavours_admin_auth'

// Demo accounts — one per role in the hierarchy
export const DEMO_USERS = {
  super_admin: {
    id: 1, name: 'Yash Dhakad', email: 'owner@flavours.ae',
    role: 'super_admin', brandId: null, branchId: null,
    scopeLabel: 'All Branches · System',
  },
  branch_admin: {
    id: 3, name: 'Aarav Mehta', email: 'marina@flavours.ae',
    role: 'branch_admin', brandId: 1, branchId: 1,
    scopeLabel: 'Karaz Yas Mall',
  },
  staff: {
    id: 4, name: 'Sara Khan', email: 'sara@flavours.ae',
    role: 'staff', brandId: 1, branchId: 1,
    scopeLabel: 'Karaz Yas Mall · Cashier',
  },
  catering_admin: {
    id: 5, name: 'Um Abdallah', email: 'bait@flavours.ae',
    role: 'catering_admin', brandId: null, branchId: null,
    scopeLabel: 'Bait Um Abdallah · Catering',
  },
}

const DEMO_PASSWORD = '123456'
const EMAIL_TO_ROLE = Object.fromEntries(
  Object.values(DEMO_USERS).map((u) => [u.email, u.role]),
)

function withMeta(user) {
  return { ...user, roleMeta: ROLES[user.role] }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setUser(withMeta(JSON.parse(saved)))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const persist = (u) => {
    const full = withMeta(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(full)
    return full
  }

  const login = async (email, password) => {
    const role = EMAIL_TO_ROLE[email?.trim().toLowerCase()]
    if (role && password === DEMO_PASSWORD) {
      persist(DEMO_USERS[role])
      return { success: true, role }
    }
    return { success: false, message: 'Invalid credentials. Try a demo role below.' }
  }

  const loginAs = (role) => {
    if (DEMO_USERS[role]) persist(DEMO_USERS[role])
  }

  // Demo perspective switch (keeps you logged in, swaps the lens)
  const switchRole = (role) => {
    if (DEMO_USERS[role]) persist(DEMO_USERS[role])
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, loginAs, switchRole, logout, isAuthenticated: !!user }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
