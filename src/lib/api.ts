// All API calls go through Bolt Database Edge Functions
// Edge function URL: import.meta.env.VITE_EDGE_URL

const BASE = import.meta.env.VITE_EDGE_URL || '';

function getAuthHeader(): Record<string, string> {
  const user = localStorage.getItem('ep_user');
  if (!user) return {};
  const parsed = JSON.parse(user);
  // We send user ID in header; edge function validates session
  return { 'X-User-Id': String(parsed.id), 'X-User-Role': parsed.role };
}

async function req(method: string, path: string, body?: any): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get:    (path: string)              => req('GET',    path),
  post:   (path: string, body: any)   => req('POST',   path, body),
  put:    (path: string, body: any)   => req('PUT',    path, body),
  delete: (path: string)              => req('DELETE', path),
};

// ── Typed API methods ─────────────────────────────────────────────────────────

// Dashboard stats
export const getHrStats  = () => api.get('/stats/hr');
export const getItStats  = () => api.get('/stats/it');

// Users
export const getHrUsers  = () => api.get('/users?role=hr');
export const getItUsers  = () => api.get('/users?role=it');
export const getAllEmployees = () => api.get('/employees/list');

// Onboardings
export const getOnboardings  = (params?: Record<string,string>) => api.get('/onboardings' + (params ? '?' + new URLSearchParams(params) : ''));
export const getOnboarding   = (id: number)     => api.get(`/onboardings/${id}`);
export const createOnboarding = (body: any)     => api.post('/onboardings', body);
export const updateOnboarding = (id: number, body: any) => api.put(`/onboardings/${id}`, body);

// Assets
export const getAssets       = (params?: Record<string,string>) => api.get('/assets' + (params ? '?' + new URLSearchParams(params) : ''));
export const getAsset        = (id: number)     => api.get(`/assets/${id}`);
export const createAsset     = (body: any)      => api.post('/assets', body);
export const updateAsset     = (id: number, body: any) => api.put(`/assets/${id}`, body);
export const getAvailableAssets = () => api.get('/assets?status=available');

// AARFs
export const getAarfs        = () => api.get('/aarfs');
export const getAarf         = (id: number)  => api.get(`/aarfs/${id}`);
export const updateAarfNotes = (id: number, notes: string) => api.put(`/aarfs/${id}/notes`, { it_notes: notes });
export const itAcknowledgeAarf = (id: number, remarks: string) => api.post(`/aarfs/${id}/it-acknowledge`, { it_manager_remarks: remarks });
export const updateAarfAssets  = (id: number, asset_ids: number[], assigned_date: string) => api.put(`/aarfs/${id}/assets`, { asset_ids, assigned_date });

// Public AARF (no auth)
export const getPublicAarf   = (token: string) => fetch(`${BASE}/public/aarf/${token}`).then(r => r.json());
export const acknowledgeAarf = (token: string) => fetch(`${BASE}/public/aarf/${token}/acknowledge`, { method: 'POST' }).then(r => r.json());

// Profile
export const getProfile      = () => api.get('/profile');
export const updateBiodata   = (body: any) => api.put('/profile/biodata', body);
export const updateWorkInfo  = (body: any) => api.put('/profile/work', body);
