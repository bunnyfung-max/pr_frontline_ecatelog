import test from 'node:test';
import assert from 'node:assert/strict';
import robots from '../src/app/robots';

test('robots.txt blocks every crawler from the whole site', () => {
  const rules = robots().rules;
  assert.ok(Array.isArray(rules));
  assert.ok(rules.length > 1);
  for (const rule of rules) {
    assert.equal(rule.disallow, '/');
  }
  assert.equal(robots().sitemap, undefined);
});
