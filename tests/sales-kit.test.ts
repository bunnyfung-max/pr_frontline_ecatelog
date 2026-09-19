import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import { schemas } from '../src/lib/validation';
import {
  kitFiles,
  kitComplete,
  setKitSlot,
  moveKitExtra,
  readerAssets,
  readerLeaves,
  readerSpread,
  previousReaderPage,
} from '../src/lib/sales-kit';

const base = initialCatalog(true).contents.find((item) => item.id === 'kit-a')!;
const images = ['asset:plan.png', 'asset:render.jpg', 'asset:list1.webp', 'asset:list2.png', ''];
const kit = { ...base, salesKit: true, files: images };

test('kit slots retain roles when uploaded out of order, replaced or cleared', () => {
  let files = kitFiles([]);
  for (const i of [3, 1, 0, 2]) files = setKitSlot(files, i, images[i]);
  assert.deepEqual(files, images);
  assert.equal(kitComplete(files), true);
  files = setKitSlot(files, 1, '');
  assert.equal(kitComplete(files), true);
  assert.equal(files[2], images[2]);
  files = setKitSlot(files, 0, '');
  assert.equal(kitComplete(files), false);
  assert.deepEqual(setKitSlot(files, 0, images[0]), [
    images[0],
    '',
    images[2],
    images[3],
    images[4],
  ]);
});

test('extras reorder only behind the five reserved image positions', () => {
  const files = [...images, 'asset:a.pdf', 'asset:b.mp4'];
  assert.deepEqual(moveKitExtra(files, 5, -1), files);
  assert.deepEqual(moveKitExtra(files, 4, 1), files);
  assert.deepEqual(moveKitExtra(files, 5, 1), [...images, 'asset:b.mp4', 'asset:a.pdf']);
  assert.deepEqual(files, [...images, 'asset:a.pdf', 'asset:b.mp4']);
});

test('incomplete kit can be drafted, but publishing requires floor plan only', () => {
  assert.equal(
    schemas.content.safeParse({ ...kit, status: 'draft', files: kitFiles([]) }).success,
    true,
  );
  assert.equal(
    schemas.content.safeParse({ ...kit, files: setKitSlot(images, 0, '') }).success,
    false,
  );
  for (let i = 1; i < 4; i++)
    assert.equal(
      schemas.content.safeParse({ ...kit, files: setKitSlot(images, i, '') }).success,
      true,
    );
  assert.equal(schemas.content.safeParse(kit).success, true);
  assert.equal(
    schemas.content.safeParse({ ...kit, files: [images[0], '', '', '', ''] }).success,
    true,
  );
});

test('fixed slots are images; extras support PDF/video and reject unsafe or empty refs', () => {
  assert.equal(
    schemas.content.safeParse({
      ...kit,
      files: [...images, 'asset:a.pdf', 'asset:b.webm', 'asset:c.png'],
    }).success,
    true,
  );
  for (let i = 0; i < 5; i++)
    assert.equal(
      schemas.content.safeParse({ ...kit, files: setKitSlot(images, i, 'asset:a.pdf') }).success,
      false,
    );
  for (const file of ['', 'asset:../a.pdf', 'asset:script.html', 'https://evil.example/a.png'])
    assert.equal(schemas.content.safeParse({ ...kit, files: [...images, file] }).success, false);
  assert.equal(schemas.content.safeParse({ ...kit, type: 'pdf' }).success, false);
  assert.equal(
    schemas.content.safeParse({ ...kit, files: [...images, ...Array(35).fill('asset:a.pdf')] })
      .success,
    true,
  );
  assert.equal(
    schemas.content.safeParse({ ...kit, files: [...images, ...Array(36).fill('asset:a.pdf')] })
      .success,
    false,
  );
});

test('legacy kits and ordinary image, PDF, video and link content keep their original format', () => {
  const legacy = {
    ...base,
    salesKit: false,
    files: ['/demo/sales-kit-floorplan.svg'],
    cover: '',
  };
  assert.equal(schemas.content.safeParse(legacy).success, true);
  assert.deepEqual(
    readerAssets(legacy).map((a) => a.ref),
    legacy.files,
  );
  assert.deepEqual(kitFiles(legacy.files).slice(0, legacy.files.length), legacy.files);
  assert.equal(
    schemas.content.safeParse({ ...legacy, files: [...legacy.files, 'asset:extra.pdf'] }).success,
    false,
  );
  for (const [type, file] of [
    ['pdf', 'asset:a.pdf'],
    ['video', 'asset:a.mp4'],
    ['link', 'https://example.com'],
  ])
    assert.equal(schemas.content.safeParse({ ...legacy, type, files: [file] }).success, true);
});

const mixed = () =>
  readerLeaves(
    readerAssets({ ...kit, files: [...images, 'asset:a.pdf', 'asset:b.webm', 'asset:tail.png'] }),
    { 'asset:a.pdf': 3 },
  );
test('reader skips empty optional slot and expands every PDF page at its saved position', () => {
  const leaves = mixed();
  assert.deepEqual(
    leaves.map((p) => [p.ref, p.pdfPage]),
    [
      ...images.slice(0, 4).map((ref) => [ref, undefined]),
      ...[1, 2, 3].map((n) => ['asset:a.pdf', n]),
      ['asset:b.webm', undefined],
      ['asset:tail.png', undefined],
    ],
  );
  assert.deepEqual(
    leaves.slice(0, 4).map((p) => p.label),
    ['平面圖 Floor Plan', '效果圖', '產品列表（一）', '產品列表（二）'],
  );
});

test('landscape pairs image/PDF pages, video stands alone, next/back never skips pages', () => {
  const leaves = mixed();
  const starts = [1, 3, 5, 7, 8, 9];
  assert.deepEqual(
    starts.map((p) => readerSpread(leaves, p, true)),
    [[1, 2], [3, 4], [5, 6], [7], [8], [9]],
  );
  for (let i = 1; i < starts.length; i++)
    assert.equal(previousReaderPage(leaves, starts[i], true), starts[i - 1]);
  assert.deepEqual(readerSpread(leaves, 7, false), [7]);
  assert.deepEqual(readerSpread(leaves, 2, true), [2, 3]);
  assert.equal(previousReaderPage(leaves, 3, false), 2);
  assert.deepEqual(readerSpread([], 1, true), []);
});

test('failed PDF keeps its position without blocking access to later attachments', () => {
  const leaves = readerLeaves(
    readerAssets({ ...kit, files: [...images, 'asset:bad.pdf', 'asset:tail.png'] }),
    {},
  );
  assert.equal(leaves[4].failed, true);
  assert.deepEqual(readerSpread(leaves, 5, true), [5]);
  assert.equal(leaves[5].ref, 'asset:tail.png');
});
