import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Flash from '../../components/Flash';
import { getOnboardings, createOnboarding, getHrUsers, getItUsers } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canAddOnboarding, canEditOnboarding, canEditAllOnboarding } from '../../lib/auth';

const ROLE_OPTS = [
  ['manager','Manager'],['senior_executive','Senior Executive'],['executive_associate','Executive / Associate'],
  ['director_hod','Director / HOD'],['hr_manager','HR Manager'],['hr_executive','HR Executive'],
  ['hr_intern','HR Intern'],['it_manager','IT Manager'],['it_executive','IT Executive'],
  ['it_intern','IT Intern'],['superadmin','Superadmin'],['system_admin','System Admin'],['others','Others'],
];

const EMPTY_FORM = {
  // Section A
  full_name:'',official_document_id:'',date_of_birth:'',sex:'',marital_status:'',religion:'',race:'',
  residential_address:'',personal_contact_number:'',personal_email:'',bank_account_number:'',
  // Section B
  employee_status:'active',staff_status:'new',employment_type:'',designation:'',department:'',
  company:'Claritas Asia Sdn. Bhd.',office_location:'Kuala Lumpur HQ',reporting_manager:'',
  start_date:'',exit_date:'',company_email:'',google_id:'',role_level:'',
  // HR/IT
  hr_email:'',it_email:'',
  // Section C
  laptop_provision:false,monitor_set:false,converter:false,company_phone:false,sim_card:false,
  access_card_request:false,office_keys:'',others_note:'',
};

