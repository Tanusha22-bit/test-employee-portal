
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function HrDashboard() {
  const { canAddOnboarding } = useAuth()
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0, exiting: 0 })
  useEffect(() => {
    const now = new Date()
    const m = now.getMonth()+1, y = now.getFullYear()
    Promise.all([
      supabase.from('onboardings').select('id', {count:'exact',head:true}),
      supabase.from('employees').select('id', {count:'exact',head:true}).is('active_until', null),
      supabase.from('work_details').select('id',{count:'exact',head:true}).gte('start_date',`${y}-${String(m).padStart(2,'0')}-01`).lte('start_date',`${y}-${String(m).padStart(2,'0')}-31`),
      supabase.from('work_details').select('id',{count:'exact',head:true}).not('exit_date','is',null).gte('exit_date',`${y}-${String(m).padStart(2,'0')}-01`)
    ]).then(([t,a,n,e]) => setStats({ total:t.count??0, active:a.count??0, newThisMonth:n.count??0, exiting:e.count??0 }))
  },[])

  const cards = [
    {label:'Total Onboardings',value:stats.total,icon:'bi-people',bg:'#dbeafe',color:'#2563eb'},
    {label:'Active Employees',value:stats.active,icon:'bi-person-check',bg:'#d1fae5',color:'#059669'},
    {label:'New Joiners This Month',value:stats.newThisMonth,icon:'bi-calendar-plus',bg:'#fef3c7',color:'#d97706'},
    {label:'Exiting This Month',value:stats.exiting,icon:'bi-calendar-x',bg:'#fee2e2',color:'#dc2626'},
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
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"/>Quick Actions</h6>
            <div className="d-grid gap-2">
              <Link to="/onboarding" className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}}>
                <i className="bi bi-list-ul me-2"/>View All Onboardings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
