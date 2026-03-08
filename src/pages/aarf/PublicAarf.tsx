import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicAarf, acknowledgeAarf } from '../../lib/api';

export default function PublicAarf() {
  const { token } = useParams();
  const [aarf, setAarf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acking, setAcking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    getPublicAarf(token!).then(d => {
      if (d.error) setError(d.error);
      else setAarf(d.aarf);
    }).catch(() => setError('Failed to load AARF.')).finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleAcknowledge() {
    setAcking(true);
    try {
      const r = await acknowledgeAarf(token!);
      if (r.error) throw new Error(r.error);
      setDone(true);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAcking(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  if (error) return (
    <div className="aarf-wrap d-flex align-items-center justify-content-center">
      <div className="alert alert-danger text-center" style={{ maxWidth: 400 }}>
        <i className="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
        <h5>AARF Not Found</h5>
        <p className="mb-0">{error}</p>
      </div>
    </div>
  );

  const pd = aarf?.onboardings?.personal_details || {};
  const wd = aarf?.onboardings?.work_details || {};
  const assignments = aarf?.onboardings?.asset_assignments || [];

  return (
    <div className="aarf-wrap">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 className="mb-0 fw-bold"><i className="bi bi-file-earmark-check me-2"></i>Asset Acceptance & Return Form</h4>
            <p className="mb-0 mt-1" style={{ opacity: 0.8, fontSize: 14 }}>Claritas Asia Sdn. Bhd. — {aarf?.aarf_reference}</p>
          </div>
          <div className="text-end">
            <div style={{ fontSize: 13, opacity: 0.75 }}>Date Generated</div>
            <div className="fw-semibold">{aarf?.created_at ? new Date(aarf.created_at).toLocaleDateString('en-MY') : '—'}</div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {(aarf?.acknowledged || done) && (
        <div className="alert alert-success mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>
          <strong>Acknowledged!</strong> This AARF was acknowledged on {aarf?.acknowledged_at ? new Date(aarf.acknowledged_at).toLocaleDateString('en-MY', { dateStyle: 'long' }) : new Date().toLocaleDateString('en-MY', { dateStyle: 'long' })}.
        </div>
      )}

      <div className="row g-4">
        {/* Employee Details */}
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-person me-2 text-primary"></i>Employee Information</h6>
            {[
              ['Full Name', pd.full_name],
              ['NRIC / Passport', pd.official_document_id],
              ['Personal Email', pd.personal_email],
              ['Contact Number', pd.personal_contact_number],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div className="info-row" key={l as string}>
                <span className="info-label">{l}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Details */}
        <div className="col-md-6">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-primary"></i>Employment Details</h6>
            {[
              ['Designation', wd.designation],
              ['Department', wd.department],
              ['Company', wd.company],
              ['Office Location', wd.office_location],
              ['Reporting Manager', wd.reporting_manager],
              ['Start Date', wd.start_date ? new Date(wd.start_date).toLocaleDateString('en-MY') : null],
              ['Work Email', wd.company_email],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div className="info-row" key={l as string}>
                <span className="info-label">{l}</span>
                <span className="info-value">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Assets */}
        <div className="col-12">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-laptop me-2 text-primary"></i>Assigned Assets</h6>
            {!assignments.length ? (
              <p className="text-muted small mb-0">No assets assigned for this onboarding.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-sm mb-0">
                  <thead>
                    <tr><th>#</th><th>Asset Tag</th><th>Description</th><th>Type</th><th>Brand / Model</th><th>Serial Number</th><th>Assigned Date</th></tr>
                  </thead>
                  <tbody>
                    {assignments.map((a: any, i: number) => (
                      <tr key={a.id}>
                        <td className="small">{i + 1}</td>
                        <td className="small fw-semibold">{a.asset_inventories?.asset_tag}</td>
                        <td className="small">{a.asset_inventories?.asset_name}</td>
                        <td className="small">{a.asset_inventories?.asset_type}</td>
                        <td className="small">{a.asset_inventories?.brand} {a.asset_inventories?.model}</td>
                        <td className="small text-muted">{a.asset_inventories?.serial_number}</td>
                        <td className="small">{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString('en-MY') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* IT Notes */}
        {aarf?.it_notes && (
          <div className="col-12">
            <div className="bg-white border rounded-3 p-4">
              <h6 className="fw-bold mb-2"><i className="bi bi-sticky me-2 text-primary"></i>IT Notes</h6>
              <p className="mb-0 small">{aarf.it_notes}</p>
            </div>
          </div>
        )}

        {/* Declaration + Acknowledge Button */}
        <div className="col-12">
          <div className="bg-white border rounded-3 p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-pen me-2 text-primary"></i>Declaration</h6>
            <div className="p-3 rounded-3 mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 14 }}>
              <p className="mb-2">I, <strong>{pd.full_name || '_______________'}</strong>, hereby acknowledge receipt of the above-listed assets from <strong>Claritas Asia Sdn. Bhd.</strong></p>
              <p className="mb-2">I understand and agree that:</p>
              <ol style={{ paddingLeft: 20 }}>
                <li className="mb-1">These assets remain the property of Claritas Asia Sdn. Bhd. at all times.</li>
                <li className="mb-1">I am responsible for the safe-keeping and proper use of all assigned assets.</li>
                <li className="mb-1">I will return all assets in good condition upon resignation, termination, or as requested.</li>
                <li className="mb-1">Any damage, loss, or theft must be reported to the IT department immediately.</li>
                <li>I am liable for the replacement cost of any assets lost or damaged due to negligence.</li>
              </ol>
            </div>

            {aarf?.acknowledged || done ? (
              <div className="p-3 rounded-3 text-center" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                <i className="bi bi-check-circle-fill text-success fs-4 d-block mb-2"></i>
                <div className="fw-semibold text-success">This form has been acknowledged</div>
                <div className="text-muted small mt-1">
                  Acknowledged on: {aarf?.acknowledged_at ? new Date(aarf.acknowledged_at).toLocaleDateString('en-MY', { dateStyle: 'long' }) : new Date().toLocaleDateString('en-MY', { dateStyle: 'long' })}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted small mb-3">By clicking the button below, you confirm that you have read and agree to the above declaration.</p>
                <button
                  className="btn btn-primary btn-lg px-5"
                  onClick={handleAcknowledge}
                  disabled={acking}
                >
                  {acking
                    ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                    : <><i className="bi bi-check-circle me-2"></i>I Acknowledge & Accept</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* IT Manager Ack Status */}
        <div className="col-12">
          <div className="bg-white border rounded-3 p-3 d-flex align-items-center gap-3">
            <i className={`bi fs-4 ${aarf?.it_manager_acknowledged ? 'bi-patch-check-fill text-primary' : 'bi-patch-question text-secondary'}`}></i>
            <div>
              <div className="fw-semibold small">IT Manager Acknowledgement</div>
              <div className="text-muted small">
                {aarf?.it_manager_acknowledged
                  ? `Acknowledged on ${new Date(aarf.it_manager_acknowledged_at).toLocaleDateString('en-MY')}`
                  : 'Pending IT Manager review'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 text-muted small">
        <i className="bi bi-building me-1"></i>Claritas Asia Sdn. Bhd. · Employee Portal · {new Date().getFullYear()}
      </div>
    </div>
  );
}
