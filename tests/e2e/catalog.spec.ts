import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
test('five entry points, hierarchy and branch-scoped attribute search', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '想找甚麼銷售資料？' })).toBeVisible();
  await expect(page.locator('.directory-entry')).toHaveCount(5);
  await expect(page.locator('.sidebar, .hero, .tip-line, footer')).toHaveCount(0);
  await mkdir('qa', { recursive: true });
  await page.screenshot({ path: 'qa/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /新屋入伙.*New Housing.*個資料夾/ }).click();
  await page.getByRole('button', { name: /^私樓 \d+ 個資料夾/ }).click();
  await page.getByRole('button', { name: /^九龍 \d+ 個資料夾/ }).click();
  await page.getByRole('button', { name: /^示例屋苑 A \d+ 個資料夾/ }).click();
  await expect(page.getByRole('heading', { name: '示例屋苑 A', exact: true })).toBeVisible();
  await expect(page.locator('.search-bar .scope-tag')).toHaveCount(0);
  await page.getByRole('searchbox', { name: '搜尋此目錄' }).fill('米白色');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(page.getByRole('heading', { name: '小空間，大可能' })).toBeVisible();
  await expect(page.locator('.search-content-entry')).toHaveCount(1);
  await page.getByRole('searchbox', { name: '搜尋此目錄' }).fill('橡木');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(page.getByRole('heading', { name: '找不到相關內容' })).toBeVisible();
  await page.getByRole('searchbox', { name: '搜尋此目錄' }).fill('草稿');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('「草稿」找到 0 項結果');
  expect(errors).toEqual([]);
});
test('viewer rotates, retains page and panel state, odd final page is single', async ({ page }) => {
  await page.goto('/?folder=unit-a&content=kit-a');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.paper')).toHaveCount(2);
  await page.screenshot({ path: 'qa/viewer-landscape.png', fullPage: true });
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(page.locator('.paper')).toHaveCount(1);
  await expect(page.locator('.paper')).toHaveAttribute('data-page', '3');
  await page.getByRole('button', { name: '購物功能列', exact: true }).click();
  await expect(page.getByText('把靈感，帶回家。')).toBeVisible();
  await expect(page.locator('.paper')).toHaveAttribute('data-page', '3');
  await page.getByRole('button', { name: '上一頁' }).click();
  await page.screenshot({ path: 'qa/viewer-panel.png', fullPage: true });
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('.viewer')).toHaveClass(/portrait/);
  await expect(page.locator('.paper')).toHaveCount(1);
  await page.getByRole('button', { name: '收起購物功能列' }).click();
  await expect(page.locator('.paper')).toHaveAttribute('data-page', '1');
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(page.locator('.paper')).toHaveAttribute('data-page', '2');
  await page.screenshot({ path: 'qa/viewer-portrait.png', fullPage: true });
  await page.setViewportSize({ width: 1366, height: 1024 });
  await expect(page.locator('.paper').first()).toHaveAttribute('data-page', '2');
  await expect(page.locator('.paper')).toHaveCount(2);
  await page.getByRole('button', { name: '返回目錄' }).click();
  await expect(page).toHaveURL(/folder=unit-a$/);
});
test('CMS selects descendant destination, uploads, previews, publishes and unpublishes', async ({
  page,
}) => {
  const name = `QA 圖片 ${Date.now()}`;
  await page.goto('/?folder=estate-a&cms=1');
  await page.getByRole('button', { name: '上載內容' }).click();
  const destination = page.getByLabel('上載目的地', { exact: false });
  await expect(destination.locator('option')).toHaveCount(2);
  await destination.selectOption('unit-a');
  await page.getByLabel('顯示名稱', { exact: false }).fill(name);
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlVQAAAAASUVORK5CYII=',
    'base64',
  );
  for (const index of [4, 2, 1, 3]) {
    await page
      .getByLabel(new RegExp(`^上載第 ${index} 張：`))
      .setInputFiles({ name: 'qa.png', mimeType: 'image/png', buffer: png });
    await expect(
      page.getByRole('button', { name: new RegExp(`^移除第 ${index} 張：`) }),
    ).toBeEnabled();
  }
  await expect(page.getByRole('button', { name: '發布內容' })).toBeEnabled();
  await page.getByLabel('關鍵字', { exact: true }).fill('QA驗收');
  await page.getByRole('button', { name: '直向單頁', exact: true }).click();
  await expect(page.locator('.viewer .paper')).toHaveCount(1);
  await page.getByRole('button', { name: '返回目錄' }).click();
  await page.screenshot({ path: 'qa/cms-upload.png', fullPage: true });
  await page.getByRole('button', { name: '儲存草稿' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.goto('/?folder=unit-a');
  await expect(page.getByRole('heading', { name: '450–550 呎 / 2–3 人' })).toBeVisible();
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  await page.goto('/?folder=unit-a&cms=1');
  await page
    .getByRole('row')
    .filter({ hasText: name })
    .getByRole('button', { name: '編輯' })
    .click();
  await page.getByRole('button', { name: '發布內容' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.goto('/?folder=unit-a');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.goto('/?folder=unit-a&cms=1');
  await page
    .getByRole('row')
    .filter({ hasText: name })
    .getByRole('button', { name: '編輯' })
    .click();
  await page.getByRole('combobox', { name: '狀態', exact: true }).selectOption('archived');
  await page.getByRole('button', { name: '儲存並下架' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.goto('/?folder=unit-a');
  await expect(page.getByRole('heading', { name: '450–550 呎 / 2–3 人' })).toBeVisible();
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
});
test('API rejects cross-origin writes and sibling upload destinations', async ({ request }) => {
  const r = await request.get('/api/catalog?cms=1');
  const data = await r.json();
  const content = {
    ...data.contents.find((c: { id: string }) => c.id === 'kit-a'),
    id: `qa-invalid-${Date.now()}`,
    folderId: 'unit-b',
  };
  const noOrigin = await request.post('/api/save', {
    data: { entity: 'content', payload: content, originFolder: 'estate-a' },
  });
  expect(noOrigin.status()).toBe(403);
  const wrong = await request.post('/api/save', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    data: { entity: 'content', payload: content, originFolder: 'estate-a' },
  });
  expect(wrong.status()).toBe(400);
  const search = await request.get('/api/catalog?folder=estate-a&q=橡木');
  expect((await search.json()).contents).toEqual([]);
});
test('mobile and tablet layouts do not overflow; scenes show six configured entries', async ({
  page,
}) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.directory-entry')).toHaveCount(5);
    await expect(page.locator('.frontline')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `qa/home-${viewport.width}.png`, fullPage: true });
  }
  await page.goto('/?folder=scenes');
  await expect(page.locator('.directory-entry')).toHaveCount(6);
  await page.getByRole('searchbox', { name: '搜尋此目錄' }).fill('私樓');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(page.locator('.directory-entry')).toHaveCount(1);
});

test('homepage searches all roots, retains query after viewing; CMS remains available', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.directory-entry')).toHaveCount(5);
  const search = page.getByRole('searchbox', { name: '搜尋全部銷售資料' });
  await search.fill('米白色 梳化');
  await search.press('Enter');
  await expect(page.locator('.search-content-entry')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: '小空間，大可能' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '讓日常，多一點舒適' })).toBeVisible();
  await page.getByRole('button', { name: /小空間，大可能 開啟展示/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: '返回目錄', exact: true }).click();
  await expect(search).toHaveValue('米白色 梳化');
  await expect(page.locator('.search-content-entry')).toHaveCount(2);
  await page.getByRole('button', { name: '清除', exact: true }).click();
  await expect(page.locator('.directory-entry')).toHaveCount(5);
  await page.getByRole('button', { name: '內容管理', exact: true }).click();
  await expect(page.getByRole('heading', { name: '選擇管理目錄' })).toBeVisible();
  await expect(page.locator('.sidebar')).toBeVisible();
  await page.getByRole('button', { name: '返回展示', exact: true }).click();
  await expect(page.getByRole('heading', { name: '想找甚麼銷售資料？' })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
});

