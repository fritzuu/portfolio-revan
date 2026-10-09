import { seed } from '../server/validation.js';
const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY)
  throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY first.');
const response = await fetch(
  new URL('/rest/v1/content?on_conflict=id', SUPABASE_URL),
  {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: 1, data: seed }),
    signal: AbortSignal.timeout(10000),
  },
);
if (!response.ok)
  throw new Error(
    `Supabase seed failed (HTTP ${response.status}). Check schema.sql and server environment.`,
  );
console.log('Portfolio seed ready. Existing content preserved.');
