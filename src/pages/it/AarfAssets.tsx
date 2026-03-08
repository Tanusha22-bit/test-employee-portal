
import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAarf, getAvailableAssets, updateAarfAssets } from '../../lib/api';

export default function AarfAssets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aarf, setAarf] = useState<any>(null);
  const [current, setCurrent] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAarf(Number(id)).then(d=>{ setAarf(d.aarf); const aa = d.aarf?.onboardings?.asset_assignments||[]; setCurrent(aa); setSelected(aa.map((a:any)=>a.asset_inventory_id)); });
    getAvailableAssets().then(d=>setAvailable(d.assets||[]));
  }, [id]);

  function toggleAsset(assetId: number) {
    setSelected(s => s.includes(assetId) ? s.filter(x=>x!==assetId) : [...s, assetId]);
  }

  async function handleSubmit(e:FormEvent){ e.preventDefault(); setSaving(true);
    try { await updateAarfAssets(Number(id), selected, assignedDate); navigate('/it/aarfs/'+id); }
    catch(err:any){ alert(err.message); setSaving(false); }
  }

  if(!aarf) return <Layout title="Manage Assets"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if(aarf.acknowledged||aarf.it_manager_acknowledged) return <Layout title="Manage Assets"><div className="alert alert-warning">Locked after acknowledgement.</div></Layout>;

  // All assets: currently assigned (show even if status=unavailable) + available
  const currentAssetIds = current.map((a:any)=>a.asset_inventory_id);
  const currentAssets = current.map((a:any)=>a.asset_inventories).filter(Boolean);
  const allOptions = [...currentAssets, ...available.filter((a:any)=>!currentAssetIds.includes(a.id))];

  return (
    <Layout title="Manage Asset Assignments">
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item"><Link to={"/it/aarfs/"+id}>{aarf.aarf_reference}</Link></li><li className="breadcrumb-item active">Manage Assets</li></ol></nav>
      <div className="bg-white border rounded-3 p-4">
        <div className="alert alert-info small"><i className="bi bi-info-circle me-2"></i>Select all assets to assign to this employee. Previously assigned assets are pre-checked. Changes will release old assets back to available.</div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3"><label className="form-label fw-semibold small">Assigned Date *</label><input type="date" className="form-control form-control-sm" style={{maxWidth:200}} value={assignedDate} onChange={e=>setAssignedDate(e.target.value)} required /></div>
          <div className="mb-4">
            <label className="form-label fw-semibold small">Select Assets</label>
            {!allOptions.length && <p className="text-muted small">No assets available.</p>}
            <div className="row g-2">
              {allOptions.map((a:any)=>(
                <div className="col-md-6" key={a.id}>
                  <div className={"border rounded-3 p-3 "+(selected.includes(a.id)?'border-primary bg-light':'')} style={{cursor:'pointer'}} onClick={()=>toggleAsset(a.id)}>
                    <div className="d-flex align-items-center gap-2">
                      <input type="checkbox" className="form-check-input mt-0" checked={selected.includes(a.id)} onChange={()=>toggleAsset(a.id)} />
                      <div>
                        <div className="fw-semibold small">{a.asset_name}</div>
                        <div className="text-muted" style={{fontSize:11}}>{a.asset_tag} · {a.asset_type} · {a.serial_number}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to={"/it/aarfs/"+id} className="btn btn-outline-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':<><i className="bi bi-check-circle me-2"></i>Update Asset Assignments</>}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
