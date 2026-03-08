import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import AddAssetModal from '../../components/it/AddAssetModal'

export default function AssetsPage() {
  const { canAddAsset, canEditAsset } = useAuth()
  const [assets, setAssets] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [stats, setStats] = useState({available:0,assigned:0,maint:0,total:0})

  const fetchData = useCallback(async () => {
    setLoading(true)
    const {data} = await supabase.from('asset_inventories').select('*,employees(full_name)').order('created_at',{ascending:false})
    const rows = data||[]
    setAssets(rows)
    setStats({total:rows.length,available:rows.filter((r:any)=>r.status==='available').length,assigned:rows.filter((r:any)=>['assigned','unavailable'].includes(r.status)).length,maint:rows.filter((r:any)=>r.status==='under_maintenance').length})
    setLoading(false)
  },[])

  useEffect(()=>{
    fetchData()
    supabase.from('employees').select('id,full_name').is('active_until',null).not('full_name','is',null).order('full_name').then(({data})=>setEmployees(data||[]))
  },[])

  const filtered = assets.filter(a=>{
    if (filterStatus && a.status!==filterStatus) return false
    if (filterType && a.asset_type!==filterType) return false
    if (search) {
      const s = search.toLowerCase()
      return [a.asset_tag,a.asset_name,a.brand,a.model,a.serial_number].some((v:any)=>v?.toLowerCase().includes(s))
    }
    return true
  })

  const statusColor: Record<string,string> = {available:'success',assigned:'primary',under_maintenance:'warning',retired:'secondary',unavailable:'primary'}

  return (
    <>
      <div className="row g-3 mb-3">
        {[['Available',stats.available,'#d1fae5','#059669','bi-check-circle'],['Assigned',stats.assigned,'#dbeafe','#2563eb','bi-person-badge'],['Maintenance',stats.maint,'#fef3c7','#d97706','bi-tools'],['Total',stats.total,'#f1f5f9','#64748b','bi-laptop']].map(([l,v,bg,c,icon])=>(
          <div key={l as string} className="col-sm-6 col-xl-3">
            <div className="stat-card"><div className="d-flex align-items-center gap-3">
              <div className="stat-icon" style={{background:bg as string,color:c as string}}><i className={`bi ${icon}`}/></div>
              <div><div className="text-muted small">{l}</div><div className="fw-bold fs-5">{v}</div></div>
            </div></div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-2 flex-wrap">
          <input className="form-control form-control-sm" style={{width:220}} placeholder="Search tag, name, brand..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="form-select form-select-sm" style={{width:140}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {['available','assigned','under_maintenance','retired','unavailable'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{width:130}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {['laptop','monitor','converter','phone','sim_card','access_card','other'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
          </select>
          {(search||filterStatus||filterType)&&<button className="btn btn-outline-secondary btn-sm" onClick={()=>{setSearch('');setFilterStatus('');setFilterType('')}}>Clear</button>}
        </div>
        {canAddAsset && <button className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={()=>setShowModal(true)}><i className="bi bi-plus-circle me-1"/>Add New Asset</button>}
      </div>
      <div className="bg-white border rounded-3 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div> : (
        <table className="table table-hover mb-0">
          <thead><tr><th>Tag</th><th>Asset</th><th>Type</th><th>Serial</th><th>Status</th><th>Condition</th><th>Assigned To</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={8} className="text-center py-4 text-muted"><i className="bi bi-inbox d-block fs-4 mb-2"/>No assets found</td></tr>}
            {filtered.map(a=>(
              <tr key={a.id}>
                <td className="small fw-semibold">{a.asset_tag}</td>
                <td><div className="small fw-semibold">{a.asset_name}</div><div className="text-muted" style={{fontSize:11}}>{a.brand} {a.model}</div></td>
                <td className="small">{a.asset_type}</td>
                <td className="small text-muted">{a.serial_number||'—'}</td>
                <td><span className={`badge bg-${statusColor[a.status]||'secondary'}`}>{a.status?.replace(/_/g,' ')}</span></td>
                <td className="small">{a.asset_condition||'—'}</td>
                <td className="small">{a.employees?.full_name||'—'}</td>
                <td>
                  <Link to={`/assets/${a.id}`} className="btn btn-outline-primary btn-sm py-0 px-2 me-1">View</Link>
                  {canEditAsset && <Link to={`/assets/${a.id}/edit`} className="btn btn-outline-secondary btn-sm py-0 px-2">Edit</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {showModal && <AddAssetModal employees={employees} onClose={()=>setShowModal(false)} onSaved={fetchData}/>}
    </>
  )
}