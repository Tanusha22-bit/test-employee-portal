
import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getAssets, createAsset, getAllEmployees } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canAddAsset, canEditAsset, canEditAllAsset } from '../../lib/auth';

const EMPTY = { asset_tag:'',asset_type:'',brand:'',model:'',serial_number:'',processor:'',ram_size:'',storage:'',operating_system:'',screen_size:'',spec_others:'',status:'available',purchase_date:'',purchase_vendor:'',purchase_cost:'',warranty_expiry_date:'',assigned_employee_id:'',asset_assigned_date:'',expected_return_date:'',asset_condition:'new',maintenance_status:'none',last_maintenance_date:'',notes:'' };

export default function AssetList() {
  const { user } = useAuth();
  const role = user?.role || '';
  const [sp, setSp] = useSearchParams();
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({...EMPTY});
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<any>({});
  const [totalPages, setTotalPages] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  const page = sp.get('page') || '1';
  const search = sp.get('search') || '';
  const status = sp.get('status') || '';
  const type = sp.get('type') || '';

  function load() {
    setLoading(true);
    const params:any = { page };
    if(search) params.search=search; if(status) params.status=status; if(type) params.type=type;
    getAssets(params).then(d => { setAssets(d.assets||[]); setStats(d.stats||{}); setTotalPages(Math.ceil((d.total||0)/15)); }).finally(()=>setLoading(false));
  }

  useEffect(load, [page, search, status, type]);
  useEffect(() => { getAllEmployees().then(d=>setEmployees(d.employees||[])); }, []);

  const upd = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));

  async function handleSubmit(e:any) {
    e.preventDefault(); setSubmitting(true);
    try {
      await createAsset(form);
      setFlash({ success:'Asset added successfully.' });
      setForm({...EMPTY});
      const modal = (window as any).bootstrap?.Modal?.getInstance(modalRef.current);
      modal?.hide();
      load();
    } catch(err:any) { setFlash({ error: err.message }); }
    finally { setSubmitting(false); }
  }

  function handleSearch(e:any) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const p:any = {};
    if(fd.get('search')) p.search=fd.get('search');
    if(fd.get('status')) p.status=fd.get('status');
    if(fd.get('type')) p.type=fd.get('type');
    setSp(p);
  }

  const statusColor:any = { available:'success',assigned:'primary',under_maintenance:'warning',retired:'secondary',unavailable:'primary' };

  return (
    <Layout title="Assets">
      <Flash {...flash}/>
      <div className="row g-3 mb-3">
        {[{l:'Available',v:stats.available||0,bg:'#d1fae5',c:'#059669',i:'bi-check-circle'},{l:'Assigned',v:stats.assigned||0,bg:'#dbeafe',c:'#2563eb',i:'bi-person-badge'},{l:'Maintenance',v:stats.under_maintenance||0,bg:'#fef3c7',c:'#d97706',i:'bi-tools'},{l:'Total',v:stats.total||0,bg:'#f1f5f9',c:'#64748b',i:'bi-laptop'}].map(s=>(
          <div className="col-sm-6 col-xl-3" key={s.l}><div className="stat-card p-3"><div className="d-flex align-items-center gap-3"><div style={{width:40,height:40,background:s.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:s.c,fontSize:18}}><i className={"bi "+s.i}></i></div><div><div className="text-muted small">{s.l}</div><div className="fw-bold">{s.v}</div></div></div></div></div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
          <input name="search" className="form-control form-control-sm" style={{width:200}} placeholder="Tag, name, brand..." defaultValue={search}/>
          <select name="status" className="form-select form-select-sm" style={{width:140}} defaultValue={status}><option value="">All Status</option>{['available','assigned','under_maintenance','retired','unavailable'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select>
          <select name="type" className="form-select form-select-sm" style={{width:130}} defaultValue={type}><option value="">All Types</option>{['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}</select>
          <button type="submit" className="btn btn-primary btn-sm"><i className="bi bi-search"></i></button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>setSp({})}><i className="bi bi-x"></i></button>
        </form>
        <div className="d-flex gap-2">
          {canAddAsset(role) && <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addAssetModal"><i className="bi bi-plus-circle me-1"></i>Add New Asset</button>}
        </div>
      </div>
      <div className="bg-white border rounded-3 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead><tr><th>Tag</th><th>Asset</th><th>Type</th><th>Serial</th><th>Status</th><th>Condition</th><th>Assigned To</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"/></td></tr>}
            {!loading && !assets.length && <tr><td colSpan={8} className="text-center py-4 text-muted"><i className="bi bi-inbox fs-4 d-block mb-1"></i>No assets found</td></tr>}
            {assets.map((a:any)=>(
              <tr key={a.id}>
                <td className="small fw-semibold">{a.asset_tag}</td>
                <td><div className="small fw-semibold">{a.asset_name}</div><div className="text-muted" style={{fontSize:11}}>{a.brand} {a.model}</div></td>
                <td className="small">{a.asset_type}</td>
                <td className="small text-muted">{a.serial_number||'—'}</td>
                <td><span className={"badge bg-"+(statusColor[a.status]||'secondary')}>{(a.status||'').replace(/_/g,' ')}</span></td>
                <td className="small">{a.asset_condition||'—'}</td>
                <td className="small">{a.employees?.full_name||'—'}</td>
                <td>
                  <Link to={"/assets/"+a.id} className="btn btn-outline-primary btn-sm py-0 px-2 me-1">View</Link>
                  {canEditAsset(role) && <Link to={"/assets/"+a.id+"/edit"} className="btn btn-outline-secondary btn-sm py-0 px-2">Edit</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <nav className="mt-3"><ul className="pagination pagination-sm justify-content-end">{Array.from({length:totalPages},(_,i)=><li key={i} className={"page-item "+(i+1===parseInt(page)?'active':'')}><button className="page-link" onClick={()=>setSp(p=>{const n=new URLSearchParams(p);n.set('page',String(i+1));return n;})}>{i+1}</button></li>)}</ul></nav>}

      {/* Add Asset Modal */}
      <div className="modal fade" id="addAssetModal" tabIndex={-1} data-bs-backdrop="static" ref={modalRef}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
              <h5 className="modal-title text-white fw-bold"><i className="bi bi-plus-circle me-2"></i>Add New Asset</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="section-hdr"><i className="bi bi-tag me-2"></i>Section A — Basic Info</div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4"><label className="form-label small fw-semibold">Asset Tag * <small className="text-muted">(e.g. LPT-004)</small></label><input className="form-control form-control-sm" value={form.asset_tag} onChange={upd('asset_tag')} required placeholder="LPT-004"/></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Asset Type *</label><select className="form-select form-select-sm" value={form.asset_type} onChange={upd('asset_type')} required><option value="">Select...</option>{['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())}</option>)}</select></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Brand *</label><input className="form-control form-control-sm" value={form.brand} onChange={upd('brand')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Model *</label><input className="form-control form-control-sm" value={form.model} onChange={upd('model')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Serial Number *</label><input className="form-control form-control-sm" value={form.serial_number} onChange={upd('serial_number')} required /></div>
                </div>
                <div className="section-hdr"><i className="bi bi-cpu me-2"></i>Section B — Specifications</div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4"><label className="form-label small fw-semibold">Processor</label><input className="form-control form-control-sm" value={form.processor} onChange={upd('processor')} /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">RAM</label><input className="form-control form-control-sm" value={form.ram_size} onChange={upd('ram_size')} placeholder="e.g. 16GB DDR5"/></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Storage</label><input className="form-control form-control-sm" value={form.storage} onChange={upd('storage')} placeholder="e.g. 512GB NVMe SSD"/></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">OS</label><input className="form-control form-control-sm" value={form.operating_system} onChange={upd('operating_system')} /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Screen Size</label><input className="form-control form-control-sm" value={form.screen_size} onChange={upd('screen_size')} /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Other Specs</label><input className="form-control form-control-sm" value={form.spec_others} onChange={upd('spec_others')} /></div>
                </div>
                {canEditAllAsset(role) && <>
                  <div className="section-hdr"><i className="bi bi-receipt me-2"></i>Section C — Procurement</div>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4"><label className="form-label small fw-semibold">Purchase Date</label><input type="date" className="form-control form-control-sm" value={form.purchase_date} onChange={upd('purchase_date')} /></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Vendor</label><input className="form-control form-control-sm" value={form.purchase_vendor} onChange={upd('purchase_vendor')} /></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Cost (RM)</label><input type="number" step="0.01" className="form-control form-control-sm" value={form.purchase_cost} onChange={upd('purchase_cost')} /></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Warranty Expiry</label><input type="date" className="form-control form-control-sm" value={form.warranty_expiry_date} onChange={upd('warranty_expiry_date')} /></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Status</label><select className="form-select form-select-sm" value={form.status} onChange={upd('status')}><option value="available">Available</option><option value="assigned">Assigned</option><option value="under_maintenance">Under Maintenance</option><option value="retired">Retired</option></select></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Assigned To</label><select className="form-select form-select-sm" value={form.assigned_employee_id} onChange={upd('assigned_employee_id')}><option value="">None</option>{employees.map((e:any)=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Assigned Date</label><input type="date" className="form-control form-control-sm" value={form.asset_assigned_date} onChange={upd('asset_assigned_date')} /></div>
                  </div>
                  <div className="section-hdr"><i className="bi bi-clipboard-check me-2"></i>Section D — Condition</div>
                  <div className="row g-3">
                    <div className="col-md-4"><label className="form-label small fw-semibold">Condition</label><select className="form-select form-select-sm" value={form.asset_condition} onChange={upd('asset_condition')}><option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="damaged">Damaged</option></select></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Maintenance Status</label><select className="form-select form-select-sm" value={form.maintenance_status} onChange={upd('maintenance_status')}><option value="none">None</option><option value="under_maintenance">Under Maintenance</option><option value="repair_required">Repair Required</option></select></div>
                    <div className="col-md-4"><label className="form-label small fw-semibold">Last Maintenance</label><input type="date" className="form-control form-control-sm" value={form.last_maintenance_date} onChange={upd('last_maintenance_date')} /></div>
                    <div className="col-12"><label className="form-label small fw-semibold">Notes</label><textarea className="form-control form-control-sm" rows={2} value={form.notes} onChange={upd('notes')} /></div>
                  </div>
                </>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : <><i className="bi bi-check-circle me-2"></i>Add Asset</>}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
