
import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getAsset, updateAsset, getAllEmployees } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canEditAllAsset } from '../../lib/auth';

export default function AssetEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [flash, setFlash] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const editAll = canEditAllAsset(user?.role||'');
  useEffect(() => {
    getAsset(Number(id)).then(d=>{
      const a = d.asset;
      setForm({...a,
        purchase_date:a.purchase_date?new Date(a.purchase_date).toISOString().slice(0,10):'',
        warranty_expiry_date:a.warranty_expiry_date?new Date(a.warranty_expiry_date).toISOString().slice(0,10):'',
        asset_assigned_date:a.asset_assigned_date?new Date(a.asset_assigned_date).toISOString().slice(0,10):'',
        expected_return_date:a.expected_return_date?new Date(a.expected_return_date).toISOString().slice(0,10):'',
        last_maintenance_date:a.last_maintenance_date?new Date(a.last_maintenance_date).toISOString().slice(0,10):'',
        assigned_employee_id:a.assigned_employee_id||'',
      });
    });
    getAllEmployees().then(d=>setEmployees(d.employees||[]));
  }, [id]);
  const upd = (k:string) => (e:any) => setForm((f:any)=>({...f,[k]:e.target.value}));
  async function handleSubmit(e:FormEvent){
    e.preventDefault(); setSaving(true);
    try { await updateAsset(Number(id), form); navigate('/assets/'+id); }
    catch(err:any){ setFlash({error:err.message}); setSaving(false); }
  }
  if(!form) return <Layout title="Edit Asset"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  return (
    <Layout title="Edit Asset">
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb"><li className="breadcrumb-item"><Link to="/assets">Assets</Link></li><li className="breadcrumb-item"><Link to={"/assets/"+id}>{form.asset_tag}</Link></li><li className="breadcrumb-item active">Edit</li></ol></nav>
      <Flash {...flash}/>
      <form onSubmit={handleSubmit}>
        <div className="bg-white border rounded-3 p-4 mb-3">
          <div className="section-hdr"><i className="bi bi-tag me-2"></i>Basic Info</div>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label small fw-semibold">Asset Tag</label><input className="form-control form-control-sm" value={form.asset_tag} disabled /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Type *</label><select className="form-select form-select-sm" value={form.asset_type||''} onChange={upd('asset_type')} required>{['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Brand *</label><input className="form-control form-control-sm" value={form.brand||''} onChange={upd('brand')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Model *</label><input className="form-control form-control-sm" value={form.model||''} onChange={upd('model')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Serial Number *</label><input className="form-control form-control-sm" value={form.serial_number||''} onChange={upd('serial_number')} required /></div>
          </div>
        </div>
        <div className="bg-white border rounded-3 p-4 mb-3">
          <div className="section-hdr"><i className="bi bi-cpu me-2"></i>Specifications</div>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label small fw-semibold">Processor</label><input className="form-control form-control-sm" value={form.processor||''} onChange={upd('processor')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">RAM</label><input className="form-control form-control-sm" value={form.ram_size||''} onChange={upd('ram_size')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Storage</label><input className="form-control form-control-sm" value={form.storage||''} onChange={upd('storage')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">OS</label><input className="form-control form-control-sm" value={form.operating_system||''} onChange={upd('operating_system')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Screen Size</label><input className="form-control form-control-sm" value={form.screen_size||''} onChange={upd('screen_size')} /></div>
          </div>
        </div>
        {editAll && <>
          <div className="bg-white border rounded-3 p-4 mb-3">
            <div className="section-hdr"><i className="bi bi-receipt me-2"></i>Procurement & Assignment</div>
            <div className="row g-3">
              <div className="col-md-3"><label className="form-label small fw-semibold">Status</label><select className="form-select form-select-sm" value={form.status||''} onChange={upd('status')}><option value="available">Available</option><option value="assigned">Assigned</option><option value="under_maintenance">Under Maintenance</option><option value="retired">Retired</option></select></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Purchase Date</label><input type="date" className="form-control form-control-sm" value={form.purchase_date||''} onChange={upd('purchase_date')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Vendor</label><input className="form-control form-control-sm" value={form.purchase_vendor||''} onChange={upd('purchase_vendor')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Cost (RM)</label><input type="number" step="0.01" className="form-control form-control-sm" value={form.purchase_cost||''} onChange={upd('purchase_cost')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Warranty Expiry</label><input type="date" className="form-control form-control-sm" value={form.warranty_expiry_date||''} onChange={upd('warranty_expiry_date')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Assigned To</label><select className="form-select form-select-sm" value={form.assigned_employee_id||''} onChange={upd('assigned_employee_id')}><option value="">None</option>{employees.map((e:any)=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Assigned Date</label><input type="date" className="form-control form-control-sm" value={form.asset_assigned_date||''} onChange={upd('asset_assigned_date')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Return Date</label><input type="date" className="form-control form-control-sm" value={form.expected_return_date||''} onChange={upd('expected_return_date')} /></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Condition</label><select className="form-select form-select-sm" value={form.asset_condition||''} onChange={upd('asset_condition')}><option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="damaged">Damaged</option></select></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Maintenance Status</label><select className="form-select form-select-sm" value={form.maintenance_status||''} onChange={upd('maintenance_status')}><option value="none">None</option><option value="under_maintenance">Under Maintenance</option><option value="repair_required">Repair Required</option></select></div>
              <div className="col-md-3"><label className="form-label small fw-semibold">Last Maintenance</label><input type="date" className="form-control form-control-sm" value={form.last_maintenance_date||''} onChange={upd('last_maintenance_date')} /></div>
              <div className="col-12"><label className="form-label small fw-semibold">Notes</label><textarea className="form-control form-control-sm" rows={2} value={form.notes||''} onChange={upd('notes')} /></div>
            </div>
          </div>
        </>}
        <div className="d-flex gap-2 justify-content-end">
          <Link to={"/assets/"+id} className="btn btn-outline-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':<><i className="bi bi-check-circle me-2"></i>Save Changes</>}</button>
        </div>
      </form>
    </Layout>
  );
}
