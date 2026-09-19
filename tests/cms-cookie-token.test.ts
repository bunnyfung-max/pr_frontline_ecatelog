import test from 'node:test';
import assert from 'node:assert/strict';
import { createCmsUnlockToken, verifyCmsUnlockToken } from '../src/lib/cms-cookie-token';

const secret = 'test-secret';

test('cms unlock token verifies and expires', () => {
  const token = createCmsUnlockToken('admin@example.com', 'admin', secret, 1_000_000);
  assert.deepEqual(verifyCmsUnlockToken(token, secret, 1_000_000), {
    email: 'admin@example.com',
    role: 'admin',
  });
  assert.equal(verifyCmsUnlockToken(token, secret, 1_000_000 + 8 * 60 * 60 * 1000 + 1), null);
  assert.equal(verifyCmsUnlockToken(token, 'wrong-secret', 1_000_000), null);
});
