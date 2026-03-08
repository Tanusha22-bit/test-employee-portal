
import { useEffect, useState, FormEvent } from 'react';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getProfile, updateBiodata, updateWorkInfo } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [emp, setEmp] = useState<any>({});
  const [aarf, setAarf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<any>({});
  const [biodataForm, setBiodataForm] = useState<any>({});
  const [workForm, setWorkForm] = useState<any>({});
  const [savingBio, setSavingBio] = useState(false);
  const [savingWork, setSavingWork] = useState(false);

  function load() {
    setLoading(true);
    getProfile().then(d=>{
      const e = d.employee || {};
      setEmp(e); setAarf(d.aarf);
      setBiodataForm({ full_name:e.full_name||'', official_document_id:e.official_document_id||'', date_of_birth:e.date_of_birth?new Date(e.date_of_birth).toISOString().slice(0,10):'', sex:e.sex||'', marital_status:e.marital_status||'', religion:e.religion||'', race:e.race||'', residential_address:e.residential_address||'', personal_contact_number:e.personal_contact_number||'', personal_email:e.personal_email||'', bank_account_number:e.bank_account_number||'' });
      setWorkForm({ designation:e.designation||'', department:e.department||'', company:e.company||'', office_location:e.office_location||'', reporting_manager:e.reporting_manager||'', company_email:e.company_email||'', start_date:e.start_date?new Date(e.start_date).toISOString().slice(0,10):'', employment_type:e.employment_type||'' });
    }).finally(()=>setLoading(false));
  }
  useEffect(load, []);

  async function saveBiodata(e:FormEvent){ e.preventDefault(); setSavingBio(true);
    try { await updateBiodata(biodataForm); setFlash({success:'Personal information updated.'}); load(); }
    catch(err:any){ setFlash({error:err.message}); } finally{ setSavingBio(false); }
  }
  async function saveWork(e:FormEvent){ e.preventDefault(); setSavingWork(true);
    try { await updateWorkInfo(workForm); setFlash({success:'Work information updated.'}); load(); }
    catch(err:any){ setFlash({error:err.message}); } finally{ setSavingWork(false); }
  }

  const updBio = (k:string) => (e:any) => setBiodataForm((f:any)=>({...f,[k]:e.target.value}));
  const updWork = (k:string) => (e:any) => setWorkForm((f:any)=>({...f,[k]:e.target.value}));

  if(loading) return <Layout title="Profile"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;

  return (
    <Layout title="Profile">
      <Flash {...flash}/>
      {aarf?.acknowledgement_token && <div className="alert alert-info mb-3"><i className="bi bi-file-earmark-check me-2"></i>You have a pending AARF. <Link to={"/aarf/"+aarf.acknowledgement_token} className="fw-semibold">Click here to view & acknowledge →</Link></div>}

      {/* Personal Biodata */}
      <div className="bg-white border rounded-3 p-4 mb-4">
        <h6 className="fw-bold mb-3"><i className="bi bi-person me-2 text-primary"></i>Section A — Personal Biodata</h6>
        <form onSubmit={saveBiodata}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label small fw-semibold">Full Name</label><input className="form-control form-control-sm" value={biodataForm.full_name} onChange={updBio('full_name')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">NRIC / Passport No.</label><input className="form-control form-control-sm" value={biodataForm.official_document_id} onChange={updBio('official_document_id')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Date of Birth</label><input type="date" className="form-control form-control-sm" value={biodataForm.date_of_birth} onChange={updBio('date_of_birth')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Sex</label><select className="form-select form-select-sm" value={biodataForm.sex} onChange={updBio('sex')}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Marital Status</label><select className="form-select form-select-sm" value={biodataForm.marital_status} onChange={updBio('marital_status')}><option value="">Select...</option>{['single','married','divorced','widowed'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Religion</label><input className="form-control form-control-sm" value={biodataForm.religion} onChange={updBio('religion')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Race</label><input className="form-control form-control-sm" value={biodataForm.race} onChange={updBio('race')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Contact Number</label><input className="form-control form-control-sm" value={biodataForm.personal_contact_number} onChange={updBio('personal_contact_number')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Personal Email</label><input type="email" className="form-control form-control-sm" value={biodataForm.personal_email} onChange={updBio('personal_email')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Bank Account Number</label><input className="form-control form-control-sm" value={biodataForm.bank_account_number} onChange={updBio('bank_account_number')} /></div>
            <div className="col-12"><label className="form-label small fw-semibold">Residential Address</label><textarea className="form-control form-control-sm" rows={2} value={biodataForm.residential_address} onChange={updBio('residential_address')} /></div>
          </div>
          <div className="mt-3"><button type="submit" className="btn btn-primary btn-sm" disabled={savingBio}>{savingBio?'Saving...':'Save Personal Info'}</button></div>
        </form>
      </div>

      {/* Work Info */}
      <div className="bg-white border rounded-3 p-4">
        <h6 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"></i>Section B — Work Information</h6>
        <form onSubmit={saveWork}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label small fw-semibold">Designation</label><input className="form-control form-control-sm" value={workForm.designation} onChange={updWork('designation')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Department</label><input className="form-control form-control-sm" value={workForm.department} onChange={updWork('department')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Company</label><input className="form-control form-control-sm" value={workForm.company} onChange={updWork('company')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Office Location</label><input className="form-control form-control-sm" value={workForm.office_location} onChange={updWork('office_location')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Reporting Manager</label><input className="form-control form-control-sm" value={workForm.reporting_manager} onChange={updWork('reporting_manager')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Company Email</label><input type="email" className="form-control form-control-sm" value={workForm.company_email} onChange={updWork('company_email')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Start Date</label><input type="date" className="form-control form-control-sm" value={workForm.start_date} onChange={updWork('start_date')} /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Employment Type</label><select className="form-select form-select-sm" value={workForm.employment_type} onChange={updWork('employment_type')}><option value="">Select...</option><option value="permanent">Permanent</option><option value="intern">Intern</option><option value="contract">Contract</option></select></div>
          </div>
          <div className="mt-3"><button type="submit" className="btn btn-primary btn-sm" disabled={savingWork}>{savingWork?'Saving...':'Save Work Info'}</button></div>
        </form>
      </div>
    </Layout>
  );
}
