import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types/database'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isHr: boolean
  isIt: boolean
  isSuperadmin: boolean
  isEmployee: boolean
  canAddOnboarding: boolean
  canEditOnboarding: boolean
  canEditAllOnboarding: boolean
  canAddAsset: boolean
  canEditAsset: boolean
  canEditAllAsset: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, name, work_email: email, role: 'employee', is_active: true,
      })
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const role = profile?.role ?? 'employee'
  const isHr = ['hr_manager','hr_executive','hr_intern'].includes(role)
  const isIt = ['it_manager','it_executive','it_intern'].includes(role)
  const isSuperadmin = role === 'superadmin'
  const isSystemAdmin = role === 'system_admin'
  const isEmployee = role === 'employee'
  const isHrOrAbove = isHr || isSuperadmin || isSystemAdmin
  const isItOrAbove = isIt || isSuperadmin

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signIn, signUp, signOut,
      isHr, isIt, isSuperadmin, isEmployee,
      canAddOnboarding: ['hr_manager','hr_executive','superadmin','system_admin'].includes(role),
      canEditOnboarding: ['hr_manager','hr_executive','superadmin','system_admin'].includes(role),
      canEditAllOnboarding: ['hr_manager','superadmin'].includes(role),
      canAddAsset: ['it_manager','it_executive','superadmin','system_admin'].includes(role),
      canEditAsset: ['it_manager','it_executive','superadmin'].includes(role),
      canEditAllAsset: ['it_manager','superadmin'].includes(role),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
