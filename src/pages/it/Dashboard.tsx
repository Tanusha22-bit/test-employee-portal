
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getItStats } from '../../lib/api';

export default function ItDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { getItStats().then(setStats).catch(console.error); }, []);
  const cards = [
    { label:'Total Assets',        value:stats?.total_assets||0,        icon:'bi-laptop',       bg:'#f1f5f9',color:'#64748b' },
    { label:'Available',           value:stats?.available||0,           icon:'bi-check-circle', bg:'#d1fae5',color:'#059669' },
    { label:'Assigned',            value:stats?.assigned||0,            icon:'bi-person-badge', bg:'#dbeafe',color:'#2563eb' },
    { label:'Under Maintenance',   value:stats?.under_maintenance||0,   icon:'bi-tools',        bg:'#fef3c7',color:'#d97706' },
  ];
  return (
    <Layout title="IT Dashboard">
      <div className="row g-3 mb-4">
        {cards.map(c=><div className="col-sm-6 col-xl-3" key={c.label}><div className="stat-card"><div className="d-flex align-items-center gap-3"><div className="stat-icon" style={{background:c.bg,color:c.color}}><i className={"bi "+c.icon}></i></div><div><div className="text-muted small">{c.label}</div><div className="fw-bold fs-4">{stats ? c.value : '…'}</div></div></div></div></div>)}
      </div>
      <div className="bg-white border rounded-3 p-4" style={{maxWidth:300}}>
        <h6 className="fw-bold mb-3"><i className="bi bi-lightning me-2 text-primary"></i>Quick Actions</h6>
        <div className="d-grid gap-2">
          <Link to="/assets" className="btn btn-primary btn-sm"><i className="bi bi-laptop me-2"></i>Manage Assets</Link>
          <Link to="/it/aarfs" className="btn btn-outline-secondary btn-sm"><i className="bi bi-file-earmark-check me-2"></i>Manage AARFs</Link>
        </div>
      </div>
    </Layout>
  );
}
