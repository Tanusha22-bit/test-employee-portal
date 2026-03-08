import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import Layout from './components/shared/Layout'
import HrDashboard from './pages/hr/HrDashboard'
import OnboardingListPage from './pages/hr/OnboardingListPage'
import OnboardingShowPage from './pages/hr/OnboardingShowPage'
import OnboardingEditPage from './pages/hr/OnboardingEditPage'
import HrAarfView from './pages/hr/HrAarfView'
import ItDashboard from './pages/it/ItDashboard'
import AssetsPage from './pages/it/AssetsPage'
import AssetShowPage from './pages/it/AssetShowPage'
import AssetEditPage from './pages/it/AssetEditPage'
import AarfListPage from './pages/it/AarfListPage'
import AarfShowPage from './pages/it/AarfShowPage'
import AarfEditPage from './pages/it/AarfEditPage'
import AarfAssetsPage from './pages/it/AarfAssetsPage'
import UserDashboard from './pages/user/UserDashboard'
import ProfilePage from './pages/user/ProfilePage'
import AccountPage from './pages/user/AccountPage'
import AarfPublicView from './pages/AarfPublicView'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height:'100vh'}}><div className="spinner-border text-primary"/></div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

function RequireGuest({ children }: { children: JSX.Element }) {
  const { session, loading, profile } = useAuth()
  if (loading) return null
  if (session && profile) {
    const role = profile.role
    if (['hr_manager','hr_executive','hr_intern','superadmin','system_admin'].includes(role)) return <Navigate to="/hr/dashboard" replace />
    if (['it_manager','it_executive','it_intern'].includes(role)) return <Navigate to="/it/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
      <Route path="/forgot-password" element={<RequireGuest><ForgotPasswordPage /></RequireGuest>} />
      <Route path="/reset-password" element={<RequireGuest><ResetPasswordPage /></RequireGuest>} />
      <Route path="/aarf/:token" element={<AarfPublicView />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/hr/dashboard" element={<HrDashboard />} />
        <Route path="/onboarding" element={<OnboardingListPage />} />
        <Route path="/onboarding/:id" element={<OnboardingShowPage />} />
        <Route path="/onboarding/:id/edit" element={<OnboardingEditPage />} />
        <Route path="/hr/aarf/:id" element={<HrAarfView />} />
        <Route path="/it/dashboard" element={<ItDashboard />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetShowPage />} />
        <Route path="/assets/:id/edit" element={<AssetEditPage />} />
        <Route path="/it/aarfs" element={<AarfListPage />} />
        <Route path="/it/aarfs/:id" element={<AarfShowPage />} />
        <Route path="/it/aarfs/:id/edit" element={<AarfEditPage />} />
        <Route path="/it/aarfs/:id/assets" element={<AarfAssetsPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
