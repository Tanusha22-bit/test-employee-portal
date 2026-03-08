
import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getOnboarding, updateOnboarding, getHrUsers, getItUsers } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canEditAllOnboarding } from '../../lib/auth';

const ROLE_OPTS = [
  ['manager','Manager'],['senior_executive','Senior Executive'],['executive_associate','Executive / Associate'],
  ['director_hod','Director / HOD'],['hr_manager','HR Manager'],['hr_executive','HR Executive'],
  ['hr_intern','HR Intern'],['it_manager','IT Manager'],['it_executive','IT Executive'],
  ['it_intern','IT Intern'],['superadmin','Superadmin'],['system_admin','System Admin'],['others','Others'],
];

export default function OnboardingEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [itUsers, setItUsers] = useState<any[]>([]);
  const [flash, setFlash] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const editAll = canEditAllOnboarding(user?.role || '');

  useEffect(() => {
    getOnboarding(Number(id)).then(d => {
      const o = d.onboarding;
      const pd = o.personal_details || {};
      const wd = o.work_details || {};
      const ap = o.asset_provisionings || {};
      setForm({ ...pd, ...wd, ...ap, hr_email: o.hr_email, it_email: o.it_email,
        date_of_birth: pd.date_of_birth ? new Date(pd.date_of_birth).toISOString().slice(0,10) : '',
        start_date: wd.start_date ? new Date(wd.start_date).toISOString().slice(0,10) : '',
        exit_date: wd.exit_date ? new Date(wd.exit_date).toISOString().slice(0,10) : '',
      });
    });
    getHrUsers().then(d => setHrUsers(d.users || []));
    getItUsers().then(d => setItUsers(d.users || []));
  }, [id]);

  function upd(k: string) {
    return (e: any) => setForm((f:any) => ({...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value}));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await updateOnboarding(Number(id), {
        pd: { full_name:form.full_name, official_document_id:form.official_document_id, date_of_birth:form.date_of_birth, sex:form.sex, marital_status:form.marital_status, religion:form.religion, race:form.race, residential_address:form.residential_address, personal_contact_number:form.personal_contact_number, personal_email:form.personal_email, bank_account_number:form.bank_account_number },
        wd: { employee_status:form.employee_status, staff_status:form.staff_status, employment_type:form.employment_type, designation:form.designation, department:form.department, company:form.company, office_location:form.office_location, reporting_manager:form.reporting_manager, start_date:form.start_date, exit_date:form.exit_date||null, company_email:form.company_email||null, google_id:form.google_id||null, role:form.role||null },
        ap: editAll ? { laptop_provision:form.laptop_provision, monitor_set:form.monitor_set, converter:form.converter, company_phone:form.company_phone, sim_card:form.sim_card, access_card_request:form.access_card_request, office_keys:form.office_keys||null, others:form.others||null } : undefined,
        hr_email: form.hr_email, it_email: form.it_email,
      });
      navigate('/onboarding/'+id, { state: { success: 'Record updated successfully.' } });
    } catch(err:any) { setFlash({ error: err.message }); }
    finally { setSaving(false); }
  }

  if (!form) return <Layout title="Loading..."><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;

  return (
    <Layout title="Edit Onboarding">
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb"><li className="breadcrumb-item"><Link to="/onboarding">Onboarding</Link></li><li className="breadcrumb-item"><Link to={"/onboarding/"+id}>{form.full_name || '#'+id}</Link></li><li className="breadcrumb-item active">Edit</li></ol></nav>
      <Flash {...flash} />
      <form onSubmit={handleSubmit}>
        <div className="bg-white border rounded-3 p-4 mb-3">
          <div className="section-hdr"><i className="bi bi-person me-2"></i>Section A — Personal Details</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label small fw-semibold">Full Name *</label><input className="form-control form-control-sm" value={form.full_name||''} onChange={upd('full_name')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">NRIC / Passport *</label><input className="form-control form-control-sm" value={form.official_document_id||''} onChange={upd('official_document_id')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Date of Birth *</label><input type="date" className="form-control form-control-sm" value={form.date_of_birth||''} onChange={upd('date_of_birth')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Sex *</label><select className="form-select form-select-sm" value={form.sex||''} onChange={upd('sex')} required><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Marital Status *</label><select className="form-select form-select-sm" value={form.marital_status||''} onChange={upd('marital_status')} required><option value="">Select...</option>{['single','married','divorced','widowed'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Religion *</label><input className="form-control form-control-sm" value={form.religion||''} onChange={upd('religion')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Race *</label><input className="form-control form-control-sm" value={form.race||''} onChange={upd('race')} required /></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Contact *</label><input className="form-control form-control-sm" value={form.personal_contact_number||''} onChange={upd('personal_contact_number')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Personal Email *</label><input type="email" className="form-control form-control-sm" value={form.personal_email||''} onChange={upd('personal_email')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Bank Account *</label><input className="form-control form-control-sm" value={form.bank_account_number||''} onChange={upd('bank_account_number')} required /></div>
            <div className="col-12"><label className="form-label small fw-semibold">Residential Address *</label><textarea className="form-control form-control-sm" rows={2} value={form.residential_address||''} onChange={upd('residential_address')} required /></div>
          </div>
        </div>
        <div className="bg-white border rounded-3 p-4 mb-3">
          <div className="section-hdr"><i className="bi bi-briefcase me-2"></i>Section B — Work Details</div>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label small fw-semibold">Employee Status *</label><select className="form-select form-select-sm" value={form.employee_status||''} onChange={upd('employee_status')} required><option value="active">Active</option><option value="resigned">Resigned</option></select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Staff Status *</label><select className="form-select form-select-sm" value={form.staff_status||''} onChange={upd('staff_status')} required><option value="new">New</option><option value="existing">Existing</option></select></div>
            <div className="col-md-4"><label className="form-label small fw-semibold">Employment Type *</label><select className="form-select form-select-sm" value={form.employment_type||''} onChange={upd('employment_type')} required><option value="permanent">Permanent</option><option value="intern">Intern</option><option value="contract">Contract</option></select></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Designation *</label><input className="form-control form-control-sm" value={form.designation||''} onChange={upd('designation')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Department</label><input className="form-control form-control-sm" value={form.department||''} onChange={upd('department')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Company *</label><input className="form-control form-control-sm" value={form.company||''} onChange={upd('company')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Office Location *</label><input className="form-control form-control-sm" value={form.office_location||''} onChange={upd('office_location')} required /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Reporting Manager *</label><input className="form-control form-control-sm" value={form.reporting_manager||''} onChange={upd('reporting_manager')} required /></div>
            <div className="col-md-3"><label className="form-label small fw-semibold">Start Date *</label><input type="date" className="form-control form-control-sm" value={form.start_date||''} onChange={upd('start_date')} required /></div>
            <div className="col-md-3"><label className="form-label small fw-semibold">Exit Date</label><input type="date" className="form-control form-control-sm" value={form.exit_date||''} onChange={upd('exit_date')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">Company Email</label><input type="email" className="form-control form-control-sm" value={form.company_email||''} onChange={upd('company_email')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">HR In-Charge</label><select className="form-select form-select-sm" value={form.hr_email||''} onChange={upd('hr_email')} required><option value="">Select...</option>{hrUsers.map((u:any)=><option key={u.id} value={u.work_email}>{u.name}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label small fw-semibold">IT In-Charge</label><select className="form-select form-select-sm" value={form.it_email||''} onChange={upd('it_email')} required><option value="">Select...</option>{itUsers.map((u:any)=><option key={u.id} value={u.work_email}>{u.name}</option>)}</select></div>
          </div>
        </div>
        {editAll && <div className="bg-white border rounded-3 p-4 mb-3">
          <div className="section-hdr"><i className="bi bi-laptop me-2"></i>Section C — Asset Provisioning</div>
          <div className="row g-3">
            {[['laptop_provision','Laptop'],['monitor_set','Monitor'],['converter','Converter'],['company_phone','Phone'],['sim_card','SIM'],['access_card_request','Access Card']].map(([k,l])=>(
              <div className="col-md-4" key={k}><div className="form-check"><input className="form-check-input" type="checkbox" id={"e_"+k} checked={!!form[k]} onChange={upd(k)} /><label className="form-check-label small" htmlFor={"e_"+k}>{l}</label></div></div>
            ))}
          </div>
        </div>}
        <div className="d-flex gap-2 justify-content-end">
          <Link to={"/onboarding/"+id} className="btn btn-outline-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : <><i className="bi bi-check-circle me-2"></i>Save Changes</>}</button>
        </div>
      </form>
    </Layout>
  );
}
