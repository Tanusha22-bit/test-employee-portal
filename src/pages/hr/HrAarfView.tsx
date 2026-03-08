import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function HrAarfView() {
  const { id } = useParams()
  const [aarf, setAarf] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Promise.all([
      supabase.from('aarfs').select('*,onboardings(hr_email,it_email,personal_details(*),work_details(*))').eq('id',id).single(),
      supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id', id),
    ]).then(([a,aa])=>{
      setAarf(a.data)
      // get actual onboarding_id from aarf for assignments
      if (a.data?.onboarding_id) supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id',a.data.onboarding_id).then(({data})=>setAssignments(data||[]))
      setLoading(false)
    })
  },[id])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
  if (!aarf) return <div className="alert alert-danger">Not found.</div>
  const pd = aarf.onboardings?.personal_details?.[0]||{}, wd = aarf.onboardings?.work_details?.[0]||{}
  const fmt = (d:any) => d ? new Date(d).toLocaleDateString('en-MY') : '—'

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li><li className="breadcrumb-item active">AARF — {aarf.aarf_reference}</li></ol></nav>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="section-card overflow-hidden mb-3">
            <div className="section-header-bar">Asset Acceptance & Return Form (AARF)</div>
            <div className="p-4">
              <div className="row mb-3">
                <div className="col-6"><div className="detail-row"><span className="detail-label">Employee Name</span><span className="detail-value">{pd.full_name}</span></div></div>
                <div className="col-6"><div className="detail-row"><span className="detail-label">Reference</span><span className="detail-value">{aarf.aarf_reference}</span></div></div>
                <div className="col-6"><div className="detail-row"><span className="detail-label">Designation</span><span className="detail-value">{wd.designation}</span></div></div>
                <div className="col-6"><div className="detail-row"><span className="detail-label">Start Date</span><span className="detail-value">{fmt(wd.start_date)}</span></div></div>
              </div>
              <h6 className="fw-bold mb-2 small">Assigned Assets</h6>
              <table className="table table-sm border"><thead><tr><th>Asset Tag</th><th>Asset Name</th><th>Type</th><th>Serial No.</th></tr></thead>
              <tbody>{assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_tag}</td><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.serial_number||'—'}</td></tr>)}</tbody></table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="section-card overflow-hidden">
            <div className="section-header-bar">Acknowledgement Status</div>
            <div className="p-4">
              <div className="detail-row"><span className="detail-label">Employee</span><span className={`badge ${aarf.acknowledged?'bg-success':'bg-warning text-dark'}`}>{aarf.acknowledged?`Ack'd ${fmt(aarf.acknowledged_at)}`:'Pending'}</span></div>
              <div className="detail-row"><span className="detail-label">IT Manager</span><span className={`badge ${aarf.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{aarf.it_manager_acknowledged?`Ack'd ${fmt(aarf.it_manager_acknowledged_at)}`:'Pending'}</span></div>
              {aarf.it_manager_remarks && <div className="detail-row"><span className="detail-label">IT Remarks</span><span className="detail-value small">{aarf.it_manager_remarks}</span></div>}
              {aarf.acknowledgement_token && <div className="mt-3"><a href={`/aarf/${aarf.acknowledgement_token}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm w-100"><i className="bi bi-box-arrow-up-right me-2"/>Public AARF Link</a></div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}