export default function OnboardingList() {
  const { user } = useAuth();
  const role = user?.role || '';
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [companies, setCompanies] = useState<string[]>([]);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [itUsers, setItUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({...EMPTY_FORM});
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{success?:string,error?:string}>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const page = parseInt(sp.get('page') || '1');
  const search = sp.get('search') || '';
  const company = sp.get('company') || '';

  useEffect(() => {
    setLoading(true);
    const params: any = { page: String(page) };
    if (search) params.search = search;
    if (company) params.company = company;
    getOnboardings(params).then(d => {
      setData(d.onboardings || []);
      setTotal(d.total || 0);
      setCompanies(d.companies || []);
    }).finally(() => setLoading(false));
  }, [page, search, company]);

  useEffect(() => {
    getHrUsers().then(d => setHrUsers(d.users || []));
    getItUsers().then(d => setItUsers(d.users || []));
  }, []);

  function upd(k: string) {
    return (e: any) => setForm(f => ({...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value}));
  }

  async function handleSubmit(e: any) {
    e.preventDefault(); setSubmitting(true);
    try {
      await createOnboarding({
        pd: { full_name: form.full_name, official_document_id: form.official_document_id, date_of_birth: form.date_of_birth, sex: form.sex, marital_status: form.marital_status, religion: form.religion, race: form.race, residential_address: form.residential_address, personal_contact_number: form.personal_contact_number, personal_email: form.personal_email, bank_account_number: form.bank_account_number },
        wd: { employee_status: form.employee_status, staff_status: form.staff_status, employment_type: form.employment_type, designation: form.designation, department: form.department, company: form.company, office_location: form.office_location, reporting_manager: form.reporting_manager, start_date: form.start_date, exit_date: form.exit_date || null, company_email: form.company_email || null, google_id: form.google_id || null, role: form.role_level || null },
        ap: { laptop_provision: form.laptop_provision, monitor_set: form.monitor_set, converter: form.converter, company_phone: form.company_phone, sim_card: form.sim_card, access_card_request: form.access_card_request, office_keys: form.office_keys || null, others: form.others_note || null },
        hr_email: form.hr_email, it_email: form.it_email,
      });
      setFlash({ success: 'Onboarding record created! Welcome email and calendar invites sent.' });
      setForm({...EMPTY_FORM});
      // Close modal
      const modal = (window as any).bootstrap?.Modal?.getInstance(modalRef.current);
      modal?.hide();
      // Reload
      getOnboardings({ page: '1' }).then(d => { setData(d.onboardings || []); setTotal(d.total || 0); });
    } catch(err: any) {
      setFlash({ error: err.message || 'Failed to create record.' });
    } finally { setSubmitting(false); }
  }

  function handleSearch(e: any) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const params: any = {};
    if (fd.get('search')) params.search = fd.get('search');
    if (fd.get('company')) params.company = fd.get('company');
    setSp(params);
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <Layout title="Onboarding">
      <Flash {...flash} />

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
          <input name="search" className="form-control form-control-sm" style={{width:220}} placeholder="Search name, email, designation..." defaultValue={search} />
          <select name="company" className="form-select form-select-sm" style={{width:160}} defaultValue={company}>
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-sm"><i className="bi bi-search"></i></button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSp({})}><i className="bi bi-x"></i></button>
        </form>
        <div className="d-flex gap-2">
          <a href={`${import.meta.env.VITE_EDGE_URL}/onboardings/export/csv`} className="btn btn-outline-secondary btn-sm" target="_blank"><i className="bi bi-download me-1"></i>CSV</a>
          {canAddOnboarding(role) && (
            <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addOnbModal">
              <i className="bi bi-plus-circle me-1"></i>Add New Onboarding
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-3 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead><tr>
            <th>#</th><th>Full Name</th><th>Designation</th><th>Company</th><th>Start Date</th><th>Status</th><th>AARF</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"/></td></tr>}
            {!loading && !data.length && <tr><td colSpan={8} className="text-center py-4 text-muted"><i className="bi bi-inbox fs-4 d-block mb-1"></i>No records found</td></tr>}
            {data.map((o: any) => {
              const pd = o.personal_details || {};
              const wd = o.work_details || {};
              const aarf = Array.isArray(o.aarfs) ? o.aarfs[0] : o.aarfs;
              return (
                <tr key={o.id}>
                  <td className="text-muted small">{o.id}</td>
                  <td><div className="fw-semibold small">{pd.full_name || '—'}</div><div className="text-muted" style={{fontSize:11}}>{pd.personal_email}</div></td>
                  <td className="small">{wd.designation || '—'}<br/><span className="text-muted" style={{fontSize:11}}>{wd.department}</span></td>
                  <td className="small">{wd.company || '—'}</td>
                  <td className="small">{wd.start_date ? new Date(wd.start_date).toLocaleDateString('en-MY') : '—'}</td>
                  <td>
                    {o.status === 'active' && <span className="badge" style={{background:'#d1fae5',color:'#065f46'}}>Active</span>}
                    {o.status === 'offboarded' && <span className="badge bg-secondary">Offboarded</span>}
                    {o.status === 'pending' && <span className="badge" style={{background:'#fef3c7',color:'#92400e'}}>Pending</span>}
                  </td>
                  <td>
                    {aarf ? <>
                      <span className={`badge me-1 ${aarf.acknowledged ? 'bg-success' : 'bg-warning text-dark'}`} style={{fontSize:10}}>Emp {aarf.acknowledged ? '✓' : '?'}</span>
                      <span className={`badge ${aarf.it_manager_acknowledged ? 'bg-primary' : 'bg-secondary'}`} style={{fontSize:10}}>IT {aarf.it_manager_acknowledged ? '✓' : '?'}</span>
                    </> : <span className="text-muted small">—</span>}
                  </td>
                  <td>
                    <Link to={`/onboarding/${o.id}`} className="btn btn-outline-primary btn-sm py-0 px-2 me-1">View</Link>
                    {canEditOnboarding(role) && <Link to={`/onboarding/${o.id}/edit`} className="btn btn-outline-secondary btn-sm py-0 px-2">Edit</Link>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-3"><ul className="pagination pagination-sm justify-content-end">
          {Array.from({length: totalPages}, (_,i) => (
            <li key={i} className={`page-item ${i+1===page?'active':''}`}>
              <button className="page-link" onClick={() => setSp(p => { const n = new URLSearchParams(p); n.set('page',String(i+1)); return n; })}>{i+1}</button>
            </li>
          ))}
        </ul></nav>
      )}

      {/* Add Onboarding Modal */}
      <div className="modal fade" id="addOnbModal" tabIndex={-1} data-bs-backdrop="static" ref={modalRef}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
              <h5 className="modal-title text-white fw-bold"><i className="bi bi-person-plus me-2"></i>Add New Onboarding</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Section A */}
                <div className="section-hdr"><i className="bi bi-person me-2"></i>Section A — Personal Details</div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6"><label className="form-label small fw-semibold">Full Name *</label><input className="form-control form-control-sm" value={form.full_name} onChange={upd('full_name')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">NRIC / Passport No. *</label><input className="form-control form-control-sm" value={form.official_document_id} onChange={upd('official_document_id')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Date of Birth *</label><input type="date" className="form-control form-control-sm" value={form.date_of_birth} onChange={upd('date_of_birth')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Sex *</label><select className="form-select form-select-sm" value={form.sex} onChange={upd('sex')} required><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option></select></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Marital Status *</label><select className="form-select form-select-sm" value={form.marital_status} onChange={upd('marital_status')} required><option value="">Select...</option>{['single','married','divorced','widowed'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</select></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Religion *</label><input className="form-control form-control-sm" value={form.religion} onChange={upd('religion')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Race *</label><input className="form-control form-control-sm" value={form.race} onChange={upd('race')} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Contact Number *</label><input className="form-control form-control-sm" value={form.personal_contact_number} onChange={upd('personal_contact_number')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Personal Email *</label><input type="email" className="form-control form-control-sm" value={form.personal_email} onChange={upd('personal_email')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Bank Account Number *</label><input className="form-control form-control-sm" value={form.bank_account_number} onChange={upd('bank_account_number')} required /></div>
                  <div className="col-12"><label className="form-label small fw-semibold">Residential Address *</label><textarea className="form-control form-control-sm" rows={2} value={form.residential_address} onChange={upd('residential_address')} required /></div>
                </div>
                {/* Section B */}
                <div className="section-hdr"><i className="bi bi-briefcase me-2"></i>Section B — Work Details</div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4"><label className="form-label small fw-semibold">Employee Status *</label><select className="form-select form-select-sm" value={form.employee_status} onChange={upd('employee_status')} required><option value="active">Active</option><option value="resigned">Resigned</option></select></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Staff Status *</label><select className="form-select form-select-sm" value={form.staff_status} onChange={upd('staff_status')} required><option value="new">New</option><option value="existing">Existing</option></select></div>
                  <div className="col-md-4"><label className="form-label small fw-semibold">Employment Type *</label><select className="form-select form-select-sm" value={form.employment_type} onChange={upd('employment_type')} required><option value="">Select...</option><option value="permanent">Permanent</option><option value="intern">Intern</option><option value="contract">Contract</option></select></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Designation *</label><input className="form-control form-control-sm" value={form.designation} onChange={upd('designation')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Department</label><input className="form-control form-control-sm" value={form.department} onChange={upd('department')} /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Company *</label><input className="form-control form-control-sm" value={form.company} onChange={upd('company')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Office Location *</label><input className="form-control form-control-sm" value={form.office_location} onChange={upd('office_location')} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Reporting Manager *</label><input className="form-control form-control-sm" value={form.reporting_manager} onChange={upd('reporting_manager')} required /></div>
                  <div className="col-md-3"><label className="form-label small fw-semibold">Start Date *</label><input type="date" className="form-control form-control-sm" value={form.start_date} onChange={upd('start_date')} required /></div>
                  <div className="col-md-3"><label className="form-label small fw-semibold">Exit Date</label><input type="date" className="form-control form-control-sm" value={form.exit_date} onChange={upd('exit_date')} /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Company Email</label><input type="email" className="form-control form-control-sm" value={form.company_email} onChange={upd('company_email')} /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Google Workspace ID</label><input className="form-control form-control-sm" value={form.google_id} onChange={upd('google_id')} /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">HR In-Charge *</label><select className="form-select form-select-sm" value={form.hr_email} onChange={upd('hr_email')} required><option value="">Select HR staff...</option>{hrUsers.map((u:any)=><option key={u.id} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">IT In-Charge *</label><select className="form-select form-select-sm" value={form.it_email} onChange={upd('it_email')} required><option value="">Select IT staff...</option>{itUsers.map((u:any)=><option key={u.id} value={u.work_email}>{u.name} ({u.work_email})</option>)}</select></div>
                </div>
                {/* Section C (only managers) */}
                {canEditAllOnboarding(role) && <>
                  <div className="section-hdr"><i className="bi bi-laptop me-2"></i>Section C — Asset Provisioning</div>
                  <div className="row g-3 mb-4">
                    {[['laptop_provision','Laptop / Notebook'],['monitor_set','Monitor Set'],['converter','Converter / USB Hub'],['company_phone','Company Phone'],['sim_card','SIM Card'],['access_card_request','Access Card']].map(([k,l])=>(
                      <div className="col-md-4" key={k}><div className="form-check"><input className="form-check-input" type="checkbox" id={k} checked={(form as any)[k]} onChange={upd(k)} /><label className="form-check-label small" htmlFor={k}>{l}</label></div></div>
                    ))}
                    <div className="col-md-6"><label className="form-label small fw-semibold">Office Keys</label><input className="form-control form-control-sm" value={form.office_keys} onChange={upd('office_keys')} /></div>
                    <div className="col-md-6"><label className="form-label small fw-semibold">Others</label><textarea className="form-control form-control-sm" rows={2} value={form.others_note} onChange={upd('others_note')} /></div>
                  </div>
                  <div className="section-hdr"><i className="bi bi-award me-2"></i>Section D — Role Level</div>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label small fw-semibold">Role Level *</label><select className="form-select form-select-sm" value={form.role_level} onChange={upd('role_level')} required><option value="">Select...</option>{ROLE_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
                  </div>
                </>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : <><i className="bi bi-check-circle me-2"></i>Create Onboarding Record</>}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
