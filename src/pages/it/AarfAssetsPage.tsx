import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AarfAssetsPage() {
  const { id } = useParams(); const navigate = useNavigate()
  const [aarf, setAarf] = useState<any>(null)
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().slice(0,10))
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    supabase.from('aarfs').select('*').eq('id',id).single().then(({data})=>{
      if (!data||data.acknowledged||data.it_manager_acknowledged){navigate(`/it/aarfs/${id}`);return}
      setAarf(data)
      supabase.from('asset_assignments').select('*,asset_inventories(*)').eq('onboarding_id',data.onboarding_id).then(({data:aa})=>{
        setCurrentAssignments(aa||[])
        setSelected((aa||[]).map((a:any)=>a.asset_inventory_id))
      })
      supabase.from('asset_inventories').select('*').eq('status','available').order('asset_type').then(({data:av})=>setAvailable(av||[]))
    })
  },[id])

  const toggle = (assetId: number) => setSelected(s=>s.includes(assetId)?s.filter(x=>x!==assetId):[...s,assetId])

  const save = async () => {
    setSaving(true)
    // Release old assets
    for (const a of currentAssignments) await supabase.from('asset_inventories').update({status:'available'}).eq('id',a.asset_inventory_id)
    await supabase.from('asset_assignments').delete().eq('onboarding_id',aarf.onboarding_id)
    // Assign new
    for (const assetId of selected) {
      await supabase.from('asset_assignments').insert({onboarding_id:aarf.onboarding_id,asset_inventory_id:assetId,assigned_date:assignedDate,status:'assigned'})
      await supabase.from('asset_inventories').update({status:'unavailable'}).eq('id',assetId)
    }
    navigate(`/it/aarfs/${id}`)
  }

  if (!aarf) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
  // Merge currently assigned (may be unavailable) with available
  const currentAssets = currentAssignments.map((a:any)=>a.asset_inventories).filter(Boolean)
  const allOptions = [...currentAssets,...available.filter(a=>!currentAssets.find((c:any)=>c.id===a.id))]

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item"><Link to={`/it/aarfs/${id}`}>#{id}</Link></li><li className="breadcrumb-item active">Manage Assets</li></ol></nav>
      <div className="bg-white border rounded-3 p-4">
        <h6 className="fw-bold mb-3">Select Assets to Assign</h6>
        <div className="mb-3"><label className="form-label small fw-semibold">Assignment Date</label><input type="date" className="form-control form-control-sm" style={{maxWidth:200}} value={assignedDate} onChange={e=>setAssignedDate(e.target.value)}/></div>
        <div className="row g-2 mb-4">
          {allOptions.map((a:any)=>(
            <div key={a.id} className="col-md-4">
              <div className={`p-3 border rounded cursor-pointer ${selected.includes(a.id)?'border-primary bg-primary bg-opacity-10':''}`} onClick={()=>toggle(a.id)} style={{cursor:'pointer'}}>
                <div className="d-flex align-items-center gap-2">
                  <input type="checkbox" className="form-check-input" checked={selected.includes(a.id)} onChange={()=>toggle(a.id)} onClick={e=>e.stopPropagation()}/>
                  <div>
                    <div className="small fw-semibold">{a.asset_tag} — {a.asset_name}</div>
                    <div className="text-muted" style={{fontSize:11}}>{a.asset_type} · {a.serial_number||'—'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!allOptions.length && <div className="col-12 text-muted small">No assets available.</div>}
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <Link to={`/it/aarfs/${id}`} className="btn btn-outline-secondary">Cancel</Link>
          <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
            {saving?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}Update Assignments
          </button>
        </div>
      </div>
    </>
  )
}