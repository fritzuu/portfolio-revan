import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseBackend } from '../server/supabase.js';

const config = {
  url: 'https://testing.supabase.co',
  publishableKey: 'public-test',
  secretKey: 'private-test',
  adminUserId: '',
};
test('missing configuration reports names only', () => {
  assert.throws(
    () => createSupabaseBackend({ ...config, url: '', secretKey: '' }),
    (error) => {
      assert.equal(error.code, 'BACKEND_MISSING_ENV');
      assert.deepEqual(error.variables, [
        'SUPABASE_URL',
        'SUPABASE_SECRET_KEY',
      ]);
      assert.ok(!JSON.stringify(error).includes('private-test'));
      return true;
    },
  );
});
test('invalid URL and admin UUID have safe diagnostics', () => {
  for (const [field, variable] of [
    ['url', 'SUPABASE_URL'],
    ['adminUserId', 'SUPABASE_ADMIN_USER_ID'],
  ]) {
    assert.throws(
      () =>
        createSupabaseBackend({
          ...config,
          [field]: 'sensitive-invalid-value',
        }),
      (error) => {
        assert.equal(error.code, 'BACKEND_INVALID_CONFIG');
        assert.deepEqual(error.variables, [variable]);
        assert.ok(!error.message.includes('sensitive-invalid-value'));
        return true;
      },
    );
  }
});
test('copied configuration tolerates surrounding whitespace', () => {
  assert.doesNotThrow(() =>
    createSupabaseBackend({
      ...config,
      url: ` ${config.url}\n`,
      adminUserId: '  ',
    }),
  );
});
