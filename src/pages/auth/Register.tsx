import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', work_email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const user = await registerUser(form.name, form.work_email, form.password);
    setLoading(false);
    if (!user) { setError('Registration failed. Email may already be in use.'); return; }
    setUser(user);
    navigate('/dashboard');
  }

  const upd = (k: string) => (e: any) => setForm(f => ({...f, [k]: e.target.value}));

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header"><h4><i className="bi bi-person-plus me-2"></i>Create Account</h4><p>Employee Portal</p></div>
        <div className="auth-body">
          {error && <div className="alert alert-danger small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label fw-semibold small">Full Name</label><input className="form-control" value={form.name} onChange={upd('name')} required autoFocus /></div>
            <div className="mb-3"><label className="form-label fw-semibold small">Work Email</label><input type="email" className="form-control" placeholder="name@claritas.asia" value={form.work_email} onChange={upd('work_email')} required /></div>
            <div className="mb-3"><label className="form-label fw-semibold small">Password</label><input type="password" className="form-control" placeholder="Min 8 characters" value={form.password} onChange={upd('password')} required /></div>
            <div className="mb-4"><label className="form-label fw-semibold small">Confirm Password</label><input type="password" className="form-control" value={form.confirm} onChange={upd('confirm')} required /></div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
          <hr className="my-3"/>
          <p className="text-center small text-muted mb-0">Already have an account? <Link to="/login" className="text-primary">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
