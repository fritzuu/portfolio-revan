import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createSupabaseBackend } from '../server/supabase.js';
import { seed } from '../server/validation.js';

const adminId = '01234567-89ab-cdef-0123-456789abcdef';
function backend(fetchImpl, extra = {}) {
  return createSupabaseBackend({
    url: 'https://testing.supabase.co',
    publishableKey: 'sb_publishable_test',
    secretKey: 'sb_secret_test',
    adminUserId: adminId,
    fetchImpl,
    ...extra,
  });
}
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
async function serve(config) {
  const { app } = createApp(config);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  return {
    request: async (path, { method = 'GET', body, token } = {}) => {
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}${path}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        },
      );
      return {
        status: response.status,
        body: await response.json(),
        cache: response.headers.get('cache-control'),
      };
    },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('cloud admin verifies tokens remotely and rejects ordinary users and absent allowlist', async () => {
  const calls = [];
  const { cloud } = backend(async (url, options) => {
    calls.push({ url, options });
    return json({
      id:
        options.headers.Authorization === 'Bearer admin-access'
          ? adminId
          : 'ordinary-user',
    });
  });
  assert.equal(await cloud.isAdmin('ordinary-access'), false);
  assert.equal(await cloud.isAdmin('admin-access'), true);
  assert.equal(calls[1].options.headers.apikey, 'sb_publishable_test');
  const disabled = backend(
    () => {
      throw new Error('Should not call upstream');
    },
    { adminUserId: '' },
  );
  assert.equal(await disabled.cloud.isAdmin('any-token'), false);
});

test('password login returns only the allowed admin access token, without refresh tokens or keys', async () => {
  const { cloud } = backend(async (url) =>
    String(url).includes('/token?')
      ? json({
          access_token: 'verified-access',
          refresh_token: 'private-refresh',
          expires_in: 3600,
        })
      : json({ id: adminId }),
  );
  assert.deepEqual(await cloud.login('admin@example.com', 'test-password'), {
    access_token: 'verified-access',
    expires_in: 3600,
  });
  const denied = backend(async (url) =>
    String(url).includes('/token?')
      ? json({ access_token: 'ordinary-access', expires_in: 3600 })
      : json({ id: 'ordinary-user' }),
  );
  assert.equal(
    await denied.cloud.login('visitor@example.com', 'password'),
    null,
  );
});

test('Supabase rate limit hashes visitor IP and uses shared atomic RPC, failing closed on outage', async () => {
  const calls = [];
  const { cloud } = backend(async (url, options) => {
    calls.push({ url, options });
    return json(false);
  });
  assert.equal(await cloud.consumeLimit('203.0.113.4', 'submission', 5), false);
  const body = JSON.parse(calls[0].options.body);
  assert.match(body.p_key, /^[a-f0-9]{64}$/);
  assert.equal(body.p_limit, 5);
  assert.equal(calls[0].options.body.includes('203.0.113.4'), false);
  const unavailable = backend(async () => {
    throw new Error('network');
  });
  await assert.rejects(unavailable.cloud.consumeLimit('ip', 'submission', 5), {
    status: 503,
  });
});

test('cloud routes preserve contact privacy, moderation filters, admin authorization and no-store caching', async () => {
  const calls = [];
  const config = backend(async (url, options) => {
    const parsed = new URL(url);
    calls.push({ path: parsed.pathname, query: parsed.search, options });
    if (parsed.pathname.endsWith('/consume_rate_limit')) return json(true);
    if (parsed.pathname === '/auth/v1/user')
      return json({
        id:
          options.headers.Authorization === 'Bearer admin-access'
            ? adminId
            : 'ordinary-user',
      });
    if (parsed.pathname.endsWith('/content')) return json([{ data: seed }]);
    if (parsed.pathname.endsWith('/messages') && options.method === 'POST')
      return new Response(null, { status: 201 });
    if (parsed.pathname.endsWith('/messages'))
      return json([
        {
          name: 'Private sender',
          email: 'private@example.com',
          message: 'Private message.',
        },
      ]);
    return json([]);
  });
  const { request, close } = await serve(config);
  try {
    const portfolio = await request('/api/portfolio');
    assert.equal(portfolio.status, 200);
    assert.equal(portfolio.cache, 'no-store');
    assert.equal((await request('/api/admin')).status, 401);
    assert.equal(
      (await request('/api/admin', { token: 'ordinary-access' })).status,
      401,
    );
    assert.equal(
      (await request('/api/admin', { token: 'admin-access' })).body.messages[0]
        .email,
      'private@example.com',
    );
    const publicGuestbook = await request('/api/guestbook');
    assert.deepEqual(publicGuestbook.body, []);
    assert.ok(calls.some((call) => call.query.includes('approved=eq.true')));
    assert.equal((await request('/api/messages')).status, 404);
    assert.equal(
      (
        await request('/api/contact', {
          method: 'POST',
          body: {
            name: 'Traveler',
            email: 'test@example.com',
            message: 'Private testing message.',
          },
        })
      ).status,
      201,
    );
    assert.equal(
      (
        await request('/api/contact', {
          method: 'POST',
          body: {
            name: 'Traveler',
            email: 'test@example.com',
            message: 'Private testing message.',
            website: 'spam',
          },
        })
      ).status,
      400,
    );
    const unsafe = structuredClone(seed);
    unsafe.projects[0].demoLink = 'javascript:alert(1)';
    assert.equal(
      (
        await request('/api/admin/portfolio', {
          method: 'PUT',
          token: 'admin-access',
          body: unsafe,
        })
      ).status,
      400,
    );
  } finally {
    await close();
  }
});

test('upstream failures do not reveal secrets or database responses to visitors', async () => {
  const config = backend(async () =>
    json(
      { error: 'sb_secret_test private@example.com internal database details' },
      500,
    ),
  );
  const { request, close } = await serve(config);
  try {
    const result = await request('/api/portfolio');
    assert.equal(result.status, 503);
    assert.equal(JSON.stringify(result.body).includes('sb_secret'), false);
    assert.equal(
      JSON.stringify(result.body).includes('private@example.com'),
      false,
    );
    assert.equal(
      (
        await request('/api/contact', {
          method: 'POST',
          body: {
            name: 'Traveler',
            email: 'test@example.com',
            message: 'Should never be saved.',
          },
        })
      ).status,
      503,
    );
  } finally {
    await close();
  }
});

test('cloud limiter returns 429 before storing contact when quota is exhausted', async () => {
  const config = backend(async (url) => {
    assert.ok(String(url).includes('/consume_rate_limit'));
    return json(false);
  });
  const { request, close } = await serve(config);
  try {
    assert.equal(
      (
        await request('/api/contact', {
          method: 'POST',
          body: {
            name: 'Traveler',
            email: 'test@example.com',
            message: 'Blocked by shared limiter.',
          },
        })
      ).status,
      429,
    );
  } finally {
    await close();
  }
});
