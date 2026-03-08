import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function AarfShowPage() {
  const { id } = useParams(); const { user } = useAuth()
  const [aarf, setAarf] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [acknowledging, setAcknowledging] = useState(false)
  const [remarks, setRemarks] = useState('')

  const fetch = async () => {
    const {data} = await supabase.from('aarfs').select('*,onboardings(hr_email,it_email,personal_details(*),work_details(*))').eq('id',id).single()
    setAarf(data)
    if (data?.onboarding_id) {
      const {data:aa} = await supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id',data.onboarding_id)
      setAssignments(aa||[])
    }
  }
  useEffect(()=>{ fetch() },[id])

  const acknowledge = async () => {
    setAcknowledging(true)
    await supabase.from('aarfs').update({it_manager_acknowledged:true,it_manager_acknowledged_at:new Date().toISOString(),it_manager_user_id:user?.id,it_manager_remarks:remarks||null}).eq('id',id)
    await fetch()
    setAcknowledging(false)
  }

  if (!aarf) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
  const pd = aarf.onboardings?.personal_details?.[0]||{}, wd = aarf.onboardings?.work_details?.[0]||{}
  const fmt = (d:any) => d ? new Date(d).toLocaleDateString('en-MY') : '—'

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item active">{aarf.aarf_reference}</li></ol></nav>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="section-card overflow-hidden mb-3">
            <div className="section-header-bar">Asset Acceptance & Return Form — {aarf.aarf_reference}</div>
            <div className="p-4">
              <div className="row mb-3">
                {[['Employee Name',pd.full_name],['Designation',wd.designation],['Company',wd.company],['Start Date',fmt(wd.start_date)]].map(([l,v])=>(
                  <div key={l as string} className="col-6 mb-2"><div className="detail-row"><span className="detail-label">{l}</span><span className="detail-value">{v||'—'}</span></div></div>
                ))}
              </div>
              <h6 className="fw-bold small mb-2">Assigned Assets</h6>
              <table className="table table-sm border mb-3"><thead><tr><th>Tag</th><th>Asset Name</th><th>Type</th><th>Serial No.</th><th>Date</th></tr></thead>
              <tbody>{assignments.length ? assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_tag}</td><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.serial_number||'—'}</td><td className="small">{fmt(a.assigned_date)}</td></tr>) : <tr><td colSpan={5} className="text-center text-muted small py-2">No assets assigned</td></tr>}</tbody></table>
              {aarf.it_notes && <><h6 className="fw-bold small mb-2">IT Notes</h6><p className="small bg-light p-2 rounded">{aarf.it_notes}</p></>}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="section-card overflow-hidden mb-3">
            <div className="section-header-bar">Status</div>
            <div className="p-4">
              <div className="detail-row mb-2"><span className="detail-label">Employee</span><span className={`badge ${aarf.acknowledged?'bg-success':'bg-warning text-dark'}`}>{aarf.acknowledged?`Ack'd ${fmt(aarf.acknowledged_at)}`:'Pending'}</span></div>
              <div className="detail-row"><span className="detail-label">IT Manager</span><span className={`badge ${aarf.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{aarf.it_manager_acknowledged?`Ack'd ${fmt(aarf.it_manager_acknowledged_at)}`:'Pending'}</span></div>
              {aarf.it_manager_remarks && <p className="small mt-2 text-muted">Remarks: {aarf.it_manager_remarks}</p>}
              {aarf.acknowledgement_token && <a href={`/aarf/${aarf.acknowledgement_token}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm w-100 mt-3"><i className="bi bi-box-arrow-up-right me-2"/>Public AARF Link</a>}
            </div>
          </div>
          <div className="section-card overflow-hidden mb-3">
            <div className="section-header-bar">Actions</div>
            <div className="p-4">
              <div className="d-grid gap-2">
                {!aarf.acknowledged && !aarf.it_manager_acknowledged && <Link to={`/it/aarfs/${id}/edit`} className="btn btn-outline-secondary btn-sm"><i className="bi bi-pencil me-2"/>Edit IT Notes</Link>}
                {!aarf.acknowledged && !aarf.it_manager_acknowledged && <Link to={`/it/aarfs/${id}/assets`} className="btn btn-outline-secondary btn-sm"><i className="bi bi-laptop me-2"/>Manage Assets</Link>}
                {!aarf.it_manager_acknowledged && (
                  <div>
                    <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Optional remarks..." value={remarks} onChange={e=>setRemarks(e.target.value)}/>
                    <button className="btn btn-primary btn-sm w-100" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={acknowledge} disabled={acknowledging}>
                      {acknowledging?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}I Acknowledge (IT Manager)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}