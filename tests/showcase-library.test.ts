import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShowcaseLibrary, type LibraryRequest } from '../src/components/showcase-sheets';
import { initialCatalog } from '../src/lib/seed';
import type { Catalog } from '../src/lib/types';

function render(data: Catalog, request: LibraryRequest) {
  return renderToStaticMarkup(createElement(ShowcaseLibrary, {
    data, request, onClose: () => {}, onNavigate: () => {}, onOpen: () => {}, onScope: () => {},
  }));
}

test('a restored directory opens at its previous child and search text', () => {
  const request: LibraryRequest = { mode: 'directory', folderId: 'housing' };
  const html = renderToStaticMarkup(createElement(ShowcaseLibrary, {
    data: initialCatalog(true), request,
    initialView: { request, childId: 'public', directoryQuery: 'Type A', scopeQuery: '', selectedValue: '', searchInput: '' },
    onClose: () => {}, onNavigate: () => {}, onOpen: () => {}, onScope: () => {},
  }));
  assert.match(html, /value="Type A"/);
  assert.match(html, /Type A/);
  assert.doesNotMatch(html, /Type B1/);
});

test('directory dialog includes root and descendant publications while retaining all folder tabs', () => {
  const data = initialCatalog(true);
  const template = data.contents.find((item) => item.id === 'kit-a')!;
  data.contents.push(
    { ...template, id: 'root-guide', folderId: 'housing', name: '主目錄指南' },
    { ...template, id: 'root-draft', folderId: 'housing', name: '未發布指南', status: 'draft' },
  );
  const html = render(data, { mode: 'directory', folderId: 'housing' });
  assert.match(html, /主目錄指南/);
  assert.match(html, /小空間，大可能/);
  assert.doesNotMatch(html, /未發布指南/);
  assert.match(html, /私人屋苑/);
  assert.match(html, /公居屋/);
  assert.match(html, /簡約公屋/);
  assert.match(html, /case-card directory-card/);
});

test('scene directory retains configured links and disabled unconfigured scenes', () => {
  const data = initialCatalog(true);
  data.scenes[0].url = 'https://www.pricerite.com.hk/scene-example';
  data.scenes[1].url = '';
  data.scenes[2].active = false;
  const html = render(data, { mode: 'directory', folderId: 'scenes' });
  assert.match(html, /href="https:\/\/www\.pricerite\.com\.hk\/scene-example"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /連結待設定/);
  assert.ok(!html.includes(data.scenes[2].name));
});

test('modal search keeps folder-only and active-scene results as well as content matches', () => {
  const data = initialCatalog(true);
  data.folders.push({ id: 'qa-folder', name: '共享查詢', parentId: 'pop', subtitle: '', order: 90 });
  data.scenes[0] = { ...data.scenes[0], name: '共享查詢場景', url: 'https://www.pricerite.com.hk/scene-example', active: true };
  const template = data.contents.find((item) => item.id === 'kit-a')!;
  data.contents.push({ ...template, id: 'qa-content', name: '共享查詢展示' });
  const html = render(data, { mode: 'search', query: '共享查詢' });
  assert.match(html, /共享查詢展示/);
  assert.match(html, /aria-label="相關目錄"/);
  assert.match(html, /共享查詢場景/);
  assert.match(html, /mark class="search-hit"/);
});

test('estate browsing retains real folder names without requiring the words 屋苑 or 屋邨', () => {
  const data = initialCatalog(true);
  data.folders.find((folder) => folder.id === 'estate-a')!.name = '海景中心';
  const html = render(data, { mode: 'scope', scope: 'estate' });
  assert.match(html, /海景中心/);
  assert.match(html, /id="scope-search"/);
  assert.doesNotMatch(html, /Weekly Eposter/);
  assert.doesNotMatch(html, /門市推廣與最新/);
  assert.doesNotMatch(html, /<span>450–550 呎/);
  assert.doesNotMatch(html, /示例資料 · 非真實屋苑/);
});

test('estate browsing recognises a real-named estate beneath an area but excludes the area and other business lines', () => {
  const data = initialCatalog(true);
  data.folders.push({ id: 'district', name: '九龍', parentId: 'private', subtitle: '地域說明', order: 1 });
  data.folders.push({ id: 'actual-estate', name: '海景中心', parentId: 'district', subtitle: '樓盤說明', order: 1 });
  data.folders.push({ id: 'root-estate', name: '新城廣場', parentId: 'housing', subtitle: '', order: 2 });
  const template = data.contents.find((item) => item.id === 'kit-a')!;
  data.contents.push({ ...template, id: 'in-estate', name: '實例配置', folderId: 'actual-estate' });
  data.contents.push({ ...template, id: 'in-root-estate', name: '另一配置', folderId: 'root-estate' });
  const html = render(data, { mode: 'scope', scope: 'estate' });
  assert.match(html, /海景中心/);
  assert.match(html, /新城廣場/);
  assert.doesNotMatch(html, /<span>九龍<\/span>/);
  assert.doesNotMatch(html, /樓盤說明/);
  assert.doesNotMatch(html, /Weekly Eposter/);
  assert.doesNotMatch(html, /讓日常，多一點舒適/);
});

test('global search results provide an editable search field in the dialog', () => {
  const html = render(initialCatalog(true), { mode: 'search', query: 'no such thing' });
  assert.match(html, /aria-label="修改搜尋關鍵字"/);
  assert.match(html, /value="no such thing"/);
  assert.match(html, /src="\/frontline\/figma\/empty-search\.png"/);
  assert.match(html, /沒有找到相符資料/);
});

test('an empty style category keeps its search and displays the original Figma illustration', () => {
  const data = initialCatalog(true);
  for (const product of data.products) product.style = '';
  for (const content of data.contents) content.tags = content.tags.filter((tag) => !/簡約|日式|北歐|現代|風格/.test(tag));
  const html = render(data, { mode: 'scope', scope: 'style' });
  assert.match(html, /暫未提供風格資料/);
  assert.match(html, /src="\/frontline\/figma\/empty-style\.svg"/);
  assert.match(html, /aria-label="搜尋風格"/);
});
