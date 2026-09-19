// Local-demo integration check. Creates ONE archived synthetic fixture, never edits existing entries.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'http://127.0.0.1:3000';
const headers = { Origin: base, 'Content-Type': 'application/json' };
const session = await (await fetch(`${base}/api/session`)).json();
assert.equal(session.session?.demo, true, 'This check is only for local demo mode');
const before = await (await fetch(`${base}/api/catalog?cms=1`)).json();
const id = `qa-kit-order-${Date.now()}`;
async function save(payload, expectedVersion, status = 200) {
  const response = await fetch(`${base}/api/save`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ entity: 'content', payload, originFolder: 'unit-a', expectedVersion }),
  });
  const body = await response.json();
  assert.equal(response.status, status, JSON.stringify(body));
  return body.value;
}
async function upload(name, mime, bytes) {
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), name);
  const response = await fetch(`${base}/api/upload`, {
    method: 'POST',
    headers: { Origin: base },
    body: form,
  });
  assert.equal(response.status, 200);
  const { ref } = await response.json();
  const asset = await fetch(`${base}/api/asset?ref=${encodeURIComponent(ref)}`);
  assert.equal(asset.status, 200);
  assert.equal(asset.headers.get('content-type'), mime);
  assert.equal((await asset.arrayBuffer()).byteLength, bytes.length);
  return ref;
}
// A tiny, valid, one-frame VP8/WebM video synthesized locally (no third-party media).
function ebml(id, payload) {
  const length = payload.length;
  let size;
  if (length < 127) size = Buffer.from([0x80 | length]);
  else if (length < 16383) size = Buffer.from([0x40 | (length >> 8), length & 255]);
  else size = Buffer.from([0x20 | (length >> 16), (length >> 8) & 255, length & 255]);
  return Buffer.concat([Buffer.from(id, 'hex'), size, payload]);
}
const uint = (hex) => Buffer.from(hex, 'hex');
const webp = await sharp({
  create: { width: 320, height: 180, channels: 3, background: '#c45c26' },
})
  .webp({ quality: 80 })
  .toBuffer();
let frame;
for (let offset = 12; offset < webp.length;) {
  const length = webp.readUInt32LE(offset + 4);
  if (webp.toString('ascii', offset, offset + 4) === 'VP8 ')
    frame = webp.subarray(offset + 8, offset + 8 + length);
  offset += 8 + length + (length % 2);
}
assert.ok(frame);
const duration = Buffer.alloc(8);
duration.writeDoubleBE(1000);
const video = Buffer.concat([
  ebml(
    '1a45dfa3',
    Buffer.concat([
      ebml('4286', uint('01')),
      ebml('42f7', uint('01')),
      ebml('42f2', uint('04')),
      ebml('42f3', uint('08')),
      ebml('4282', Buffer.from('webm')),
      ebml('4287', uint('02')),
      ebml('4285', uint('02')),
    ]),
  ),
  ebml(
    '18538067',
    Buffer.concat([
      ebml(
        '1549a966',
        Buffer.concat([
          ebml('2ad7b1', uint('0f4240')),
          ebml('4489', duration),
          ebml('4d80', Buffer.from('QA')),
          ebml('5741', Buffer.from('QA')),
        ]),
      ),
      ebml(
        '1654ae6b',
        ebml(
          'ae',
          Buffer.concat([
            ebml('d7', uint('01')),
            ebml('73c5', uint('01')),
            ebml('83', uint('01')),
            ebml('86', Buffer.from('V_VP8')),
            ebml('23e383', uint('3b9aca00')),
            ebml('e0', Buffer.concat([ebml('b0', uint('0140')), ebml('ba', uint('b4'))])),
          ]),
        ),
      ),
      ebml(
        '1f43b675',
        Buffer.concat([
          ebml('e7', uint('00')),
          ebml('a3', Buffer.concat([uint('81000080'), frame])),
        ]),
      ),
    ]),
  ),
]);
const imageRefs = [];
for (const [i, colour] of ['#e6d6aa', '#e9aa80', '#92bfa8', '#88aeca', '#bcabd1'].entries()) {
  const bytes = await sharp({
    create: { width: 400, height: 500, channels: 3, background: colour },
  })
    .png()
    .toBuffer();
  imageRefs.push(await upload(`slot-${i + 1}.png`, 'image/png', bytes));
}
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>',
];
for (let i = 0; i < 3; i++) {
  const stream = `0.${i + 2} 0.5 0.7 rg 20 20 360 460 re f\n`;
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 500] /Resources << >> /Contents ${4 + i * 2} 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
  );
}
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (const [i, object] of objects.entries()) {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
}
const xref = pdf.length;
pdf += `xref\n0 9\n0000000000 65535 f \n${offsets
  .slice(1)
  .map((n) => `${String(n).padStart(10, '0')} 00000 n \n`)
  .join('')}trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
const pdfRef = await upload('three-pages.pdf', 'application/pdf', Buffer.from(pdf));
const videoRef = await upload('one-second.webm', 'video/webm', video);
const payload = {
  id,
  name: `QA Sales Kit 排序 ${id}`,
  folderId: 'unit-a',
  type: 'image',
  salesKit: true,
  files: ['', '', '', '', ''],
  fileName: 'synthetic-sales-kit',
  cover: '',
  keywords: 'QA-KIT-ORDER',
  productIds: [],
  status: 'draft',
  order: 999,
  updatedAt: '',
};
let saved = await save(payload);
await save({ ...saved, status: 'published' }, saved.updatedAt, 400);
await save(
  { ...saved, salesKit: false, files: imageRefs, status: 'published' },
  saved.updatedAt,
  400,
);
saved = await save(
  {
    ...saved,
    files: [...imageRefs.slice(0, 4), '', pdfRef, videoRef, imageRefs[4]],
    status: 'published',
  },
  saved.updatedAt,
);
try {
  const publicData = await (await fetch(`${base}/api/catalog`)).json();
  assert.deepEqual(publicData.contents.find((c) => c.id === id).files, saved.files);
} finally {
  saved = await save({ ...saved, status: 'archived' }, saved.updatedAt);
}
const after = await (await fetch(`${base}/api/catalog?cms=1`)).json();
assert.deepEqual(
  after.contents.filter((c) => c.id !== id),
  before.contents,
  'Existing content must not change',
);
assert.equal(
  (await (await fetch(`${base}/api/catalog`)).json()).contents.some((c) => c.id === id),
  false,
);
await mkdir('qa', { recursive: true });
await writeFile(
  'qa/sales-kit-api-result.json',
  JSON.stringify({ id, files: saved.files, passed: true, status: saved.status }, null, 2),
);
console.log(
  JSON.stringify({
    id,
    passed: true,
    status: saved.status,
    checks:
      'image/PDF/video upload and retrieval; partial draft; incomplete publish rejected; no bypass; publish/archive roundtrip; exact order persisted; existing contents unchanged',
  }),
);
