import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function OnboardingEditPage() {
  const { id } = useParams()
  const { canEditOnboarding, canEditAllOnboarding } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [hrUsers, setHrUsers] = useState<any[]>([])
  const [itUsers, setItUsers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    if (!canEditOnboarding) { navigate('/onboarding'); return }
    Promise.all([
      supabase.from('onboardings').select('*').eq('id',id).single(),
      supabase.from('personal_details').select('*').eq('onboarding_id',id).single(),
      supabase.from('work_details').select('*').eq('onboarding_id',id).single(),
      supabase.from('asset_provisionings').select('*').eq('onboarding_id',id).single(),
      supabase.from('profiles').select('name,work_email').in('role',['hr_manager','hr_executive','hr_intern']),
      supabase.from('profiles').select('name,work_email').in('role',['it_manager','it_executive','it_intern']),
    ]).then(([ob,pd,wd,ap,hr,it])=>{
      setData({ob:ob.data,pd:pd.data,wd:wd.data,ap:ap.data})
      setHrUsers(hr.data||[]); setItUsers(it.data||[])
      const d = {
        ...(pd.data||{}), ...(wd.data||{}),
        hr_email: ob.data?.hr_email||'', it_email: ob.data?.it_email||'',
        laptop_provision: ap.data?.laptop_provision||false, monitor_set: ap.data?.monitor_set||false,
        converter: ap.data?.converter||false, company_phone: ap.data?.company_phone||false,
        sim_card: ap.data?.sim_card||false, access_card_request: ap.data?.access_card_request||false,
        office_keys: ap.data?.office_keys||'',
      }
      if (d.date_of_birth) d.date_of_birth = new Date(d.date_of_birth).toISOString().slice(0,10)
      if (d.start_date) d.start_date = new Date(d.start_date).toISOString().slice(0,10)
      if (d.exit_date) d.exit_date = new Date(d.exit_date).toISOString().slice(0,10)
      setForm(d)
    })
  },[id])

  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true); setError(null)
    try {
      await supabase.from('onboardings').update({hr_email:form.hr_email,it_email:form.it_email}).eq('id',id)
      await supabase.from('personal_details').update({full_name:form.full_name,official_document_id:form.official_document_id,date_of_birth:form.date_of_birth,sex:form.sex,marital_status:form.marital_status,religion:form.religion,race:form.race,residential_address:form.residential_address,personal_contact_number:form.personal_contact_number,personal_email:form.personal_email,bank_account_number:form.bank_account_number}).eq('onboarding_id',id)
      const wdUpdate: any = {employee_status:form.employee_status,staff_status:form.staff_status,employment_type:form.employment_type,designation:form.designation,department:form.department||null,company:form.company,office_location:form.office_location,reporting_manager:form.reporting_manager,start_date:form.start_date,exit_date:form.exit_date||null,company_email:form.company_email||null,google_id:form.google_id||null}
      if (canEditAllOnboarding) wdUpdate.role = form.role||null
      await supabase.from('work_details').update(wdUpdate).eq('onboarding_id',id)
      if (canEditAllOnboarding) await supabase.from('asset_provisionings').update({laptop_provision:form.laptop_provision,monitor_set:form.monitor_set,converter:form.converter,company_phone:form.company_phone,sim_card:form.sim_card,access_card_request:form.access_card_request,office_keys:form.office_keys||null}).eq('onboarding_id',id)
      navigate(`/onboarding/${id}`)
    } catch(e:any) { setError(e.message) } finally { setSaving(false) }
  }

  if (!data) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>

  const F = ({label, name, type='text', required=false}: any) => (
    <div className="col-md-6"><label className="form-label small fw-semibold">{label}{required&&' *'}</label>
    <input type={type} className="form-control form-control-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)} required={required}/></div>
  )
  const S = ({label, name, options}: any) => (
    <div className="col-md-4"><label className="form-label small fw-semibold">{label}</label>
    <select className="form-select form-select-sm" value={form[name]||''} onChange={e=>s(name,e.target.value)}>
      {options.map(([v,l]:any)=><option key={v} value={v}>{l}</option>)}
    </select></div>
  )

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb">
        <li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li>
        <li className="breadcrumb-item"><Link to={`/onboarding/${id}`}>{data.pd?.full_name||`#${id}`}</Link></li>
        <li className="breadcrumb-item active">Edit</li>
      </ol></nav>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="bg-white border rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3">Section A — Personal Details</h6>
        <div className="row g-3">
          <F label="Full Name" name="full_name" required/>
          <F label="NRIC / Passport" name="official_document_id" required/>
          <F label="Date of Birth" name="date_of_birth" type="date" required/>
          <S label="Sex" name="sex" options={[['male','Male'],['female','Female']]}/>
          <S label="Marital Status" name="marital_status" options={[['single','Single'],['married','Married'],['divorced','Divorced'],['widowed','Widowed']]}/>
          <F label="Religion" name="religion" required/>
          <F label="Race" name="race" required/>
          <F label="Contact Number" name="personal_contact_number" required/>
          <F label="Personal Email" name="personal_email" type="email" required/>
          <F label="Bank Account Number" name="bank_account_number" required/>
          <div className="col-12"><label className="form-label small fw-semibold">Residential Address *</label><textarea className="form-control form-control-sm" rows={2} value={form.residential_address||''} onChange={e=>s('residential_address',e.target.value)} required/></div>
        </div>
      </div>
      <div className="bg-white border rounded-3 p-4 mb-3">
        <h6 className="fw-bold mb-3">Section B — Work Details</h6>
        <div className="row g-3">
          <S label="Employee Status" name="employee_status" options={[['active','Active'],['resigned','Resigned']]}/>
          <S label="Staff Status" name="staff_status" options={[['new','New'],['existing','Existing']]}/>
          <S label="Employment Type" name="employment_type" options={[['permanent','Permanent'],['intern','Intern'],['contract','Contract']]}/>
          <F label="Designation" name="designation" required/>
          <F label="Department" name="department"/>
          <F label="Company" name="company" required/>
          <F label="Office Location" name="office_location" required/>
          <F label="Reporting Manager" name="reporting_manager" required/>
          <F label="Start Date" name="start_date" type="date" required/>
          <F label="Exit Date" name="exit_date" type="date"/>
          <F label="Company Email" name="company_email" type="email"/>
          <F label="Google Workspace ID" name="google_id"/>
          <div className="col-md-6"><label className="form-label small fw-semibold">HR In-Charge *</label><select className="form-select form-select-sm" value={form.hr_email||''} onChange={e=>s('hr_email',e.target.value)}><option value="">Select...</option>{hrUsers.map(u=><option key={u.work_email} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
          <div className="col-md-6"><label className="form-label small fw-semibold">IT In-Charge *</label><select className="form-select form-select-sm" value={form.it_email||''} onChange={e=>s('it_email',e.target.value)}><option value="">Select...</option>{itUsers.map(u=><option key={u.work_email} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-2">
        <Link to={`/onboarding/${id}`} className="btn btn-outline-secondary">Cancel</Link>
        <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-check-circle me-2"/>}Save Changes
        </button>
      </div>
    </>
  )
}