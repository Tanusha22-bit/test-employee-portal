
import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAarf, updateAarfNotes } from '../../lib/api';

export default function AarfEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aarf, setAarf] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { getAarf(Number(id)).then(d=>{ setAarf(d.aarf); setNotes(d.aarf?.it_notes||''); }); }, [id]);
  async function handleSubmit(e:FormEvent){ e.preventDefault(); setSaving(true);
    try { await updateAarfNotes(Number(id),notes); navigate('/it/aarfs/'+id); }
    catch{ setSaving(false); }
  }
  if(!aarf) return <Layout title="Edit AARF"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if(aarf.acknowledged||aarf.it_manager_acknowledged) return <Layout title="Edit AARF"><div className="alert alert-warning">This AARF is locked after acknowledgement.</div></Layout>;
  return (
    <Layout title="Edit AARF Notes">
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item"><Link to={"/it/aarfs/"+id}>{aarf.aarf_reference}</Link></li><li className="breadcrumb-item active">Edit Notes</li></ol></nav>
      <div className="bg-white border rounded-3 p-4" style={{maxWidth:600}}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3"><label className="form-label fw-semibold">IT Notes / Remarks</label><textarea className="form-control" rows={5} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add any notes about asset provisioning, IT setup, etc."/></div>
          <div className="d-flex gap-2">
            <Link to={"/it/aarfs/"+id} className="btn btn-outline-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Notes'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