test('PDF uploads and renders two real canvas pages with an odd last page', async ({
  page,
  request,
}) => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>',
  ];
  for (let i = 0; i < 3; i++) {
    const stream = `0.8 0.85 0.7 rg 40 40 320 440 re f 0.2 0.3 0.2 rg 70 ${100 + i * 80} 260 50 re f`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 520] /Resources << >> /Contents ${4 + i * 2} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  }
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 9\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${String(n).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const uploaded = await request.post('/api/upload', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    multipart: { file: { name: 'qa.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf) } },
  });
  expect(uploaded.ok()).toBe(true);
  const { ref } = await uploaded.json();
  const id = `qa-pdf-${Date.now()}`;
  const saved = await request.post('/api/save', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    data: {
      entity: 'content',
      originFolder: 'unit-a',
      payload: {
        id,
        folderId: 'unit-a',
        name: 'QA PDF',
        type: 'pdf',
        files: [ref],
        fileName: 'qa.pdf',
        cover: '',
        keywords: 'QA驗收',
        productIds: [],
        status: 'published',
        order: 99,
        updatedAt: '',
      },
    },
  });
  expect(saved.ok()).toBe(true);
  await page.goto(`/?folder=unit-a&content=${id}`);
  await expect(page.locator('.paper canvas')).toHaveCount(2);
  await expect(page.locator('.paper canvas').first()).toHaveAttribute('width', '640');
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(page.locator('.paper canvas')).toHaveCount(1);
  await expect(page.locator('.paper')).toHaveAttribute('data-page', '3');
  await page.screenshot({ path: 'qa/pdf-last-page.png', fullPage: true });
});

test.afterAll(async ({ request }) => {
  const response = await request.get('/api/catalog?cms=1');
  const data = await response.json();
  // Archive only this suite's explicit QA fixtures; preserve seed and user entries.
  for (const c of data.contents.filter(
    (c: { keywords: string; fileName: string; status: string }) =>
      c.keywords === 'QA驗收' &&
      ['qa.png', 'qa.pdf'].includes(c.fileName) &&
      c.status !== 'archived',
  )) {
    await request.post('/api/save', {
      headers: { Origin: 'http://127.0.0.1:3000' },
      data: {
        entity: 'content',
        originFolder: c.folderId,
        expectedVersion: c.updatedAt,
        payload: { ...c, status: 'archived' },
      },
    });
  }
});
