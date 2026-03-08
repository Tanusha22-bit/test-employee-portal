import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser, dashboardFor } from '../../lib/auth';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const user = await loginUser(email, password);
    setLoading(false);
    if (!user) { setError('Invalid email or password. Please try again.'); return; }
    if (!user.is_active) { setError('This account has been deactivated. Contact HR.'); return; }
    setUser(user);
    navigate(dashboardFor(user.role));
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <h4><i className="bi bi-building me-2"></i>Employee Portal</h4>
          <p>Claritas Asia Sdn. Bhd.</p>
        </div>
        <div className="auth-body">
          {error && <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
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
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Signing in...</> : 'Sign In'}
            </button>
          </form>
          <hr className="my-3" />
          <p className="text-center small text-muted mb-0">No account? <Link to="/register" className="text-primary">Register here</Link></p>
          <div className="mt-3 p-3 bg-light rounded small">
            <div className="fw-semibold mb-1">Demo credentials (password: <code>password123</code>):</div>
            <div>HR Manager: <code>aisha.rahman@claritas.asia</code></div>
            <div>IT Manager: <code>raj.kumar@claritas.asia</code></div>
            <div>Employee: <code>ahmad.fadzil@claritas.asia</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
