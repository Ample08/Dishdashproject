import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { APP_NAME, APP_SHORT } from '../config/app.js'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await login(email, password)
    setSubmitting(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">{APP_SHORT}</div>
            <h1>Welcome to {APP_NAME}</h1>
            <p>Login to manage your restaurant orders.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
