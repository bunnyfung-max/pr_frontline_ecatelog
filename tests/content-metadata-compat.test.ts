import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import { schemas } from '../src/lib/validation';

test('photo and product metadata survive validation together without changing legacy tags', () => {
  const original = initialCatalog(true).contents.find((content) => content.id === 'kit-a')!;
  const photo = original.files[1];
  const edited = { ...original, photoRefs: [photo], productTags: ['沙發'], tags: ['客廳', '三房'] };
  const saved = schemas.content.parse(edited);
  const reopened = schemas.content.parse(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(reopened.photoRefs, [photo]);
  assert.deepEqual(reopened.productTags, ['沙發']);
  assert.deepEqual(reopened.tags, ['客廳', '三房']);
  assert.equal(schemas.content.safeParse({ ...edited, photoRefs: ['asset:other/old.jpg'] }).success, false);
  const legacy = { ...original };
  delete legacy.photoRefs;
  delete legacy.productTags;
  assert.equal(schemas.content.safeParse(legacy).success, true);
});
