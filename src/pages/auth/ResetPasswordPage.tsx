import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/login')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header"><h4 className="mb-1">Set New Password</h4></div>
        <div className="auth-body">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label fw-semibold small">New Password</label><input type="password" className="form-control" placeholder="Min 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
            <div className="mb-4"><label className="form-label fw-semibold small">Confirm New Password</label><input type="password" className="form-control" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none',padding:12,fontWeight:600}}>
              {loading && <span className="spinner-border spinner-border-sm me-2"/>}Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
