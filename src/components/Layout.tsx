import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isHrOrAbove, isItOrAbove, canAddOnboarding, canEditAllOnboarding, canAddAsset } from '../lib/auth';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || '';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <h5><i className="bi bi-building me-2"></i>Claritas Asia</h5>
          <small>Employee Portal</small>
        </div>
        <nav className="sidebar-nav">
          {isHrOrAbove(role) && (
            <>
              <div className="sidebar-section">HR</div>
              <NavLink to="/hr/dashboard" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-grid-1x2"></i>Dashboard</NavLink>
              <NavLink to="/onboarding" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-person-plus"></i>Onboarding</NavLink>
            </>
          )}
          {isItOrAbove(role) && (
            <>
              <div className="sidebar-section">IT</div>
              <NavLink to="/it/dashboard" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-grid-1x2"></i>Dashboard</NavLink>
              <NavLink to="/assets" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-laptop"></i>Assets</NavLink>
              <NavLink to="/it/aarfs" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-file-earmark-check"></i>AARFs</NavLink>
            </>
          )}
          {!isHrOrAbove(role) && !isItOrAbove(role) && (
            <>
              <div className="sidebar-section">Main</div>
              <NavLink to="/dashboard" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-grid-1x2"></i>Dashboard</NavLink>
            </>
          )}
          <div className="sidebar-section">Account</div>
          <NavLink to="/profile" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-person-circle"></i>Profile</NavLink>
          <NavLink to="/account" className={({isActive})=>`nav-link${isActive?' active':''}`}><i className="bi bi-gear"></i>Account</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-uname">{user?.name}</div>
              <span className="sidebar-role">{(user?.role || '').replace(/_/g, ' ')}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link btn btn-link w-100 text-start" style={{color:'rgba(255,255,255,.7)',textDecoration:'none'}}>
            <i className="bi bi-box-arrow-left"></i>Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <h6 className="mb-0 fw-bold">{title}</h6>
          <span className="text-muted small">
            {new Date().toLocaleDateString('en-MY', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </span>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
