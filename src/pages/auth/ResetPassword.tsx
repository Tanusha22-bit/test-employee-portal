import { useState, FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (password.length < 8 || password !== confirm) { setError('Passwords must match and be at least 8 characters.'); return; }
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_EDGE_URL}/auth/reset-password`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token, email, password }),
    });
    setLoading(false);
    if (res.ok) navigate('/login?reset=1');
    else setError('Invalid or expired reset link. Please request a new one.');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header"><h4>Set New Password</h4></div>
        <div className="auth-body">
          {error && <div className="alert alert-danger small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label fw-semibold small">New Password</label><input type="password" className="form-control" placeholder="Min 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus /></div>
            <div className="mb-4"><label className="form-label fw-semibold small">Confirm Password</label><input type="password" className="form-control" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
          <div className="text-center mt-3"><Link to="/login" className="small text-primary">← Back to login</Link></div>
        </div>
      </div>
    </div>
  );
}
