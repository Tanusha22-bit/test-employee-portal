import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import DetailSection from '../../components/shared/DetailSection'

export default function OnboardingShowPage() {
  const { id } = useParams()
  const { canEditOnboarding } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Promise.all([
      supabase.from('onboardings').select('*').eq('id',id).single(),
      supabase.from('personal_details').select('*').eq('onboarding_id',id).single(),
      supabase.from('work_details').select('*').eq('onboarding_id',id).single(),
      supabase.from('asset_provisionings').select('*').eq('onboarding_id',id).single(),
      supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id',id),
      supabase.from('aarfs').select('*').eq('onboarding_id',id).single(),
    ]).then(([ob,pd,wd,ap,aa,ar])=>{
      setData({ ob:ob.data, pd:pd.data, wd:wd.data, ap:ap.data, assignments:(aa.data||[]), aarf:ar.data })
      setLoading(false)
    })
  },[id])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
  if (!data?.ob) return <div className="alert alert-danger">Record not found.</div>
  const { ob, pd, wd, ap, assignments, aarf } = data
  const fmt = (d:string|null) => d ? new Date(d).toLocaleDateString('en-MY') : '—'

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <nav aria-label="breadcrumb"><ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li>
          <li className="breadcrumb-item active">{pd?.full_name||`#${id}`}</li>
        </ol></nav>
        <div className="d-flex gap-2">
          {aarf && <Link to={`/hr/aarf/${aarf.id}`} className="btn btn-outline-primary btn-sm"><i className="bi bi-file-earmark-check me-1"/>View AARF</Link>}
          {canEditOnboarding && <Link to={`/onboarding/${id}/edit`} className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}}><i className="bi bi-pencil me-1"/>Edit</Link>}
        </div>
      </div>
      <div className="row g-3">
        <div className="col-lg-6">
          <DetailSection title="Section A — Personal Details" icon="bi-person" rows={[
            ['Full Name',pd?.full_name],['Document ID',pd?.official_document_id],['Date of Birth',fmt(pd?.date_of_birth)],
            ['Sex',pd?.sex],['Marital Status',pd?.marital_status],['Religion',pd?.religion],['Race',pd?.race],
            ['Contact',pd?.personal_contact_number],['Personal Email',pd?.personal_email],
            ['Bank Account',pd?.bank_account_number],['Address',pd?.residential_address],
          ]}/>
        </div>
        <div className="col-lg-6">
          <DetailSection title="Section B — Work Details" icon="bi-briefcase" rows={[
            ['Designation',wd?.designation],['Department',wd?.department],['Company',wd?.company],
            ['Office',wd?.office_location],['Reporting Manager',wd?.reporting_manager],
            ['Start Date',fmt(wd?.start_date)],['Employment Type',wd?.employment_type],
            ['Company Email',wd?.company_email],['Employee Status',wd?.employee_status],
            ['HR In-Charge',ob.hr_email],['IT In-Charge',ob.it_email],
          ]}/>
          <div className="section-card overflow-hidden mb-3">
            <div className="section-header-bar"><i className="bi bi-file-earmark-check me-2"/>AARF Status</div>
            <div className="p-4">
              {aarf ? <>
                <div className="detail-row"><span className="detail-label">Reference</span><span className="detail-value small">{aarf.aarf_reference}</span></div>
                <div className="detail-row"><span className="detail-label">Employee Ack</span><span className={`badge ${aarf.acknowledged?'bg-success':'bg-warning text-dark'}`}>{aarf.acknowledged?`Acknowledged ${fmt(aarf.acknowledged_at)}`:'Pending'}</span></div>
                <div className="detail-row"><span className="detail-label">IT Manager Ack</span><span className={`badge ${aarf.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{aarf.it_manager_acknowledged?`Acknowledged ${fmt(aarf.it_manager_acknowledged_at)}`:'Pending'}</span></div>
              </> : <p className="text-muted small mb-0">No AARF generated yet.</p>}
            </div>
          </div>
          <div className="section-card overflow-hidden">
            <div className="section-header-bar"><i className="bi bi-box-seam me-2"/>Assigned Assets</div>
            <div className="p-3">
              {assignments.length ? (
                <table className="table table-sm mb-0"><thead><tr><th>Asset</th><th>Tag</th><th>Date</th></tr></thead>
                <tbody>{assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_tag}</td><td className="small">{fmt(a.assigned_date)}</td></tr>)}</tbody>
                </table>
              ) : <p className="text-muted small mb-0">No assets assigned.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}