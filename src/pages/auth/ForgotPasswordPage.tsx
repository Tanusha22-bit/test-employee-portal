import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header"><h4 className="mb-1">Reset Password</h4><p className="mb-0 opacity-75" style={{fontSize:14}}>Enter your work email to receive a reset link</p></div>
        <div className="auth-body">
          {sent ? (
            <div className="text-center py-3">
              <i className="bi bi-envelope-check text-success" style={{fontSize:48}}/>
              <h6 className="mt-3 fw-bold">Check your email</h6>
              <p className="text-muted small">If that email exists, a password reset link has been sent.</p>
              <Link to="/login" className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}}>Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="form-label fw-semibold small">Work Email Address</label><input type="email" className="form-control" placeholder="name@claritas.asia" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/></div>
              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading} style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none',padding:12,fontWeight:600}}>
                {loading && <span className="spinner-border spinner-border-sm me-2"/>}Send Reset Link
              </button>
              <div className="text-center"><Link to="/login" className="small text-primary">Back to login</Link></div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
