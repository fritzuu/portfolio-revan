import { createHmac } from 'node:crypto';

export function createSupabaseBackend({
  url = process.env.SUPABASE_URL,
  publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY,
  secretKey = process.env.SUPABASE_SECRET_KEY,
  adminUserId = process.env.SUPABASE_ADMIN_USER_ID,
  fetchImpl = fetch,
} = {}) {
  url = url?.trim();
  publishableKey = publishableKey?.trim();
  secretKey = secretKey?.trim();
  adminUserId = adminUserId?.trim();
  const missing = Object.entries({
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SECRET_KEY: secretKey,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw Object.assign(new Error(`Set ${missing.join(', ')}.`), {
      code: 'BACKEND_MISSING_ENV',
      variables: missing,
    });
  }
  let origin;
  try {
    origin = new URL(url);
  } catch {
    /* Report only the variable name, never its value. */
  }
  if (
    !origin ||
    origin.protocol !== 'https:' ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash ||
    origin.username ||
    origin.password
  ) {
    throw Object.assign(
      new Error('SUPABASE_URL must be an HTTPS project origin.'),
      { code: 'BACKEND_INVALID_CONFIG', variables: ['SUPABASE_URL'] },
    );
  }
  if (
    adminUserId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      adminUserId,
    )
  ) {
    throw Object.assign(
      new Error(
        'SUPABASE_ADMIN_USER_ID must be the UUID from Authentication > Users.',
      ),
      { code: 'BACKEND_INVALID_CONFIG', variables: ['SUPABASE_ADMIN_USER_ID'] },
    );
  }
  async function request(
    endpoint,
    { method = 'GET', body, token, auth = false, prefer } = {},
  ) {
    let response;
    try {
      response = await fetchImpl(new URL(endpoint, origin), {
        method,
        headers: {
          apikey: auth ? publishableKey : secretKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
          ...(prefer ? { Prefer: prefer } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw Object.assign(new Error('Supabase is unavailable.'), {
        status: 503,
      });
    }
    if (!response.ok) {
      // Never propagate upstream response bodies: they can include private data.
      if (auth && [400, 401, 403, 422].includes(response.status)) return null;
      throw Object.assign(new Error('Supabase request failed.'), {
        status: 503,
      });
    }
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw Object.assign(new Error('Invalid Supabase response.'), {
        status: 503,
      });
    }
  }
  const store = {
    async getPortfolio() {
      const rows = await request('/rest/v1/content?id=eq.1&select=data');
      if (!rows?.[0]?.data)
        throw Object.assign(new Error('Portfolio seed missing.'), {
          status: 503,
        });
      return rows[0].data;
    },
    async savePortfolio(data) {
      const rows = await request('/rest/v1/content?id=eq.1', {
        method: 'PATCH',
        body: { data },
        prefer: 'return=representation',
      });
      if (!rows?.length)
        throw Object.assign(new Error('Portfolio seed missing.'), {
          status: 503,
        });
    },
    getGuestbook: (admin = false) =>
      request(
        admin
          ? '/rest/v1/guestbook?select=*&order=id.desc&limit=100'
          : '/rest/v1/guestbook?approved=eq.true&select=id,name,message,created_at&order=id.desc&limit=50',
      ),
    getMessages: () =>
      request('/rest/v1/messages?select=*&order=id.desc&limit=100'),
    addGuestbook: (body) =>
      request('/rest/v1/guestbook', { method: 'POST', body }),
    addMessage: (body) =>
      request('/rest/v1/messages', { method: 'POST', body }),
    async moderate(id, approved) {
      const rows = await request(
        `/rest/v1/guestbook?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: { approved },
          prefer: 'return=representation',
        },
      );
      return Boolean(rows?.length);
    },
  };
  const cloud = {
    async consumeLimit(ip, category, max) {
      const key = createHmac('sha256', secretKey)
        .update(`${category}:${ip}`)
        .digest('hex');
      return (
        (await request('/rest/v1/rpc/consume_rate_limit', {
          method: 'POST',
          body: { p_key: key, p_limit: max },
        })) === true
      );
    },
    async isAdmin(token) {
      if (!adminUserId) return false;
      const user = await request('/auth/v1/user', { token, auth: true });
      return user?.id === adminUserId;
    },
    async login(email, password) {
      if (!adminUserId) return null;
      const session = await request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        auth: true,
        body: { email, password },
      });
      if (
        !session?.access_token ||
        !(await cloud.isAdmin(session.access_token))
      )
        return null;
      // The browser keeps only the short-lived access token in memory.
      return {
        access_token: session.access_token,
        expires_in: session.expires_in,
      };
    },
    logout: (token) =>
      request('/auth/v1/logout?scope=local', {
        method: 'POST',
        auth: true,
        token,
      }),
  };
  return { store, cloud };
}
