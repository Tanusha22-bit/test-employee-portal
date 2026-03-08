import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getHrStats } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canAddOnboarding } from '../../lib/auth';

export default function HrDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHrStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Onboardings',      value: stats?.total_onboardings || 0,      icon: 'bi-people',        bg: '#dbeafe', color: '#2563eb' },
    { label: 'Active Employees',        value: stats?.active_employees || 0,        icon: 'bi-person-check',  bg: '#d1fae5', color: '#059669' },
    { label: 'New Joiners This Month',  value: stats?.new_joiners_this_month || 0,  icon: 'bi-calendar-plus', bg: '#fef3c7', color: '#d97706' },
    { label: 'Exiting This Month',      value: stats?.exiting_this_month || 0,      icon: 'bi-calendar-x',    bg: '#fee2e2', color: '#dc2626' },
  ];

  return (
    <Layout title="HR Dashboard">
      <div className="row g-3 mb-4">
        {cards.map(c => (
          <div className="col-sm-6 col-xl-3" key={c.label}>
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{background:c.bg,color:c.color}}><i className={`bi ${c.icon}`}></i></div>
                <div>
                  <div className="text-muted small">{c.label}</div>
                  <div className="fw-bold fs-4">{loading ? '…' : c.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"></i>Quick Actions</h6>
            <div className="d-grid gap-2">
              <Link to="/onboarding" className="btn btn-primary btn-sm"><i className="bi bi-person-plus me-2"></i>Go to Onboarding</Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-info-circle me-2 text-primary"></i>Logged In As</h6>
            <p className="text-muted small mb-0">Name: <strong>{user?.name}</strong><br/>Role: <strong className="text-capitalize">{user?.role?.replace(/_/g,' ')}</strong></p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
