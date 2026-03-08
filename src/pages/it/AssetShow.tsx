
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAsset } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { canEditAsset } from '../../lib/auth';

export default function AssetShow() {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAsset(Number(id)).then(d=>setAsset(d.asset)).finally(()=>setLoading(false)); }, [id]);
  if(loading) return <Layout title="Asset"><div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"/></div></Layout>;
  if(!asset) return <Layout title="Asset"><div className="alert alert-danger">Not found.</div></Layout>;
  function Row({l,v}:{l:string,v:any}){if(!v)return null;return <div className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>;}
  return (
    <Layout title="Asset Detail">
      <div className="d-flex justify-content-between mb-3">
        <nav aria-label="breadcrumb"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/assets">Assets</Link></li><li className="breadcrumb-item active">{asset.asset_tag}</li></ol></nav>
        {canEditAsset(user?.role||'') && <Link to={"/assets/"+id+"/edit"} className="btn btn-primary btn-sm"><i className="bi bi-pencil me-1"></i>Edit</Link>}
      </div>
      <div className="row g-3">
        <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3">Basic Info</h6><Row l="Tag" v={asset.asset_tag}/><Row l="Name" v={asset.asset_name}/><Row l="Type" v={asset.asset_type}/><Row l="Brand" v={asset.brand}/><Row l="Model" v={asset.model}/><Row l="Serial" v={asset.serial_number}/><Row l="Status" v={asset.status}/><Row l="Condition" v={asset.asset_condition}/></div></div>
        <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3">Specifications</h6><Row l="Processor" v={asset.processor}/><Row l="RAM" v={asset.ram_size}/><Row l="Storage" v={asset.storage}/><Row l="OS" v={asset.operating_system}/><Row l="Screen" v={asset.screen_size}/>{!asset.processor&&!asset.ram_size&&<p className="text-muted small">No specs recorded.</p>}</div></div>
        <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3">Procurement</h6><Row l="Purchase Date" v={asset.purchase_date&&new Date(asset.purchase_date).toLocaleDateString('en-MY')}/><Row l="Vendor" v={asset.purchase_vendor}/><Row l="Cost" v={asset.purchase_cost&&'RM '+asset.purchase_cost}/><Row l="Warranty Expiry" v={asset.warranty_expiry_date&&new Date(asset.warranty_expiry_date).toLocaleDateString('en-MY')}/></div></div>
        <div className="col-md-6"><div className="bg-white border rounded-3 p-4"><h6 className="fw-bold mb-3">Assignment</h6><Row l="Assigned To" v={asset.employees?.full_name}/><Row l="Assigned Date" v={asset.asset_assigned_date&&new Date(asset.asset_assigned_date).toLocaleDateString('en-MY')}/><Row l="Maintenance" v={asset.maintenance_status?.replace(/_/g,' ')}/><Row l="Notes" v={asset.notes}/></div></div>
      </div>
    </Layout>
  );
}
