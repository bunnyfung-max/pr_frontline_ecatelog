import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FrontlineBrowser } from '../src/components/frontline-browser';
import { initialCatalog } from '../src/lib/seed';
import type { Catalog } from '../src/lib/types';

function render(data: Catalog, folderId?: string) {
  return renderToStaticMarkup(
    createElement(FrontlineBrowser, {
      data,
      folder: data.folders.find((f) => f.id === folderId),
      query: '',
      onSearch: () => {},
      navigate: () => {},
      open: () => {},
    }),
  );
}

test('homepage uses the same five folder cards, retains search and names, and counts active scenes', () => {
  const html = render(initialCatalog(true));
  assert.equal((html.match(/class="directory-entry folder-tile"/g) || []).length, 5);
  assert.equal((html.match(/class="folder-tile-icon" aria-hidden="true"/g) || []).length, 5);
  assert.ok(html.includes('搜尋全部銷售資料'));
  assert.ok(html.includes('<span class="folder-tile-alias">New Housing</span>'));
  assert.ok(html.includes('<strong>場景推介</strong><small>0 個資料夾 · 6 項內容</small>'));
  for (const name of ['POP 展示', 'TMF', '創造家'])
    assert.ok(html.includes(`<strong>${name}</strong>`));
});

test('root counts include direct published contents and active scene entries only', () => {
  const data = initialCatalog(true);
  const c = data.contents[0];
  data.contents.push({ ...c, id: 'root-published', folderId: 'pop' });
  data.contents.push({ ...c, id: 'root-draft', folderId: 'pop', status: 'draft' });
  data.contents.push({ ...c, id: 'root-archived', folderId: 'pop', status: 'archived' });
  data.scenes[0].active = false;
  const html = render(data);
  assert.ok(html.includes('<strong>POP 展示</strong><small>4 個資料夾 · 1 項內容</small>'));
  assert.ok(html.includes('<strong>場景推介</strong><small>0 個資料夾 · 5 項內容</small>'));
});

test('folder browsing renders three labelled cards with live immediate-child counts', () => {
  const data = initialCatalog(true);
  const html = render(data, 'housing');
  assert.equal((html.match(/class="directory-entry folder-tile"/g) || []).length, 3);
  for (const name of ['私樓', '公居屋', '簡易房']) {
    assert.ok(html.includes(`<strong>${name}</strong><small>3 個資料夾 · 0 項內容</small>`));
  }
  assert.equal((html.match(/class="folder-tile-icon" aria-hidden="true"/g) || []).length, 3);
});

test('folder content counts exclude drafts, archived items and deeper descendants', () => {
  const data = initialCatalog(true);
  const content = data.contents[0];
  data.contents = [
    { ...content, id: 'published', folderId: 'private', status: 'published' },
    { ...content, id: 'draft', folderId: 'private', status: 'draft' },
    { ...content, id: 'archived', folderId: 'private', status: 'archived' },
    { ...content, id: 'descendant', folderId: 'unit-a', status: 'published' },
  ];
  assert.ok(
    render(data, 'housing').includes('<strong>私樓</strong><small>3 個資料夾 · 1 項內容</small>'),
  );
});
