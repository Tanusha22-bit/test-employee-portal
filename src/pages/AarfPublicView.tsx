import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function AarfPublicView() {
  const { token } = useParams(); const { user, profile } = useAuth()
  const [aarf, setAarf] = useState<any>(null); const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true); const [acking, setAcking] = useState(false)

  const fetchData = async () => {
    const {data} = await supabase.from('aarfs').select('*,onboardings(hr_email,it_email,personal_details(*),work_details(*))').eq('acknowledgement_token',token).single()
    setAarf(data)
    if (data?.onboarding_id) {
      const {data:aa} = await supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id',data.onboarding_id)
      setAssignments(aa||[])
    }
    setLoading(false)
  }
  useEffect(()=>{ fetchData() },[token])

  const acknowledge = async () => {
    setAcking(true)
    await supabase.from('aarfs').update({acknowledged:true,acknowledged_at:new Date().toISOString()}).eq('acknowledgement_token',token)
    await fetchData(); setAcking(false)
  }

  const itAcknowledge = async () => {
    setAcking(true)
    await supabase.from('aarfs').update({it_manager_acknowledged:true,it_manager_acknowledged_at:new Date().toISOString(),it_manager_user_id:user?.id}).eq('acknowledgement_token',token)
    await fetchData(); setAcking(false)
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner-border text-primary"/></div>
  if (!aarf) return <div className="container py-5"><div className="alert alert-danger">AARF not found or invalid link.</div></div>

  const pd = aarf.onboardings?.personal_details?.[0]||{}, wd = aarf.onboardings?.work_details?.[0]||{}
  const fmt = (d:any) => d ? new Date(d).toLocaleDateString('en-MY') : '—'
  const role = profile?.role ?? ''
  const isItManager = role==='it_manager'||role==='superadmin'

  return (
    <div style={{background:'#f1f5f9',minHeight:'100vh',padding:'24px 0'}}>
      <div className="container" style={{maxWidth:800}}>
        <div className="bg-white border rounded-3 overflow-hidden mb-4">
          <div style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',padding:'20px 24px'}}>
            <h5 className="text-white fw-bold mb-1"><i className="bi bi-file-earmark-check me-2"/>Asset Acceptance & Return Form</h5>
            <p className="text-white opacity-75 mb-0 small">Claritas Asia Sdn. Bhd.</p>
          </div>
          <div className="p-4">
            <div className="row mb-4">
              <div className="col-md-6">
                {[['Employee Name',pd.full_name],['NRIC / Passport',pd.official_document_id],['Designation',wd.designation],['Department',wd.department]].map(([l,v])=>(
                  <div key={l as string} className="detail-row"><span className="detail-label">{l}</span><span className="detail-value">{v||'—'}</span></div>
                ))}
              </div>
              <div className="col-md-6">
                {[['AARF Reference',aarf.aarf_reference],['Company',wd.company],['Start Date',fmt(wd.start_date)],['Office',wd.office_location]].map(([l,v])=>(
                  <div key={l as string} className="detail-row"><span className="detail-label">{l}</span><span className="detail-value">{v||'—'}</span></div>
                ))}
              </div>
            </div>
            <h6 className="fw-bold mb-3">Assigned Assets</h6>
            <table className="table table-bordered table-sm mb-4">
              <thead style={{background:'#f8fafc'}}><tr><th>#</th><th>Asset Tag</th><th>Asset Name</th><th>Type</th><th>Brand / Model</th><th>Serial No.</th><th>Date Assigned</th></tr></thead>
              <tbody>
                {assignments.length ? assignments.map((a:any,i:number)=><tr key={a.id}><td className="small">{i+1}</td><td className="small fw-semibold">{a.asset_inventories?.asset_tag}</td><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.brand} {a.asset_inventories?.model}</td><td className="small">{a.asset_inventories?.serial_number||'—'}</td><td className="small">{fmt(a.assigned_date)}</td></tr>) : <tr><td colSpan={7} className="text-center text-muted small py-3">No assets assigned</td></tr>}
              </tbody>
            </table>
            {aarf.it_notes && <div className="alert alert-info small mb-4"><strong>IT Notes:</strong> {aarf.it_notes}</div>}

            {/* Acknowledgement Section */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded-3 p-3">
                  <h6 className="fw-bold small mb-2">Employee Acknowledgement</h6>
                  {aarf.acknowledged ? (
                    <div><span className="badge bg-success mb-2">Acknowledged</span><p className="small text-muted mb-0">Acknowledged on {fmt(aarf.acknowledged_at)}</p></div>
                  ) : !isItManager ? (
                    <div>
                      <p className="small text-muted mb-3">I acknowledge receipt of the above assets and agree to the terms of use.</p>
                      <button className="btn btn-success btn-sm w-100" onClick={acknowledge} disabled={acking}>{acking?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}I Acknowledge</button>
                    </div>
                  ) : <span className="badge bg-warning text-dark">Pending Employee Signature</span>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-3 p-3">
                  <h6 className="fw-bold small mb-2">IT Manager Acknowledgement</h6>
                  {aarf.it_manager_acknowledged ? (
                    <div><span className="badge bg-primary mb-2">Acknowledged</span><p className="small text-muted mb-0">Acknowledged on {fmt(aarf.it_manager_acknowledged_at)}</p></div>
                  ) : isItManager ? (
                    <button className="btn btn-primary btn-sm w-100" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={itAcknowledge} disabled={acking}>{acking?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}Acknowledge as IT Manager</button>
                  ) : <span className="badge bg-secondary">Pending IT Manager Signature</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-muted small">© {new Date().getFullYear()} Claritas Asia Sdn. Bhd. · Employee Portal</p>
      </div>
    </div>
  )
}