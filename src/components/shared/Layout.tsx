import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Layout() {
  const { profile, signOut, isHr, isIt, isSuperadmin } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role ?? ''
  const isHrOrAbove = isHr || isSuperadmin || role === 'system_admin'
  const isItOrAbove = isIt || isSuperadmin

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-brand">
          <h5><i className="bi bi-building me-2" />Claritas Asia</h5>
          <small>Employee Portal</small>
        </div>
        <nav className="sidebar-nav">
          {isHrOrAbove && (
            <>
              <div className="sidebar-section">HR</div>
              <NavLink to="/hr/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-grid-1x2" />Dashboard
              </NavLink>
              <NavLink to="/onboarding" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-person-plus" />Onboarding
              </NavLink>
            </>
          )}
          {isItOrAbove && (
            <>
              <div className="sidebar-section">IT</div>
              <NavLink to="/it/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-grid-1x2" />Dashboard
              </NavLink>
              <NavLink to="/assets" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-laptop" />Assets
              </NavLink>
              <NavLink to="/it/aarfs" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-file-earmark-check" />AARFs
              </NavLink>
            </>
          )}
          {!isHrOrAbove && !isItOrAbove && (
            <>
              <div className="sidebar-section">Main</div>
              <NavLink to="/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="bi bi-grid-1x2" />Dashboard
              </NavLink>
            </>
          )}
          <div className="sidebar-section">Account</div>
          <NavLink to="/profile" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
            <i className="bi bi-person-circle" />Profile
          </NavLink>
          <NavLink to="/account" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
            <i className="bi bi-gear" />Account
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(profile?.name ?? 'U')[0].toUpperCase()}</div>
            <div style={{overflow:'hidden',flex:1}}>
              <div className="uname">{profile?.name}</div>
              <span className="role-badge">{role.replace(/_/g,' ')}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link btn btn-link w-100 text-start border-0" style={{color:'rgba(255,255,255,.7)'}}>
            <i className="bi bi-box-arrow-left" />Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <h6 className="mb-0 fw-bold text-dark">Employee Portal</h6>
          <span className="text-muted small">{new Date().toLocaleDateString('en-MY',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </>
  )
}
