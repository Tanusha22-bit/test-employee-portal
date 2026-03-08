import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(null)
    const { error } = await signUp(email, password, name)
    if (error) { setError(error); setLoading(false); return }
    navigate('/dashboard')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h4 className="mb-1"><i className="bi bi-person-plus me-2"/>Create Account</h4>
          <p className="mb-0 opacity-75" style={{fontSize:14}}>Employee Portal</p>
        </div>
        <div className="auth-body">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label fw-semibold small">Full Name</label><input type="text" className="form-control" value={name} onChange={e=>setName(e.target.value)} required autoFocus/></div>
            <div className="mb-3"><label className="form-label fw-semibold small">Work Email</label><input type="email" className="form-control" placeholder="name@claritas.asia" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="mb-3"><label className="form-label fw-semibold small">Password</label><input type="password" className="form-control" placeholder="Min 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
            <div className="mb-4"><label className="form-label fw-semibold small">Confirm Password</label><input type="password" className="form-control" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none',padding:12,fontWeight:600}}>
              {loading && <span className="spinner-border spinner-border-sm me-2"/>}Create Account
            </button>
          </form>
          <hr className="my-3"/>
          <p className="text-center small text-muted mb-0">Already have an account? <Link to="/login" className="text-primary">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
