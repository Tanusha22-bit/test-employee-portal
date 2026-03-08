import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import crypto from 'crypto'

interface Props { hrUsers: any[]; itUsers: any[]; onClose: ()=>void; onSaved: ()=>void }

const EMPTY = {
  full_name:'',official_document_id:'',date_of_birth:'',sex:'male',marital_status:'single',
  religion:'',race:'',residential_address:'',personal_contact_number:'',personal_email:'',bank_account_number:'',
  employee_status:'active',staff_status:'new',employment_type:'permanent',designation:'',department:'',
  company:'Claritas Asia Sdn. Bhd.',office_location:'Kuala Lumpur HQ',reporting_manager:'',
  start_date:'',exit_date:'',company_email:'',google_id:'',hr_email:'',it_email:'',role:'executive_associate',
  laptop_provision:false,monitor_set:false,converter:false,company_phone:false,sim_card:false,access_card_request:false,office_keys:'',others:''
}

export default function OnboardingModal({ hrUsers, itUsers, onClose, onSaved }: Props) {
  const { canEditAllOnboarding } = useAuth()
  const [form, setForm] = useState({...EMPTY})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const set = (k: string, v: any) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true); setError(null)
    try {
      const { data:ob, error:e1 } = await supabase.from('onboardings').insert({status:'active',hr_email:form.hr_email,it_email:form.it_email}).select().single()
      if (e1 || !ob) throw new Error(e1?.message||'Failed to create onboarding')
      const id = ob.id
      await supabase.from('personal_details').insert({onboarding_id:id,full_name:form.full_name,official_document_id:form.official_document_id,date_of_birth:form.date_of_birth,sex:form.sex,marital_status:form.marital_status,religion:form.religion,race:form.race,residential_address:form.residential_address,personal_contact_number:form.personal_contact_number,personal_email:form.personal_email,bank_account_number:form.bank_account_number})
      await supabase.from('work_details').insert({onboarding_id:id,employee_status:form.employee_status,staff_status:form.staff_status,employment_type:form.employment_type,designation:form.designation,department:form.department||null,company:form.company,office_location:form.office_location,reporting_manager:form.reporting_manager,start_date:form.start_date,exit_date:form.exit_date||null,company_email:form.company_email||null,google_id:form.google_id||null,role:form.role||null})
      await supabase.from('asset_provisionings').insert({onboarding_id:id,laptop_provision:form.laptop_provision,monitor_set:form.monitor_set,converter:form.converter,company_phone:form.company_phone,sim_card:form.sim_card,access_card_request:form.access_card_request,office_keys:form.office_keys||null,others:form.others||null})
      // Generate AARF
      const initials = form.full_name.trim().split(/\s+/).slice(0,2).map((w,i)=>i===0?w[0]:(w.substring(0,2))).join('').toUpperCase()
      const aarf_reference = `AARF-${initials}${String(id).padStart(3,'0')}-${new Date().getFullYear()}`
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('')
      await supabase.from('aarfs').insert({onboarding_id:id,aarf_reference,acknowledgement_token:token})
      // Auto-assign available assets
      const provTypes: Record<string,string> = {laptop_provision:'laptop',monitor_set:'monitor',converter:'converter',company_phone:'phone',sim_card:'sim_card',access_card_request:'access_card'}
      for (const [field,assetType] of Object.entries(provTypes)) {
        if ((form as any)[field]) {
          const {data:avail} = await supabase.from('asset_inventories').select('id').eq('status','available').eq('asset_type',assetType).limit(1)
          if (avail?.length) {
            await supabase.from('asset_assignments').insert({onboarding_id:id,asset_inventory_id:avail[0].id,assigned_date:new Date().toISOString().slice(0,10),status:'assigned'})
            await supabase.from('asset_inventories').update({status:'unavailable'}).eq('id',avail[0].id)
          }
        }
      }
      // Send welcome email via Edge Function
      await supabase.functions.invoke('send-welcome-email', { body: { onboarding_id: id, personal_email: form.personal_email, full_name: form.full_name, designation: form.designation, department: form.department, start_date: form.start_date, office_location: form.office_location, reporting_manager: form.reporting_manager, company_email: form.company_email, hr_email: form.hr_email, it_email: form.it_email, aarf_token: token } })
      onSaved(); onClose()
    } catch(e:any) { setError(e.message) } finally { setSaving(false) }
  }

  // Bootstrap modal activation
  useEffect(()=>{
    const el = document.getElementById('onboardingModal')!
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(el)
    modal.show()
    return ()=>modal.hide()
  },[])

  return (
    <div className="modal fade" id="onboardingModal" tabIndex={-1} data-bs-backdrop="static">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
            <h5 className="modal-title text-white fw-bold"><i className="bi bi-person-plus me-2"/>Add New Onboarding</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}/>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {/* Section A */}
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-person me-2"/>Section A — Personal Details</div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label small fw-semibold">Full Name *</label><input className="form-control form-control-sm" value={form.full_name} onChange={e=>set('full_name',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">NRIC / Passport *</label><input className="form-control form-control-sm" value={form.official_document_id} onChange={e=>set('official_document_id',e.target.value)} required/></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Date of Birth *</label><input type="date" className="form-control form-control-sm" value={form.date_of_birth} onChange={e=>set('date_of_birth',e.target.value)} required/></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Sex *</label><select className="form-select form-select-sm" value={form.sex} onChange={e=>set('sex',e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Marital Status *</label><select className="form-select form-select-sm" value={form.marital_status} onChange={e=>set('marital_status',e.target.value)}>{['single','married','divorced','widowed'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Religion *</label><input className="form-control form-control-sm" value={form.religion} onChange={e=>set('religion',e.target.value)} required/></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Race *</label><input className="form-control form-control-sm" value={form.race} onChange={e=>set('race',e.target.value)} required/></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Contact Number *</label><input className="form-control form-control-sm" value={form.personal_contact_number} onChange={e=>set('personal_contact_number',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Personal Email *</label><input type="email" className="form-control form-control-sm" value={form.personal_email} onChange={e=>set('personal_email',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Bank Account Number *</label><input className="form-control form-control-sm" value={form.bank_account_number} onChange={e=>set('bank_account_number',e.target.value)} required/></div>
                <div className="col-12"><label className="form-label small fw-semibold">Residential Address *</label><textarea className="form-control form-control-sm" rows={2} value={form.residential_address} onChange={e=>set('residential_address',e.target.value)} required/></div>
              </div>
            </div>
            {/* Section B */}
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-briefcase me-2"/>Section B — Work Details</div>
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label small fw-semibold">Employee Status</label><select className="form-select form-select-sm" value={form.employee_status} onChange={e=>set('employee_status',e.target.value)}><option value="active">Active</option><option value="resigned">Resigned</option></select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Staff Status</label><select className="form-select form-select-sm" value={form.staff_status} onChange={e=>set('staff_status',e.target.value)}><option value="new">New</option><option value="existing">Existing</option></select></div>
                <div className="col-md-4"><label className="form-label small fw-semibold">Employment Type *</label><select className="form-select form-select-sm" value={form.employment_type} onChange={e=>set('employment_type',e.target.value)}><option value="permanent">Permanent</option><option value="intern">Intern</option><option value="contract">Contract</option></select></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Designation *</label><input className="form-control form-control-sm" value={form.designation} onChange={e=>set('designation',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Department</label><input className="form-control form-control-sm" value={form.department} onChange={e=>set('department',e.target.value)}/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Company *</label><input className="form-control form-control-sm" value={form.company} onChange={e=>set('company',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Office Location *</label><input className="form-control form-control-sm" value={form.office_location} onChange={e=>set('office_location',e.target.value)} required/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Reporting Manager *</label><input className="form-control form-control-sm" value={form.reporting_manager} onChange={e=>set('reporting_manager',e.target.value)} required/></div>
                <div className="col-md-3"><label className="form-label small fw-semibold">Start Date *</label><input type="date" className="form-control form-control-sm" value={form.start_date} onChange={e=>set('start_date',e.target.value)} required/></div>
                <div className="col-md-3"><label className="form-label small fw-semibold">Exit Date</label><input type="date" className="form-control form-control-sm" value={form.exit_date} onChange={e=>set('exit_date',e.target.value)}/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Company Email</label><input type="email" className="form-control form-control-sm" value={form.company_email} onChange={e=>set('company_email',e.target.value)}/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Google Workspace ID</label><input className="form-control form-control-sm" value={form.google_id} onChange={e=>set('google_id',e.target.value)}/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">HR In-Charge *</label><select className="form-select form-select-sm" value={form.hr_email} onChange={e=>set('hr_email',e.target.value)} required><option value="">Select HR staff...</option>{hrUsers.map(u=><option key={u.work_email} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">IT In-Charge *</label><select className="form-select form-select-sm" value={form.it_email} onChange={e=>set('it_email',e.target.value)} required><option value="">Select IT staff...</option>{itUsers.map(u=><option key={u.work_email} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
              </div>
            </div>
            {/* Section C — Assets (Manager only) */}
            {canEditAllOnboarding && (
            <div className="mb-4">
              <div className="section-header-bar rounded mb-3"><i className="bi bi-laptop me-2"/>Section C — Asset Provisioning</div>
              <div className="row g-3">
                {[['laptop_provision','Laptop / Notebook'],['monitor_set','Monitor Set'],['converter','Converter / USB Hub'],['company_phone','Company Phone'],['sim_card','SIM Card'],['access_card_request','Access Card']].map(([f,l])=>(
                  <div key={f} className="col-md-4"><div className="form-check"><input className="form-check-input" type="checkbox" id={f} checked={(form as any)[f]} onChange={e=>set(f,e.target.checked)}/><label className="form-check-label small" htmlFor={f}>{l}</label></div></div>
                ))}
                <div className="col-md-6"><label className="form-label small fw-semibold">Office Keys</label><input className="form-control form-control-sm" value={form.office_keys} onChange={e=>set('office_keys',e.target.value)}/></div>
                <div className="col-md-6"><label className="form-label small fw-semibold">Others</label><textarea className="form-control form-control-sm" rows={2} value={form.others} onChange={e=>set('others',e.target.value)}/></div>
              </div>
            </div>
            )}
            {/* Section D — Role */}
            {canEditAllOnboarding && (
            <div>
              <div className="section-header-bar rounded mb-3"><i className="bi bi-award me-2"/>Section D — Role Level</div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Role Level</label>
                <select className="form-select form-select-sm" value={form.role} onChange={e=>set('role',e.target.value)}>
                  {[['manager','Manager'],['senior_executive','Senior Executive'],['executive_associate','Executive / Associate'],['director_hod','Director / HOD'],['hr_manager','HR Manager'],['hr_executive','HR Executive'],['hr_intern','HR Intern'],['it_manager','IT Manager'],['it_executive','IT Executive'],['it_intern','IT Intern'],['superadmin','Superadmin'],['system_admin','System Admin'],['others','Others']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-check-circle me-2"/>}Create Onboarding Record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}