import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createSqliteStore } from '../server/sqlite.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function setup(dbPath = ':memory:', token = 'test-admin-secret') {
  const { app, db } = createApp({
    store: createSqliteStore(dbPath),
    adminToken: token,
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (url, method = 'GET', body, admin = false) => {
    const res = await fetch(base + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(admin ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: await res.json() };
  };
  const close = async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  };
  return { request, close };
}
test('guestbook moderation keeps pending entries private and supports hiding', async () => {
  const { request, close } = await setup();
  try {
    assert.equal(
      (
        await request('/api/guestbook', 'POST', {
          name: 'Traveler',
          message: 'Hello from the village!',
        })
      ).status,
      201,
    );
    assert.deepEqual((await request('/api/guestbook')).body, []);
    assert.equal((await request('/api/admin')).status, 401);
    const admin = await request('/api/admin', 'GET', null, true);
    assert.equal(admin.body.guestbook.length, 1);
    const id = admin.body.guestbook[0].id;
    assert.equal(
      (
        await request(
          `/api/admin/guestbook/${id}`,
          'PATCH',
          { approved: true },
          true,
        )
      ).status,
      200,
    );
    assert.equal((await request('/api/guestbook')).body.length, 1);
    await request(
      `/api/admin/guestbook/${id}`,
      'PATCH',
      { approved: false },
      true,
    );
    assert.deepEqual((await request('/api/guestbook')).body, []);
  } finally {
    await close();
  }
});
test('contact is validated, persisted privately, and rate limited', async () => {
  const { request, close } = await setup();
  try {
    assert.equal(
      (
        await request('/api/contact', 'POST', {
          name: 'A',
          email: 'bad',
          message: 'short',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request('/api/contact', 'POST', {
          name: 'Traveler',
          email: 'test@example.com',
          message: 'Let us build a pixel world.',
        })
      ).status,
      201,
    );
    assert.equal(
      (await request('/api/admin', 'GET', null, true)).body.messages.length,
      1,
    );
    assert.equal((await request('/api/messages')).status, 404);
    for (let i = 0; i < 3; i++)
      await request('/api/guestbook', 'POST', {
        name: 'Traveler',
        message: 'Hello!',
        website: 'spam',
      });
    assert.equal(
      (
        await request('/api/contact', 'POST', {
          name: 'Traveler',
          email: 'test@example.com',
          message: 'Let us build a pixel world.',
        })
      ).status,
      429,
    );
  } finally {
    await close();
  }
});
test('content edits require authentication and reject unsafe links', async () => {
  const { request, close } = await setup();
  try {
    const original = (await request('/api/portfolio')).body;
    assert.equal(original.projects.length, 3);
    const edited = structuredClone(original);
    edited.profile.bio = 'An updated biography from the admin dashboard.';
    assert.equal(
      (await request('/api/admin/portfolio', 'PUT', edited)).status,
      401,
    );
    assert.equal(
      (await request('/api/admin/portfolio', 'PUT', edited, true)).status,
      200,
    );
    assert.equal(
      (await request('/api/portfolio')).body.profile.bio,
      edited.profile.bio,
    );
    edited.projects[0].demoLink = 'javascript:alert(1)';
    assert.equal(
      (await request('/api/admin/portfolio', 'PUT', edited, true)).status,
      400,
    );
    assert.equal(
      (await request('/api/admin/portfolio', 'PUT', { profile: {} }, true))
        .status,
      400,
    );
    assert.equal(
      (await request('/api/portfolio')).body.projects[0].demoLink,
      original.projects[0].demoLink,
    );
  } finally {
    await close();
  }
});
test('SQLite survives application restart', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'revan-api-')),
    dbPath = path.join(dir, 'test.sqlite');
  let setup1 = await setup(dbPath);
  try {
    await setup1.request('/api/contact', 'POST', {
      name: 'Persistent visitor',
      email: 'test@example.com',
      message: 'This message must survive a restart.',
    });
    await setup1.close();
    setup1 = null;
    const setup2 = await setup(dbPath);
    try {
      assert.equal(
        (await setup2.request('/api/admin', 'GET', null, true)).body.messages[0]
          .name,
        'Persistent visitor',
      );
    } finally {
      await setup2.close();
    }
  } finally {
    if (setup1) await setup1.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test('admin remains disabled without configured token', async () => {
  const { request, close } = await setup(':memory:', '');
  try {
    assert.equal((await request('/api/admin', 'GET', null, true)).status, 401);
  } finally {
    await close();
  }
});
