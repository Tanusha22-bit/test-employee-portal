
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAarf } from '../../lib/api';

export default function HrAarfView() {
  const { id } = useParams();
  const [aarf, setAarf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAarf(Number(id)).then(d => setAarf(d.aarf)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <Layout title="AARF"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if (!aarf) return <Layout title="AARF"><div className="alert alert-danger">Not found.</div></Layout>;

  const pd = aarf.onboardings?.personal_details || {};
  const wd = aarf.onboardings?.work_details || {};
  const assignments = aarf.onboardings?.asset_assignments || [];

  return (
    <Layout title="AARF Detail">
      <div className="mb-3"><nav aria-label="breadcrumb"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li><li className="breadcrumb-item active">AARF {aarf.aarf_reference}</li></ol></nav></div>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Employee Details</h6>
            <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{pd.full_name}</span></div>
            <div className="info-row"><span className="info-label">Designation</span><span className="info-value">{wd.designation}</span></div>
            <div className="info-row"><span className="info-label">Start Date</span><span className="info-value">{wd.start_date && new Date(wd.start_date).toLocaleDateString('en-MY')}</span></div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Acknowledgement Status</h6>
            <div className="info-row"><span className="info-label">Reference</span><span className="info-value">{aarf.aarf_reference}</span></div>
            <div className="info-row"><span className="info-label">Employee</span><span className={`badge ${aarf.acknowledged?'bg-success':'bg-warning text-dark'}`}>{aarf.acknowledged?'Acknowledged':'Pending'}</span></div>
            <div className="info-row"><span className="info-label">IT Manager</span><span className={`badge ${aarf.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{aarf.it_manager_acknowledged?'Acknowledged':'Pending'}</span></div>
          </div>
        </div>
        <div className="col-12">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3">Assigned Assets</h6>
            {assignments.length ? <table className="table table-sm"><thead><tr><th>Tag</th><th>Asset</th><th>Type</th><th>Serial</th></tr></thead><tbody>
              {assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_tag}</td><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.serial_number}</td></tr>)}
            </tbody></table> : <p className="text-muted small">No assets assigned.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
