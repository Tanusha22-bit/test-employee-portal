import db from './db';

export interface User {
  id: number;
  name: string;
  work_email: string;
  role: string;
  is_active: boolean;
}

// ── Role helpers ──────────────────────────────────────────────────────────────
export const isHr          = (r: string) => ['hr_manager','hr_executive','hr_intern'].includes(r);
export const isIt          = (r: string) => ['it_manager','it_executive','it_intern'].includes(r);
export const isSuperadmin  = (r: string) => r === 'superadmin';
export const isSystemAdmin = (r: string) => r === 'system_admin';
export const isEmployee    = (r: string) => r === 'employee';
export const isHrOrAbove   = (r: string) => isHr(r) || isSuperadmin(r) || isSystemAdmin(r);
export const isItOrAbove   = (r: string) => isIt(r) || isSuperadmin(r);
export const canAddOnboarding    = (r: string) => ['hr_manager','hr_executive','superadmin','system_admin'].includes(r);
export const canEditOnboarding   = (r: string) => ['hr_manager','hr_executive','superadmin','system_admin'].includes(r);
export const canEditAllOnboarding = (r: string) => ['hr_manager','superadmin'].includes(r);
export const canAddAsset    = (r: string) => ['it_manager','it_executive','superadmin','system_admin'].includes(r);
export const canEditAsset   = (r: string) => ['it_manager','it_executive','superadmin'].includes(r);
export const canEditAllAsset = (r: string) => ['it_manager','superadmin'].includes(r);
export const canItAcknowledge = (r: string) => ['it_manager','superadmin'].includes(r);

export function dashboardFor(role: string): string {
  if (isHrOrAbove(role)) return '/hr/dashboard';
  if (isItOrAbove(role)) return '/it/dashboard';
  return '/dashboard';
}

// ── Simple bcrypt-compatible hash check via API ───────────────────────────────
// Since we're in a browser, we call a tiny Deno Edge Function for password ops
// OR we store a simple sha256 for demo. For production, use Bolt Edge Functions.
// For bolt.new demo: we compare using a server-side edge function.

const EDGE_URL = import.meta.env.VITE_EDGE_URL || '';

export async function loginUser(work_email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch(`${EDGE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function registerUser(name: string, work_email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch(`${EDGE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, work_email, password }),
    });
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function sendPasswordReset(work_email: string): Promise<boolean> {
  try {
    const res = await fetch(`${EDGE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_email }),
    });
    return res.ok;
  } catch { return false; }
}

// Session stored in localStorage
export function saveSession(user: User): void {
  localStorage.setItem('ep_user', JSON.stringify(user));
}

export function loadSession(): User | null {
  try {
    const raw = localStorage.getItem('ep_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession(): void {
  localStorage.removeItem('ep_user');
}
