import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createSqliteStore } from '../server/sqlite.js';
import {
  createImageUploader,
  validateImage,
  MAX_IMAGE_BYTES,
} from '../server/images.js';

const image =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0XcAAAAASUVORK5CYII=';

test('image validation rejects URLs, SVG, malformed base64 and oversized files', () => {
  assert.equal(validateImage(image), true);
  for (const value of [
    null,
    '',
    'https://example.com/image.png',
    Buffer.from('<svg/>').toString('base64'),
    image + '!',
    'AAAA=',
  ])
    assert.equal(validateImage(value), false);
  const large = Buffer.alloc(MAX_IMAGE_BYTES + 1);
  Buffer.from(image, 'base64').copy(large);
  assert.equal(validateImage(large.toString('base64')), false);
});

test('ImgBB adapter keeps key in POST body and returns only trusted image URL', async () => {
  const upload = createImageUploader({
    key: 'test-key',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.imgbb.com/1/upload');
      assert.equal(options.method, 'POST');
      assert.equal(options.body.get('key'), 'test-key');
      assert.equal(options.body.get('image'), image);
      assert.equal(options.body.has('expiration'), false);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            url: 'https://i.ibb.co/test/image.png',
            delete_url: 'private-deletion-link',
          },
        }),
      );
    },
  });
  assert.deepEqual(await upload(image), {
    url: 'https://i.ibb.co/test/image.png',
  });
  assert.equal(createImageUploader({ key: '' }), null);
  const bad = createImageUploader({
    key: 'test-key',
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { url: 'https://evil.example/test.png' },
        }),
      ),
  });
  await assert.rejects(bad(image));
});

test('uploads require admin auth, validate files, conceal upstream errors and rate limit', async () => {
  let calls = 0;
  const store = createSqliteStore(':memory:');
  const { app } = createApp({
    store,
    adminToken: 'test-admin',
    uploadImage: async () => {
      calls++;
      if (calls === 2) throw new Error('secret upstream data');
      return { url: 'https://i.ibb.co/test/image.png' };
    },
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = (body, auth = true) =>
    fetch(`http://127.0.0.1:${server.address().port}/api/admin/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: 'Bearer test-admin' } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal((await request({ image }, false)).status, 401);
    assert.equal(calls, 0);
    assert.equal(
      (await request({ image: 'https://example.com/image.png' })).status,
      400,
    );
    const success = await request({ image });
    assert.equal(success.status, 201);
    assert.deepEqual(await success.json(), {
      url: 'https://i.ibb.co/test/image.png',
    });
    const failure = await request({ image });
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /secret/);
    assert.equal(
      (await request({ image: 'A'.repeat(3 * 1024 * 1024) })).status,
      413,
    );
    assert.equal((await request({ image })).status, 201);
    assert.equal((await request({ image })).status, 429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.db.close();
  }
});
