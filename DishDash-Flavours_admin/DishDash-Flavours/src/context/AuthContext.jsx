import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'admin_auth'

const DEMO_USER = {
  id: 1,
  name: 'Admin',
  email: 'admin@admin.com',
  user_type: 'admin',
  avatar: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    if (email === 'admin@admin.com' && password === '123456') {
      const authUser = { ...DEMO_USER, email }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
      setUser(authUser)
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
