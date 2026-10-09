import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFileUploader,
  validatePdf,
  MAX_FILE_BYTES,
} from '../server/files.js';
import { createApp } from '../server/app.js';
import { createSqliteStore } from '../server/sqlite.js';
import { publicPortfolio } from '../src/data/visibility.js';
import { seed, validPortfolio } from '../server/validation.js';
const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF').toString(
  'base64',
);
test('PDF validation rejects other formats, corrupted and oversized files', () => {
  assert.equal(validatePdf(pdf), true);
  for (const value of [
    '',
    null,
    pdf + '!',
    Buffer.from('<html>test</html>').toString('base64'),
    Buffer.from('%PDF-1.4 without end marker').toString('base64'),
    Buffer.alloc(MAX_FILE_BYTES + 1).toString('base64'),
  ])
    assert.equal(validatePdf(value), false);
});
test('PDF uploader uses server credentials and unique public object URL', async () => {
  const upload = createFileUploader({
    url: 'https://test.supabase.co',
    key: 'server-secret',
    fetchImpl: async (url, options) => {
      assert.match(
        url.pathname,
        /^\/storage\/v1\/object\/portfolio-files\/[\w-]+\.pdf$/,
      );
      assert.equal(options.headers.apikey, 'server-secret');
      assert.equal(options.headers['Content-Type'], 'application/pdf');
      assert.equal(options.body.toString('base64'), pdf);
      return new Response('{}');
    },
  });
  const first = await upload(pdf),
    second = await upload(pdf);
  assert.match(
    first.url,
    /^https:\/\/test.supabase.co\/storage\/v1\/object\/public\/portfolio-files\//,
  );
  assert.notEqual(first.url, second.url);
  assert.ok(!JSON.stringify(first).includes('server-secret'));
});
test('file route requires admin, validates payload, and public API excludes hidden content', async () => {
  const store = createSqliteStore(':memory:');
  const draft = structuredClone(seed);
  draft.profile.photo = 'https://i.ibb.co/test/profile.png';
  for (const key of [
    'projects',
    'services',
    'skills',
    'experience',
    'certificates',
  ])
    draft[key][0].hidden = true;
  assert.ok(validPortfolio(draft));
  const invalid = structuredClone(draft);
  invalid.projects[0].hidden = 'false';
  assert.equal(validPortfolio(invalid), false);
  store.savePortfolio(draft);
  let uploads = 0;
  const { app } = createApp({
    store,
    adminToken: 'admin-test',
    uploadFile: async () => {
      uploads++;
      return { url: 'https://test.supabase.co/cv.pdf' };
    },
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, authorized = true) =>
    fetch(`${base}/api/admin/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorized ? { Authorization: 'Bearer admin-test' } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal((await post({ file: pdf }, false)).status, 401);
    assert.equal((await post({ file: 'bad' })).status, 400);
    assert.equal((await post({ file: pdf })).status, 201);
    assert.equal(uploads, 1);
    const published = await (await fetch(`${base}/api/portfolio`)).json();
    const admin = await (
      await fetch(`${base}/api/admin`, {
        headers: { Authorization: 'Bearer admin-test' },
      })
    ).json();
    for (const key of [
      'projects',
      'services',
      'skills',
      'experience',
      'certificates',
    ]) {
      assert.equal(published[key].length, draft[key].length - 1);
      assert.equal(admin.portfolio[key][0].hidden, true);
    }
    assert.equal(publicPortfolio(draft).profile.photo, draft.profile.photo);
    assert.equal(draft.projects[0].hidden, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.db.close();
  }
});

test('saving editor draft without uploaded profile photo accepts null and preserves fallback', () => {
  const draft = structuredClone(seed);
  draft.profile.photo = null;
  for (const key of [
    'projects',
    'services',
    'skills',
    'experience',
    'certificates',
  ])
    draft[key][0].hidden = true;
  assert.equal(validPortfolio(draft), true);
  draft.profile.photo = 'javascript:alert(1)';
  assert.equal(validPortfolio(draft), false);
  draft.profile.photo = 'https://i.ibb.co/test/profile.png';
  assert.equal(validPortfolio(draft), true);
});
