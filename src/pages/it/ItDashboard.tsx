
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ItDashboard() {
  const [stats, setStats] = useState({ total:0, available:0, assigned:0, maint:0 })
  useEffect(()=>{
    supabase.from('asset_inventories').select('status').then(({data})=>{
      if (!data) return
      setStats({
        total: data.length,
        available: data.filter(d=>d.status==='available').length,
        assigned: data.filter(d=>['assigned','unavailable'].includes(d.status)).length,
        maint: data.filter(d=>d.status==='under_maintenance').length,
      })
    })
  },[])
  const cards = [
    {label:'Total Assets',value:stats.total,icon:'bi-laptop',bg:'#f1f5f9',color:'#64748b'},
    {label:'Available',value:stats.available,icon:'bi-check-circle',bg:'#d1fae5',color:'#059669'},
    {label:'Assigned',value:stats.assigned,icon:'bi-person-badge',bg:'#dbeafe',color:'#2563eb'},
    {label:'Under Maintenance',value:stats.maint,icon:'bi-tools',bg:'#fef3c7',color:'#d97706'},
  ]
  return (
    <>
      <div className="row g-3 mb-4">
        {cards.map(c=>(
          <div key={c.label} className="col-sm-6 col-xl-3">
            <div className="stat-card"><div className="d-flex align-items-center gap-3">
              <div className="stat-icon" style={{background:c.bg,color:c.color}}><i className={`bi ${c.icon}`}/></div>
              <div><div className="text-muted small">{c.label}</div><div className="fw-bold fs-4">{c.value}</div></div>
            </div></div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-3 p-4">
        <h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"/>Quick Actions</h6>
        <div className="d-grid gap-2" style={{maxWidth:280}}>
          <Link to="/assets" className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}}><i className="bi bi-laptop me-2"/>Manage Assets</Link>
          <Link to="/it/aarfs" className="btn btn-outline-secondary btn-sm"><i className="bi bi-file-earmark-check me-2"/>Manage AARFs</Link>
        </div>
      </div>
    </>
  )
}
