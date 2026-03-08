
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAarfs } from '../../lib/api';

export default function AarfList() {
  const [aarfs, setAarfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAarfs().then(d=>setAarfs(d.aarfs||[])).finally(()=>setLoading(false)); }, []);
  return (
    <Layout title="AARFs">
      <div className="bg-white border rounded-3 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead><tr><th>Reference</th><th>Employee</th><th>Designation</th><th>Start Date</th><th>Employee Ack</th><th>IT Ack</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"/></td></tr>}
            {!loading && !aarfs.length && <tr><td colSpan={7} className="text-center py-4 text-muted"><i className="bi bi-inbox fs-4 d-block mb-1"></i>No AARFs found</td></tr>}
            {aarfs.map((a:any) => {
              const pd = a.onboardings?.personal_details || {};
              const wd = a.onboardings?.work_details || {};
              return (
                <tr key={a.id}>
                  <td className="small fw-semibold">{a.aarf_reference}</td>
                  <td className="small">{pd.full_name||'—'}</td>
                  <td className="small">{wd.designation||'—'}</td>
                  <td className="small">{wd.start_date ? new Date(wd.start_date).toLocaleDateString('en-MY') : '—'}</td>
                  <td><span className={"badge "+(a.acknowledged?'bg-success':'bg-warning text-dark')}>{a.acknowledged ? '✓ Done' : 'Pending'}</span></td>
                  <td><span className={"badge "+(a.it_manager_acknowledged?'bg-primary':'bg-secondary')}>{a.it_manager_acknowledged ? '✓ Done' : 'Pending'}</span></td>
                  <td>
                    <Link to={"/it/aarfs/"+a.id} className="btn btn-outline-primary btn-sm py-0 px-2 me-1">View</Link>
                    <Link to={"/it/aarfs/"+a.id+"/edit"} className="btn btn-outline-secondary btn-sm py-0 px-2">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
