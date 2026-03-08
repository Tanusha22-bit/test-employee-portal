
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getOnboarding } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canEditOnboarding } from '../../lib/auth';

export default function OnboardingShow() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOnboarding(Number(id)).then(d => setData(d.onboarding)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Loading..."><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if (!data) return <Layout title="Not Found"><div className="alert alert-danger">Record not found.</div></Layout>;

  const pd = data.personal_details || {};
  const wd = data.work_details || {};
  const ap = data.asset_provisionings || {};
  const assignments = data.asset_assignments || [];
  const aarf = Array.isArray(data.aarfs) ? data.aarfs[0] : data.aarfs;

  function InfoRow({label, value}: {label:string, value:any}) {
    if (!value) return null;
    return <div className="info-row"><span className="info-label">{label}</span><span className="info-value">{value}</span></div>;
  }

  return (
    <Layout title="Onboarding Detail">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <nav aria-label="breadcrumb"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li><li className="breadcrumb-item active">{pd.full_name || '#'+id}</li></ol></nav>
        <div className="d-flex gap-2">
          {aarf && <Link to={"/hr/aarf/"+aarf.id} className="btn btn-outline-primary btn-sm"><i className="bi bi-file-earmark-check me-1"></i>View AARF</Link>}
          {canEditOnboarding(user?.role||'') && <Link to={"/onboarding/"+id+"/edit"} className="btn btn-primary btn-sm"><i className="bi bi-pencil me-1"></i>Edit</Link>}
        </div>
      </div>
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="bg-white border rounded-3 overflow-hidden mb-3">
            <div className="section-hdr rounded-0" style={{borderRadius:'8px 8px 0 0'}}><i className="bi bi-person me-2"></i>Section A — Personal Details</div>
            <div className="p-4">
              <InfoRow label="Full Name" value={pd.full_name}/>
              <InfoRow label="Document ID" value={pd.official_document_id}/>
              <InfoRow label="Date of Birth" value={pd.date_of_birth && new Date(pd.date_of_birth).toLocaleDateString('en-MY')}/>
              <InfoRow label="Sex" value={pd.sex}/>
              <InfoRow label="Marital Status" value={pd.marital_status}/>
              <InfoRow label="Religion" value={pd.religion}/>
              <InfoRow label="Race" value={pd.race}/>
              <InfoRow label="Contact" value={pd.personal_contact_number}/>
              <InfoRow label="Personal Email" value={pd.personal_email}/>
              <InfoRow label="Bank Account" value={pd.bank_account_number}/>
              <InfoRow label="Address" value={pd.residential_address}/>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-3 overflow-hidden mb-3">
            <div className="section-hdr rounded-0" style={{borderRadius:'8px 8px 0 0'}}><i className="bi bi-briefcase me-2"></i>Section B — Work Details</div>
            <div className="p-4">
              <InfoRow label="Designation" value={wd.designation}/>
              <InfoRow label="Department" value={wd.department}/>
              <InfoRow label="Company" value={wd.company}/>
              <InfoRow label="Office" value={wd.office_location}/>
              <InfoRow label="Reporting Manager" value={wd.reporting_manager}/>
              <InfoRow label="Start Date" value={wd.start_date && new Date(wd.start_date).toLocaleDateString('en-MY')}/>
              <InfoRow label="Employment Type" value={wd.employment_type}/>
              <InfoRow label="Company Email" value={wd.company_email}/>
              <InfoRow label="Status" value={wd.employee_status}/>
              <InfoRow label="HR In-Charge" value={data.hr_email}/>
              <InfoRow label="IT In-Charge" value={data.it_email}/>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-3 overflow-hidden mb-3">
            <div className="section-hdr rounded-0" style={{borderRadius:'8px 8px 0 0'}}><i className="bi bi-laptop me-2"></i>Section C — Asset Provisioning</div>
            <div className="p-4">
              {[['laptop_provision','Laptop'],['monitor_set','Monitor'],['converter','Converter'],['company_phone','Phone'],['sim_card','SIM'],['access_card_request','Access Card']].map(([k,l])=>(
                <div className="info-row" key={k}><span className="info-label">{l}</span><span className={`badge ${ap[k] ? 'bg-success' : 'bg-secondary'}`}>{ap[k] ? 'Yes' : 'No'}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-3 overflow-hidden mb-3">
            <div className="section-hdr rounded-0" style={{borderRadius:'8px 8px 0 0'}}><i className="bi bi-file-earmark-check me-2"></i>AARF Status</div>
            <div className="p-4">
              {aarf ? <>
                <InfoRow label="Reference" value={aarf.aarf_reference}/>
                <div className="info-row"><span className="info-label">Employee Ack</span><span className={`badge ${aarf.acknowledged?'bg-success':'bg-warning text-dark'}`}>{aarf.acknowledged?('Acknowledged '+new Date(aarf.acknowledged_at).toLocaleDateString('en-MY')):'Pending'}</span></div>
                <div className="info-row"><span className="info-label">IT Manager Ack</span><span className={`badge ${aarf.it_manager_acknowledged?'bg-primary':'bg-secondary'}`}>{aarf.it_manager_acknowledged?('Acknowledged '+new Date(aarf.it_manager_acknowledged_at).toLocaleDateString('en-MY')):'Pending'}</span></div>
              </> : <p className="text-muted small">No AARF generated yet.</p>}
            </div>
          </div>
          <div className="bg-white border rounded-3 overflow-hidden">
            <div className="section-hdr rounded-0" style={{borderRadius:'8px 8px 0 0'}}><i className="bi bi-box-seam me-2"></i>Assigned Assets</div>
            <div className="p-4">
              {assignments.length ? <table className="table table-sm mb-0"><thead><tr><th>Asset</th><th>Type</th><th>Tag</th></tr></thead><tbody>
                {assignments.map((a:any)=><tr key={a.id}><td className="small">{a.asset_inventories?.asset_name}</td><td className="small">{a.asset_inventories?.asset_type}</td><td className="small">{a.asset_inventories?.asset_tag}</td></tr>)}
              </tbody></table> : <p className="text-muted small mb-0">No assets assigned.</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
