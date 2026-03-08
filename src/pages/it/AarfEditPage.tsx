import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AarfEditPage() {
  const { id } = useParams(); const navigate = useNavigate()
  const [notes, setNotes] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(()=>{ supabase.from('aarfs').select('it_notes,acknowledged,it_manager_acknowledged').eq('id',id).single().then(({data})=>{ if (data?.acknowledged||data?.it_manager_acknowledged){navigate(`/it/aarfs/${id}`);return}; setNotes(data?.it_notes||'') }) },[id])
  const save = async () => { setSaving(true); await supabase.from('aarfs').update({it_notes:notes||null}).eq('id',id); navigate(`/it/aarfs/${id}`) }
  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3"><ol className="breadcrumb mb-0"><li className="breadcrumb-item"><Link to="/it/aarfs">AARFs</Link></li><li className="breadcrumb-item"><Link to={`/it/aarfs/${id}`}>#{id}</Link></li><li className="breadcrumb-item active">Edit Notes</li></ol></nav>
      <div className="bg-white border rounded-3 p-4">
        <h6 className="fw-bold mb-3">IT Notes</h6>
        <textarea className="form-control mb-3" rows={5} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Enter IT notes for this AARF..."/>
        <div className="d-flex gap-2 justify-content-end">
          <Link to={`/it/aarfs/${id}`} className="btn btn-outline-secondary">Cancel</Link>
          <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',border:'none'}} onClick={save} disabled={saving}>
            {saving?<span className="spinner-border spinner-border-sm me-2"/>:<i className="bi bi-check-circle me-2"/>}Save Notes
          </button>
        </div>
      </div>
    </>
  )
}