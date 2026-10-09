import { createApp } from './app.js';
import { createSupabaseBackend } from './supabase.js';

export async function createConfiguredApp() {
  if (process.env.BACKEND === 'supabase' || process.env.VERCEL === '1') {
    const backend = createSupabaseBackend();
    return createApp({ ...backend, vercel: process.env.VERCEL === '1' });
  }
  if (process.env.BACKEND && process.env.BACKEND !== 'sqlite')
    throw new Error('BACKEND must be sqlite or supabase.');
  const { createSqliteStore } = await import('./sqlite.js');
  return createApp({
    store: createSqliteStore(
      process.env.DB_PATH || './server/data/portfolio.sqlite',
    ),
    adminToken: process.env.ADMIN_TOKEN || '',
  });
}
