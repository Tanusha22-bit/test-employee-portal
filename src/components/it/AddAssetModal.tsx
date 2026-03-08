import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Props { employees: any[]; onClose: ()=>void; onSaved: ()=>void }
const EMPTY: any = {asset_tag:'',asset_type:'laptop',brand:'',model:'',serial_number:'',processor:'',ram_size:'',storage:'',operating_system:'',screen_size:'',spec_others:'',purchase_date:'',purchase_vendor:'',purchase_cost:'',warranty_expiry_date:'',status:'available',assigned_employee_id:'',asset_assigned_date:'',expected_return_date:'',asset_condition:'new',maintenance_status:'none',last_maintenance_date:'',notes:''}

export default function AddAssetModal({ employees, onClose, onSaved }: Props) {
  const { canEditAllAsset } = useAuth()
  const [form, setForm] = useState({...EMPTY})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true); setError(null)
    const asset_name = `${form.brand} ${form.model}`.trim()
    const insert: any = {asset_tag:form.asset_tag,asset_name,asset_type:form.asset_type,brand:form.brand||null,model:form.model||null,serial_number:form.serial_number||null,processor:form.processor||null,ram_size:form.ram_size||null,storage:form.storage||null,operating_system:form.operating_system||null,screen_size:form.screen_size||null,spec_others:form.spec_others||null,status:'available',asset_condition:'new',maintenance_status:'none',notes:form.notes||null}
    if (canEditAllAsset) {
      Object.assign(insert,{purchase_date:form.purchase_date||null,purchase_vendor:form.purchase_vendor||null,purchase_cost:form.purchase_cost||null,warranty_expiry_date:form.warranty_expiry_date||null,status:form.status||'available',assigned_employee_id:form.assigned_employee_id||null,asset_assigned_date:form.asset_assigned_date||null,expected_return_date:form.expected_return_date||null,asset_condition:form.asset_condition||'new',maintenance_status:form.maintenance_status||'none',last_maintenance_date:form.last_maintenance_date||null})
    }
    const {error:e} = await supabase.from('asset_inventories').insert(insert)
    if (e) { setError(e.message||'Asset tag may already exist.'); setSaving(false); return }
    onSaved(); onClose()
  }

  useEffect(()=>{
    const el = document.getElementById('addAssetModal')!
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(el)
    modal.show(); return ()=>modal.hide()
  },[])

  const F = ({label,name,type='text',placeholder='',full=false}:any) => (
    <div className={full?'col-12':'col-md-4'}><label className="form-label small fw-semibold">{label}</label>
    <input type={type} className="form-control form-control-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)} placeholder={placeholder}/></div>
  )

  return (
    <div className="modal fade" id="addAssetModal" tabIndex={-1} data-bs-backdrop="static">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
            <h5 className="modal-title text-white fw-bold"><i className="bi bi-plus-circle me-2"/>Add New Asset</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}/>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-tag me-2"/>Section A — Basic Info</div>
              <div className="row g-3">
                <F label="Asset Tag *" name="asset_tag" placeholder="e.g. LPT-003"/>
                <div className="col-md-4"><label className="form-label small fw-semibold">Asset Type *</label><select className="form-select form-select-sm" value={form.asset_type} onChange={e=>s('asset_type',e.target.value)}>{['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())}</option>)}</select></div>
                <F label="Brand *" name="brand"/>
                <F label="Model *" name="model"/>
                <F label="Serial Number *" name="serial_number"/>
              </div>
            </div>
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-cpu me-2"/>Section B — Specifications</div>
              <div className="row g-3">
                <F label="Processor" name="processor"/>
                <F label="RAM Size" name="ram_size" placeholder="e.g. 16GB DDR5"/>
                <F label="Storage" name="storage" placeholder="e.g. 512GB NVMe SSD"/>
                <F label="Operating System" name="operating_system"/>
                <F label="Screen Size" name="screen_size"/>
                <F label="Other Specs" name="spec_others"/>
              </div>
            </div>
            {canEditAllAsset && <>
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-receipt me-2"/>Section C — Procurement</div>
              <div className="row g-3">
                <F label="Purchase Date" name="purchase_date" type="date"/>
                <F label="Vendor / Supplier" name="purchase_vendor"/>
                <F label="Purchase Cost (RM)" name="purchase_cost" type="number"/>
                <F label="Warranty Expiry" name="warranty_expiry_date" type="date"/>
              </div>
            </div>
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-person-badge me-2"/>Section D — Assignment & Condition</div>
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label small fw-semibold">Status</label><select className="form-select form-select-sm" value={form.status} onChange={e=>s('status',e.target.value)}>{['available','assigned','under_maintenance','retired'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}</select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Assigned To</label><select className="form-select form-select-sm" value={form.assigned_employee_id} onChange={e=>s('assigned_employee_id',e.target.value)}><option value="">None</option>{employees.map(e=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
                <F label="Assigned Date" name="asset_assigned_date" type="date"/>
                <F label="Expected Return" name="expected_return_date" type="date"/>
                <div className="col-md-4"><label className="form-label small fw-semibold">Condition</label><select className="form-select form-select-sm" value={form.asset_condition} onChange={e=>s('asset_condition',e.target.value)}>{['new','good','fair','damaged'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Maintenance Status</label><select className="form-select form-select-sm" value={form.maintenance_status} onChange={e=>s('maintenance_status',e.target.value)}><option value="none">None</option><option value="under_maintenance">Under Maintenance</option><option value="repair_required">Repair Required</option></select></div>
                <F label="Remarks / Notes" name="notes" full/>
              </div>
            </div>
            </>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-check-circle me-2"/>}Add Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}