import test from 'node:test';
import assert from 'node:assert/strict';
import { switchedContentUrl } from '../src/lib/catalog-navigation';

test('switching content keeps the original directory, search, and mode for returning', () => {
  const url = new URL(switchedContentUrl('?folder=housing&q=sofa&cms=1&content=old', 'new'), 'https://example.test');
  assert.equal(url.searchParams.get('folder'), 'housing');
  assert.equal(url.searchParams.get('q'), 'sofa');
  assert.equal(url.searchParams.get('cms'), '1');
  assert.deepEqual(url.searchParams.getAll('content'), ['new']);
});

test('switching content from the home page does not navigate to another folder', () => {
  const url = new URL(switchedContentUrl('?content=old', 'unit 2'), 'https://example.test');
  assert.equal(url.searchParams.has('folder'), false);
  assert.equal(url.searchParams.get('content'), 'unit 2');
});
