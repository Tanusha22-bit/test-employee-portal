import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function AccountPage() {
  const { profile } = useAuth()
  const [current, setCurrent] = useState(''); const [newPw, setNewPw] = useState(''); const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string|null>(null); const [success, setSuccess] = useState<string|null>(null); const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null)
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPw !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('Password updated successfully!'); setCurrent(''); setNewPw(''); setConfirm('')
  }

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="bg-white border rounded-3 p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-person-circle me-2 text-primary"/>Account Information</h6>
          <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{profile?.name}</span></div>
          <div className="detail-row"><span className="detail-label">Work Email</span><span className="detail-value">{profile?.work_email}</span></div>
          <div className="detail-row"><span className="detail-label">Role</span><span className="detail-value text-capitalize">{profile?.role?.replace(/_/g,' ')}</span></div>
          <div className="detail-row"><span className="detail-label">Status</span><span className={`badge ${profile?.is_active?'bg-success':'bg-danger'}`}>{profile?.is_active?'Active':'Inactive'}</span></div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="bg-white border rounded-3 p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-key me-2 text-primary"/>Change Password</h6>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {success && <div className="alert alert-success py-2 small">{success}</div>}
          <form onSubmit={handleChangePassword}>
            <div className="mb-3"><label className="form-label small fw-semibold">New Password</label><input type="password" className="form-control form-control-sm" placeholder="Min 8 characters" value={newPw} onChange={e=>setNewPw(e.target.value)} required/></div>
            <div className="mb-3"><label className="form-label small fw-semibold">Confirm New Password</label><input type="password" className="form-control form-control-sm" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>
            <button type="submit" className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} disabled={loading}>
              {loading?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-lock me-2"/>}Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}