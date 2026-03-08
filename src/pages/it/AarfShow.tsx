
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getAarf } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canItAcknowledge } from '../../lib/auth';

export default function AarfShow() {
  const { id } = useParams();
  const { user } = useAuth();
  const [aarf, setAarf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [acking, setAcking] = useState(false);
  const [flash, setFlash] = useState<any>({});

  function load() { getAarf(Number(id)).then(d=>{ setAarf(d.aarf); setRemarks(d.aarf?.it_manager_remarks||''); }).finally(()=>setLoading(false)); }
  useEffect(load, [id]);

  async function handleAck() {
    setAcking(true);
    try {
      await fetch(`${import.meta.env.VITE_EDGE_URL}/aarfs/${id}/it-acknowledge`, { method:'POST', headers:{'Content-Type':'application/json','X-User-Id':String(user?.id),'X-User-Role':user?.role||''}, body:JSON.stringify({it_manager_remarks:remarks}) });
      setFlash({ success:'AARF acknowledged as IT Manager.' });
      load();
    } catch(e:any){ setFlash({error:e.message}); } finally{ setAcking(false); }
  }

  if(loading) return <Layout title="AARF"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if(!aarf) return <Layout title="AARF"><div className="alert alert-danger">Not found.</div></Layout>;

  const pd = aarf.onboardings?.personal_details||{};
  const wd = aarf.onboardings?.work_details||{};
  const assignments = aarf.onboardings?.asset_assignments||[];

  return (
    <Layout title="AARF Detail">
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <nav aria-label="breadcrumb"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item active">{aarf.aarf_reference}</li></ol></nav>
        <div className="d-flex gap-2">
          {!aarf.it_manager_acknowledged && !aarf.acknowledged && <Link to={"/it/aarfs/"+id+"/assets"} className="btn btn-outline-secondary btn-sm"><i className="bi bi-laptop me-1"></i>Manage Assets</Link>}
          {!aarf.it_manager_acknowledged && !aarf.acknowledged && <Link to={"/it/aarfs/"+id+"/edit"} className="btn btn-outline-secondary btn-sm"><i className="bi bi-pencil me-1"></i>Edit Notes</Link>}
        </div>
      </div>
      <Flash {...flash}/>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Employee Info</h6>
            <div className="info-row"><span className="info-label">Name</span><span className="info-value">{pd.full_name}</span></div>
            <div className="info-row"><span className="info-label">Designation</span><span className="info-value">{wd.designation}</span></div>
            <div className="info-row"><span className="info-label">Start Date</span><span className="info-value">{wd.start_date&&new Date(wd.start_date).toLocaleDateString('en-MY')}</span></div>
            <div className="info-row"><span className="info-label">Department</span><span className="info-value">{wd.department}</span></div>
            {aarf.it_notes && <><hr/><div className="text-muted small fw-semibold">IT Notes</div><div className="small mt-1">{aarf.it_notes}</div></>}
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Acknowledgement Status</h6>
            <div className="info-row"><span className="info-label">Reference</span><span className="info-value fw-semibold">{aarf.aarf_reference}</span></div>
            <div className="info-row"><span className="info-label">Employee</span><span className={"badge "+(aarf.acknowledged?'bg-success':'bg-warning text-dark')}>{aarf.acknowledged?'Acknowledged':'Pending'}</span></div>
            <div className="info-row"><span className="info-label">IT Manager</span><span className={"badge "+(aarf.it_manager_acknowledged?'bg-primary':'bg-secondary')}>{aarf.it_manager_acknowledged?('Acknowledged '+new Date(aarf.it_manager_acknowledged_at).toLocaleDateString('en-MY')):'Pending'}</span></div>
            {aarf.it_manager_remarks && <div className="info-row"><span className="info-label">IT Remarks</span><span className="info-value">{aarf.it_manager_remarks}</span></div>}
            {canItAcknowledge(user?.role||'') && !aarf.it_manager_acknowledged && (
              <div className="mt-3">
                <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Optional remarks..." value={remarks} onChange={e=>setRemarks(e.target.value)}/>
                <button className="btn btn-primary btn-sm w-100" onClick={handleAck} disabled={acking}>{acking?'Acknowledging...':'✓ I Acknowledge (IT Manager)'}</button>
              </div>
            )}
          </div>
        </div>
        <div className="col-12">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Assigned Assets</h6>
            {assignments.length ? <table className="table table-sm"><thead><tr><th>Tag</th><th>Asset</th><th>Type</th><th>Brand/Model</th><th>Serial</th><th>Date</th></tr></thead><tbody>
              {assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_tag}</td><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.brand} {a.asset_inventories?.model}</td><td className="small">{a.asset_inventories?.serial_number}</td><td className="small">{a.assigned_date&&new Date(a.assigned_date).toLocaleDateString('en-MY')}</td></tr>)}
            </tbody></table> : <p className="text-muted small">No assets assigned.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
