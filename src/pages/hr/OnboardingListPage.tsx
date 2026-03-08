import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import OnboardingModal from '../../components/hr/OnboardingModal'

interface OnboardingRow {
  id: number; status: string; hr_email:string|null; it_email:string|null; created_at:string
  personal_details: {full_name:string;personal_email:string}[]
  work_details: {designation:string;department:string|null;company:string;start_date:string}[]
  aarfs: {id:number;acknowledged:boolean;it_manager_acknowledged:boolean}[]
}

export default function OnboardingListPage() {
  const { canAddOnboarding, canEditOnboarding } = useAuth()
  const [rows, setRows] = useState<OnboardingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [hrUsers, setHrUsers] = useState<any[]>([])
  const [itUsers, setItUsers] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const q = supabase.from('onboardings').select(`id,status,hr_email,it_email,created_at,personal_details(full_name,personal_email),work_details(designation,department,company,start_date),aarfs(id,acknowledged,it_manager_acknowledged)`).order('created_at',{ascending:false})
    const { data } = await q
    setRows((data as any) || [])
    setLoading(false)
  },[])

  useEffect(()=>{
    fetchData()
    supabase.from('profiles').select('name,work_email').in('role',['hr_manager','hr_executive','hr_intern']).then(({data})=>setHrUsers(data||[]))
    supabase.from('profiles').select('name,work_email').in('role',['it_manager','it_executive','it_intern']).then(({data})=>setItUsers(data||[]))
  },[])

  const filtered = rows.filter(r => {
    if (!search) return true
    const pd = r.personal_details?.[0]
    const wd = r.work_details?.[0]
    const s = search.toLowerCase()
    return [pd?.full_name, pd?.personal_email, wd?.designation, wd?.department].some(v=>v?.toLowerCase().includes(s))
  })

  const statusBadge = (s:string) => {
    if (s==='active') return <span className="badge" style={{background:'#d1fae5',color:'#065f46'}}>Active</span>
    if (s==='offboarded') return <span className="badge bg-secondary">Offboarded</span>
    return <span className="badge" style={{background:'#fef3c7',color:'#92400e'}}>Pending</span>
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small">{filtered.length} record(s)</span>
        <div className="d-flex gap-2">
          {canAddOnboarding && <button className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={()=>setShowModal(true)}>
            <i className="bi bi-plus-circle me-1"/>Add New Onboarding
          </button>}
        </div>
      </div>
      <div className="bg-white border rounded-3 p-3 mb-3">
        <input className="form-control form-control-sm" style={{maxWidth:320}} placeholder="Search name, email, designation..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="bg-white border rounded-3 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div> : (
        <table className="table table-hover mb-0">
          <thead><tr><th>#</th><th>Full Name</th><th>Designation</th><th>Company</th><th>Start Date</th><th>Status</th><th>AARF</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={8} className="text-center py-4 text-muted"><i className="bi bi-inbox d-block fs-4 mb-2"/>No records found</td></tr>}
            {filtered.map(o=>{
              const pd=o.personal_details?.[0], wd=o.work_details?.[0], ar=o.aarfs?.[0]
              return (
              <tr key={o.id}>
                <td className="text-muted small">{o.id}</td>
                <td><div className="small fw-semibold">{pd?.full_name||'—'}</div><div className="text-muted" style={{fontSize:11}}>{pd?.personal_email}</div></td>
                <td className="small">{wd?.designation||'—'}<br/><span className="text-muted" style={{fontSize:11}}>{wd?.department}</span></td>
                <td className="small">{wd?.company||'—'}</td>
                <td className="small">{wd?.start_date?new Date(wd.start_date).toLocaleDateString('en-MY'):'—'}</td>
                <td>{statusBadge(o.status)}</td>
                <td>
                  {ar ? <>
                    <span className={`badge me-1 ${ar.acknowledged?'bg-success':'bg-warning text-dark'}`} style={{fontSize:10}}>Emp {ar.acknowledged?'✓':'?'}</span>
                    <span className={`badge ${ar.it_manager_acknowledged?'bg-primary':'bg-secondary'}`} style={{fontSize:10}}>IT {ar.it_manager_acknowledged?'✓':'?'}</span>
                  </> : <span className="text-muted small">—</span>}
                </td>
                <td>
                  <Link to={`/onboarding/${o.id}`} className="btn btn-outline-primary btn-sm py-0 px-2 me-1">View</Link>
                  {canEditOnboarding && <Link to={`/onboarding/${o.id}/edit`} className="btn btn-outline-secondary btn-sm py-0 px-2">Edit</Link>}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        )}
      </div>
      {showModal && <OnboardingModal hrUsers={hrUsers} itUsers={itUsers} onClose={()=>setShowModal(false)} onSaved={fetchData}/>}
    </>
  )
}