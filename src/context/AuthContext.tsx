import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, loadSession, saveSession, clearSession } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, setUser: () => {}, logout: () => {}, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = loadSession();
    if (u) setUserState(u);
    setLoading(false);
  }, []);

  function setUser(u: User | null) {
    setUserState(u);
    if (u) saveSession(u); else clearSession();
  }

  function logout() {
    clearSession();
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
