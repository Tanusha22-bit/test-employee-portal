interface Props { title: string; icon: string; rows: [string, any][] }
export default function DetailSection({ title, icon, rows }: Props) {
  return (
    <div className="section-card overflow-hidden mb-3">
      <div className="section-header-bar"><i className={`bi ${icon} me-2`}/>{title}</div>
      <div className="p-4">
        {rows.filter(([,v])=>v!=null&&v!=='').map(([l,v])=>(
          <div key={l} className="detail-row"><span className="detail-label">{l}</span><span className="detail-value">{String(v)}</span></div>
        ))}
      </div>
    </div>
  )
}