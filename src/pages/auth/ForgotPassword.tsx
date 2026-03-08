import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordReset } from '../../lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    await sendPasswordReset(email);
    setLoading(false); setSent(true);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header"><h4>Reset Password</h4><p>Enter your work email to receive a reset link</p></div>
        <div className="auth-body">
          {sent ? <div className="alert alert-success">If that email exists, a reset link has been sent to <strong>{email}</strong>.</div> : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="form-label fw-semibold small">Work Email Address</label><input type="email" className="form-control" placeholder="name@claritas.asia" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus /></div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
          )}
          <div className="text-center mt-3"><Link to="/login" className="small text-primary">← Back to login</Link></div>
        </div>
      </div>
    </div>
  );
}
