
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getProfile } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [emp, setEmp] = useState<any>(null);
  const [aarf, setAarf] = useState<any>(null);
  useEffect(() => { getProfile().then(d=>{ setEmp(d.employee); setAarf(d.aarf); }).catch(console.error); }, []);
  return (
    <Layout title="Dashboard">
      <div className="row g-3">
        <div className="col-12"><div className="bg-white border rounded-3 p-4"><h5 className="fw-bold mb-1">Welcome, {user?.name}! 👋</h5><p className="text-muted mb-0">Here's your employment overview.</p></div></div>
        {emp && <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"></i>Work Info</h6>
          {[['Position',emp.designation],['Department',emp.department],['Company',emp.company],['Office',emp.office_location],['Reporting Manager',emp.reporting_manager],['Start Date',emp.start_date&&new Date(emp.start_date).toLocaleDateString('en-MY')]].filter(([,v])=>v).map(([l,v])=>(
            <div className="info-row" key={l as string}><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
          ))}
        </div></div>}
        {!emp && <div className="col-md-6"><div className="bg-white border rounded-3 p-4 border-warning"><h6 className="fw-bold mb-2"><i className="bi bi-clock me-2 text-warning"></i>Onboarding Pending</h6><p className="text-muted small mb-0">Your employment record is being prepared. Check back after your start date.</p></div></div>}
        <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"></i>Quick Links</h6>
          <div className="d-grid gap-2">
            <Link to="/profile" className="btn btn-outline-primary btn-sm"><i className="bi bi-person-circle me-2"></i>View Profile</Link>
            {aarf?.acknowledgement_token && <Link to={"/aarf/"+aarf.acknowledgement_token} className="btn btn-outline-secondary btn-sm"><i className="bi bi-file-earmark-check me-2"></i>View / Acknowledge AARF</Link>}
            <Link to="/account" className="btn btn-outline-secondary btn-sm"><i className="bi bi-gear me-2"></i>Account Settings</Link>
          </div>
        </div></div>
      </div>
    </Layout>
  );
}
