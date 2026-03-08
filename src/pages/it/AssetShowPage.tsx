import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import DetailSection from '../../components/shared/DetailSection'

export default function AssetShowPage() {
  const { id } = useParams(); const { canEditAsset } = useAuth()
  const [asset, setAsset] = useState<any>(null)
  useEffect(()=>{ supabase.from('asset_inventories').select('*,employees(full_name)').eq('id',id).single().then(({data})=>setAsset(data)) },[id])
  if (!asset) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
  const fmt = (d:any) => d ? new Date(d).toLocaleDateString('en-MY') : '—'
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <nav aria-label="breadcrumb"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/assets">Assets</Link></li><li className="breadcrumb-item active">{asset.asset_tag}</li></ol></nav>
        {canEditAsset && <Link to={`/assets/${id}/edit`} className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}}><i className="bi bi-pencil me-1"/>Edit</Link>}
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <DetailSection title="Basic Info" icon="bi-tag" rows={[['Tag',asset.asset_tag],['Name',asset.asset_name],['Type',asset.asset_type],['Brand',asset.brand],['Model',asset.model],['Serial',asset.serial_number],['Status',asset.status],['Condition',asset.asset_condition]]}/>
        </div>
        <div className="col-md-6">
          <DetailSection title="Specifications" icon="bi-cpu" rows={[['Processor',asset.processor],['RAM',asset.ram_size],['Storage',asset.storage],['OS',asset.operating_system],['Screen',asset.screen_size],['Other',asset.spec_others]]}/>
          <DetailSection title="Procurement & Assignment" icon="bi-receipt" rows={[['Purchase Date',fmt(asset.purchase_date)],['Vendor',asset.purchase_vendor],['Cost',asset.purchase_cost?`RM ${asset.purchase_cost}`:null],['Warranty Expiry',fmt(asset.warranty_expiry_date)],['Assigned To',asset.employees?.full_name],['Assigned Date',fmt(asset.asset_assigned_date)],['Maintenance',asset.maintenance_status?.replace(/_/g,' ')],['Notes',asset.notes]]}/>
        </div>
      </div>
    </>
  )
}