import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function AssetEditPage() {
  const { id } = useParams(); const { canEditAsset, canEditAllAsset } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<any>({})
  const [employees, setEmployees] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))

  useEffect(()=>{
    if (!canEditAsset) { navigate('/assets'); return }
    supabase.from('asset_inventories').select('*').eq('id',id).single().then(({data})=>{
      if (data) {
        const f = {...data}
        if (f.purchase_date) f.purchase_date = new Date(f.purchase_date).toISOString().slice(0,10)
        if (f.warranty_expiry_date) f.warranty_expiry_date = new Date(f.warranty_expiry_date).toISOString().slice(0,10)
        if (f.asset_assigned_date) f.asset_assigned_date = new Date(f.asset_assigned_date).toISOString().slice(0,10)
        if (f.expected_return_date) f.expected_return_date = new Date(f.expected_return_date).toISOString().slice(0,10)
        setForm(f)
      }
    })
    supabase.from('employees').select('id,full_name').is('active_until',null).not('full_name','is',null).order('full_name').then(({data})=>setEmployees(data||[]))
  },[id])

  const save = async () => {
    setSaving(true)
    const update: any = {asset_type:form.asset_type,brand:form.brand,model:form.model,serial_number:form.serial_number,asset_name:`${form.brand} ${form.model}`.trim(),processor:form.processor||null,ram_size:form.ram_size||null,storage:form.storage||null,operating_system:form.operating_system||null,screen_size:form.screen_size||null,spec_others:form.spec_others||null,notes:form.notes||null}
    if (canEditAllAsset) Object.assign(update,{purchase_date:form.purchase_date||null,purchase_vendor:form.purchase_vendor||null,purchase_cost:form.purchase_cost||null,warranty_expiry_date:form.warranty_expiry_date||null,status:form.status||'available',assigned_employee_id:form.assigned_employee_id||null,asset_assigned_date:form.asset_assigned_date||null,expected_return_date:form.expected_return_date||null,asset_condition:form.asset_condition||'new',maintenance_status:form.maintenance_status||'none',last_maintenance_date:form.last_maintenance_date||null})
    await supabase.from('asset_inventories').update(update).eq('id',id)
    navigate(`/assets/${id}`)
  }

  const F = ({label,name,type='text'}:any) => (
    <div className="col-md-4"><label className="form-label small fw-semibold">{label}</label>
    <input type={type} className="form-control form-control-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)}/></div>
  )

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb"><li className="breadcrumb-item"><Link to="/assets">Assets</Link></li><li className="breadcrumb-item"><Link to={`/assets/${id}`}>{form.asset_tag}</Link></li><li className="breadcrumb-item active">Edit</li></ol></nav>
      <div className="bg-white border rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3">Basic Info</h6>
        <div className="row g-3">
          <div className="col-md-4"><label className="form-label small fw-semibold">Asset Tag</label><input className="form-control form-control-sm" value={form.asset_tag||''} disabled/></div>
          <div className="col-md-4"><label className="form-label small fw-semibold">Asset Type</label><select className="form-select form-select-sm" value={form.asset_type||'laptop'} onChange={e=>s('asset_type',e.target.value)}>{['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}</select></div>
          <F label="Brand" name="brand"/><F label="Model" name="model"/><F label="Serial Number" name="serial_number"/>
        </div>
      </div>
      <div className="bg-white border rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3">Specifications</h6>
        <div className="row g-3">
          <F label="Processor" name="processor"/><F label="RAM Size" name="ram_size"/>
          <F label="Storage" name="storage"/><F label="OS" name="operating_system"/>
          <F label="Screen Size" name="screen_size"/><F label="Other Specs" name="spec_others"/>
        </div>
      </div>
      {canEditAllAsset && <div className="bg-white border rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3">Procurement & Assignment</h6>
        <div className="row g-3">
          <F label="Purchase Date" name="purchase_date" type="date"/>
          <F label="Vendor" name="purchase_vendor"/>
          <F label="Cost (RM)" name="purchase_cost" type="number"/>
          <F label="Warranty Expiry" name="warranty_expiry_date" type="date"/>
          <div className="col-md-4"><label className="form-label small fw-semibold">Status</label><select className="form-select form-select-sm" value={form.status||'available'} onChange={e=>s('status',e.target.value)}>{['available','assigned','under_maintenance','retired','unavailable'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label small fw-semibold">Assigned To</label><select className="form-select form-select-sm" value={form.assigned_employee_id||''} onChange={e=>s('assigned_employee_id',e.target.value)}><option value="">None</option>{employees.map(e=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
          <F label="Assigned Date" name="asset_assigned_date" type="date"/>
          <div className="col-md-4"><label className="form-label small fw-semibold">Condition</label><select className="form-select form-select-sm" value={form.asset_condition||'new'} onChange={e=>s('asset_condition',e.target.value)}>{['new','good','fair','damaged'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label small fw-semibold">Maintenance</label><select className="form-select form-select-sm" value={form.maintenance_status||'none'} onChange={e=>s('maintenance_status',e.target.value)}><option value="none">None</option><option value="under_maintenance">Under Maintenance</option><option value="repair_required">Repair Required</option></select></div>
        </div>
      </div>}
      <div className="d-flex gap-2 justify-content-end">
        <Link to={`/assets/${id}`} className="btn btn-outline-secondary">Cancel</Link>
        <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-check-circle me-2"/>}Save Changes
        </button>
      </div>
    </>
  )
}