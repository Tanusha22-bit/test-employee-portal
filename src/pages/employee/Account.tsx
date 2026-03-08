
import { useState, FormEvent } from 'react';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { useAuth } from '../../context/AuthContext';

export default function Account() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current:'', password:'', confirm:'' });
  const [flash, setFlash] = useState<any>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e:FormEvent){ e.preventDefault(); setFlash({});
    if(form.password.length<8){ setFlash({error:'Password must be at least 8 characters.'}); return; }
    if(form.password!==form.confirm){ setFlash({error:'Passwords do not match.'}); return; }
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_EDGE_URL}/auth/change-password`, {
        method:'POST', headers:{'Content-Type':'application/json','X-User-Id':String(user?.id),'X-User-Role':user?.role||''},
        body: JSON.stringify({ current_password:form.current, new_password:form.password }),
      });
      if(!res.ok) { const d = await res.json(); throw new Error(d.error||'Failed'); }
      setFlash({success:'Password updated successfully.'}); setForm({current:'',password:'',confirm:''});
    } catch(err:any){ setFlash({error:err.message}); } finally{ setSaving(false); }
  }

  return (
    <Layout title="Account Settings">
      <Flash {...flash}/>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-person-circle me-2 text-primary"></i>Account Info</h6>
            <div className="info-row"><span className="info-label">Name</span><span className="info-value fw-semibold">{user?.name}</span></div>
            <div className="info-row"><span className="info-label">Work Email</span><span className="info-value">{user?.work_email}</span></div>
            <div className="info-row"><span className="info-label">Role</span><span className="info-value text-capitalize">{user?.role?.replace(/_/g,' ')}</span></div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-lock me-2 text-primary"></i>Change Password</h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="form-label small fw-semibold">Current Password</label><input type="password" className="form-control form-control-sm" value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))} required /></div>
              <div className="mb-3"><label className="form-label small fw-semibold">New Password</label><input type="password" className="form-control form-control-sm" placeholder="Min 8 characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required /></div>
              <div className="mb-4"><label className="form-label small fw-semibold">Confirm New Password</label><input type="password" className="form-control form-control-sm" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} required /></div>
              <button type="submit" className="btn btn-primary btn-sm w-100" disabled={saving}>{saving?'Updating...':'Update Password'}</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
