
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Employee, Aarf } from '../../types/database'

export default function UserDashboard() {
  const { user, profile } = useAuth()
  const [emp, setEmp] = useState<Employee|null>(null)
  const [aarf, setAarf] = useState<Aarf|null>(null)

  useEffect(()=>{
    if (!user) return
    supabase.from('employees').select('*').eq('user_id', user.id).single().then(({data})=>{
      if (data) { setEmp(data); if (data.onboarding_id) supabase.from('aarfs').select('*').eq('onboarding_id',data.onboarding_id).single().then(({data:a})=>setAarf(a)) }
    })
  },[user])

  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="bg-white border rounded-3 p-4">
          <h5 className="fw-bold mb-1">Welcome, {profile?.name}! 👋</h5>
          <p className="text-muted mb-0">Here's an overview of your employment information.</p>
        </div>
      </div>
      {emp ? (
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"/>Work Information</h6>
            {[['Position',emp.designation],['Department',emp.department],['Company',emp.company],['Office',emp.office_location],['Reporting Manager',emp.reporting_manager],['Start Date',emp.start_date?new Date(emp.start_date).toLocaleDateString('en-MY'):null]].map(([l,v])=>v?(
              <div key={l as string} className="detail-row"><span className="detail-label">{l}</span><span className="detail-value">{v}</span></div>
            ):null)}
          </div>
        </div>
      ) : (
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4 border-warning">
            <h6 className="fw-bold mb-2"><i className="bi bi-clock me-2 text-warning"/>Onboarding Pending</h6>
            <p className="text-muted small mb-0">Your employment record is being prepared. Check back after your start date.</p>
          </div>
        </div>
      )}
      <div className="col-md-6">
        <div className="bg-white border rounded-3 p-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"/>Quick Links</h6>
          <div className="d-grid gap-2">
            <Link to="/profile" className="btn btn-outline-primary btn-sm"><i className="bi bi-person-circle me-2"/>View Profile</Link>
            {aarf?.acknowledgement_token && <a href={`/aarf/${aarf.acknowledgement_token}`} className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer"><i className="bi bi-file-earmark-check me-2"/>View / Acknowledge AARF</a>}
            <Link to="/account" className="btn btn-outline-secondary btn-sm"><i className="bi bi-gear me-2"/>Account Settings</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
