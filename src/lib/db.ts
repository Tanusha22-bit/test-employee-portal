// Bolt Database client
// bolt.new auto-injects the database URL via import.meta.env.VITE_BOLT_DB_URL
// All queries go through this single client

const DB_URL = import.meta.env.VITE_BOLT_DB_URL || '';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
  const res = await fetch(`${DB_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Database query failed');
  }
  return res.json();
}

export const db = { query };
export default db;
