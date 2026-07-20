import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { APP_NAME } from '../config/app.js'
import { homePathFor } from '../config/roles.js'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, loading, navigate])

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.success) navigate(homePathFor(result.user))
    else setError(result.message)
  }

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <aside className="login-aside">
        <div className="brand-row">
          <span className="brand-mark"><img src="/app-icon.jpeg" alt="logo" /></span>
          <span className="brand-name">{APP_NAME}</span>
        </div>

        <div className="aside-hero">
          <h2>Run every kitchen from one calm place.</h2>
          <p>Brands, branches, staff and live orders — all under one roof, beautifully organised.</p>
          <div className="aside-points">
            <div className="aside-point"><i className="las la-store" /> Multi-brand &amp; multi-branch control</div>
            <div className="aside-point"><i className="las la-bolt" /> Live order tracking &amp; alerts</div>
            <div className="aside-point"><i className="las la-user-shield" /> Role-based access for every team</div>
          </div>
        </div>

        <div className="aside-foot">Trusted by 6 branches across the UAE · 9,760+ orders served</div>
        <img className="login-mascot" src="/app-icon.jpeg" alt="" aria-hidden="true" />
      </aside>

      {/* Right form */}
      <main className="login-main">
        <div className="login-card">
          <div className="login-mark-mobile">
            <span className="lm"><img src="/app-icon.jpeg" alt="logo" /></span>
            <b>{APP_NAME}</b>
          </div>

          <h1>Step inside.</h1>
          <p className="lead">Sign in to your admin control center.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger"><i className="las la-exclamation-circle" />{error}</div>}

            <div className="form-group">
              <label>Email address</label>
              <div className="login-input-wrap">
                <i className="las la-envelope" />
                <input
                  type="email" className="form-control" placeholder="you@brand.ae"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="login-input-wrap">
                <i className="las la-lock" />
                <input
                  type={showPass ? 'text' : 'password'} className="form-control" placeholder="••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass((p) => !p)} aria-label="Toggle password">
                  <i className={showPass ? 'las la-eye-slash' : 'las la-eye'} />
                </button>
              </div>
            </div>

            <div className="login-form-row">
              <label className="checkbox-label">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <a className="forgot" href="#reset">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting && <i className="las la-arrow-right" />}
            </button>
          </form>

        </div>
      </main>
    </div>
  )
}
