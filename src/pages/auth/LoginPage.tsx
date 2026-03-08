import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await signIn(email, password)
    if (error) { setError(error); setLoading(false); return }
    // Redirect based on role after brief delay for profile to load
    setTimeout(() => {
      const role = profile?.role ?? 'employee'
      if (['hr_manager','hr_executive','hr_intern','superadmin','system_admin'].includes(role)) navigate('/hr/dashboard')
      else if (['it_manager','it_executive','it_intern'].includes(role)) navigate('/it/dashboard')
      else navigate('/dashboard')
    }, 500)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h4 className="mb-1"><i className="bi bi-building me-2"/>Employee Portal</h4>
          <p className="mb-0 opacity-75" style={{fontSize:14}}>Claritas Asia Sdn. Bhd.</p>
        </div>
        <div className="auth-body">
          {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-triangle me-2"/>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Work Email Address</label>
              <input type="email" className="form-control" placeholder="name@claritas.asia" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Password</label>
              <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <div className="mb-3 d-flex justify-content-end">
              <Link to="/forgot-password" className="small text-primary">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none',padding:12,fontWeight:600}}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"/> : null}Sign In
            </button>
          </form>
          <hr className="my-3"/>
          <p className="text-center small text-muted mb-0">Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
        </div>
      </div>
    </div>
  )
}
