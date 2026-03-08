import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('biodata')
  const [emp, setEmp] = useState<any>({})
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string|null>(null)

  useEffect(()=>{
    if (!user) return
    supabase.from('employees').select('*').eq('user_id',user.id).single().then(({data})=>{
      const d = data||{}
      if (d.date_of_birth) d.date_of_birth = new Date(d.date_of_birth).toISOString().slice(0,10)
      if (d.start_date) d.start_date = new Date(d.start_date).toISOString().slice(0,10)
      setEmp(d); setForm(d)
    })
  },[user])

  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))

  const saveSection = async (fields: string[]) => {
    setSaving(true); setSuccess(null)
    const upd: any = {}; fields.forEach(k=>upd[k]=form[k]||null)
    if (emp.id) await supabase.from('employees').update(upd).eq('id',emp.id)
    else await supabase.from('employees').insert({user_id:user!.id,active_from:new Date().toISOString().slice(0,10),...upd})
    setSaving(false); setSuccess('Updated successfully.')
    setTimeout(()=>setSuccess(null),3000)
  }

  const F = ({label,name,type='text'}:any) => (
    <div className="col-md-6"><label className="form-label small fw-semibold">{label}</label>
    <input type={type} className="form-control form-control-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)}/></div>
  )
  const Sel = ({label,name,options}:any) => (
    <div className="col-md-6"><label className="form-label small fw-semibold">{label}</label>
    <select className="form-select form-select-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)}>
      {options.map(([v,l]:any)=><option key={v} value={v}>{l}</option>)}
    </select></div>
  )

  return (
    <>
      {success && <div className="alert alert-success py-2 small mb-3"><i className="bi bi-check-circle me-2"/>{success}</div>}
      <ul className="nav nav-tabs mb-4">
        {[['biodata','Personal Info'],['work','Work Info']].map(([k,l])=>(
          <li key={k} className="nav-item"><button className={`nav-link ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button></li>
        ))}
      </ul>
      {tab==='biodata' && (
        <div className="bg-white border rounded-3 p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-person me-2 text-primary"/>Personal Information</h6>
          <div className="row g-3">
            <F label="Full Name" name="full_name"/>
            <F label="NRIC / Passport" name="official_document_id"/>
            <F label="Date of Birth" name="date_of_birth" type="date"/>
            <Sel label="Sex" name="sex" options={[['','Select...'],['male','Male'],['female','Female']]}/>
            <Sel label="Marital Status" name="marital_status" options={[['','Select...'],['single','Single'],['married','Married'],['divorced','Divorced'],['widowed','Widowed']]}/>
            <F label="Religion" name="religion"/>
            <F label="Race" name="race"/>
            <F label="Contact Number" name="personal_contact_number"/>
            <F label="Personal Email" name="personal_email" type="email"/>
            <F label="Bank Account Number" name="bank_account_number"/>
            <div className="col-12"><label className="form-label small fw-semibold">Residential Address</label><textarea className="form-control form-control-sm" rows={2} value={form.residential_address||''} onChange={e=>s('residential_address',e.target.value)}/></div>
          </div>
          <div className="mt-3 d-flex justify-content-end">
            <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={()=>saveSection(['full_name','official_document_id','date_of_birth','sex','marital_status','religion','race','residential_address','personal_contact_number','personal_email','bank_account_number'])} disabled={saving}>
              {saving?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}Save Personal Info
            </button>
          </div>
        </div>
      )}
      {tab==='work' && (
        <div className="bg-white border rounded-3 p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"/>Work Information</h6>
          <div className="row g-3">
            <F label="Designation" name="designation"/>
            <F label="Department" name="department"/>
            <F label="Company" name="company"/>
            <F label="Office Location" name="office_location"/>
            <F label="Reporting Manager" name="reporting_manager"/>
            <F label="Company Email" name="company_email" type="email"/>
            <F label="Start Date" name="start_date" type="date"/>
            <Sel label="Employment Type" name="employment_type" options={[['','Select...'],['permanent','Permanent'],['intern','Intern'],['contract','Contract']]}/>
          </div>
          <div className="mt-3 d-flex justify-content-end">
            <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={()=>saveSection(['designation','department','company','office_location','reporting_manager','company_email','start_date','employment_type'])} disabled={saving}>
              {saving?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}Save Work Info
            </button>
          </div>
        </div>
      )}
    </>
  )
}