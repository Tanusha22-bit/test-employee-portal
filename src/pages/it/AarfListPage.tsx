import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AarfListPage() {
  const [aarfs, setAarfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    supabase.from('aarfs').select('*,onboardings(personal_details(full_name),work_details(designation,start_date))').order('created_at',{ascending:false}).then(({data})=>{setAarfs(data||[]);setLoading(false)})
  },[])
  const fmt = (d:any) => d ? new Date(d).toLocaleDateString('en-MY') : '—'
  return (
    <>
      <div className="mb-3"><span className="text-muted small">{aarfs.length} AARF record(s)</span></div>
      <div className="bg-white border rounded-3 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div> : (
        <table className="table table-hover mb-0">
          <thead><tr><th>Reference</th><th>Employee</th><th>Designation</th><th>Start Date</th><th>Employee Ack</th><th>IT Ack</th><th>Actions</th></tr></thead>
          <tbody>
            {!aarfs.length && <tr><td colSpan={7} className="text-center py-4 text-muted"><i className="bi bi-inbox d-block fs-4 mb-2"/>No AARFs found</td></tr>}
            {aarfs.map(a=>{
              const pd = a.onboardings?.personal_details?.[0], wd = a.onboardings?.work_details?.[0]
              return (
              <tr key={a.id}>
                <td className="small fw-semibold">{a.aarf_reference}</td>
                <td className="small">{pd?.full_name||'—'}</td>
                <td className="small">{wd?.designation||'—'}</td>
                <td className="small">{fmt(wd?.start_date)}</td>
                <td><span className={`badge ${a.acknowledged?'bg-success':'bg-warning text-dark'}`}>{a.acknowledged?'Acknowledged':'Pending'}</span></td>
                <td><span className={`badge ${a.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{a.it_manager_acknowledged?'Acknowledged':'Pending'}</span></td>
                <td><Link to={`/it/aarfs/${a.id}`} className="btn btn-outline-primary btn-sm py-0 px-2">View</Link></td>
              </tr>
            )})}
          </tbody>
        </table>
        )}
      </div>
    </>
  )
}