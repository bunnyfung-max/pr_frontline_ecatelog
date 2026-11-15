import { test, expect } from '@playwright/test';

test('changing page layout keeps next and previous navigation symmetric', async ({ page }) => {
  await page.goto('/?folder=unit-a&content=kit-a');
  const papers = page.locator('.viewer .paper');
  await expect(papers).toHaveCount(2);
  await page.getByRole('button', { name: '單頁', exact: true }).click();
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(papers).toHaveAttribute('data-page', '2');
  await page.getByRole('button', { name: '雙頁', exact: true }).click();
  await expect(papers.first()).toHaveAttribute('data-page', '2');
  await expect(papers.last()).toHaveAttribute('data-page', '3');
  await page.getByRole('button', { name: '下一頁' }).click();
  await expect(papers.first()).toHaveAttribute('data-page', '4');
  await page.getByRole('button', { name: '上一頁' }).click();
  await expect(papers.first()).toHaveAttribute('data-page', '2');
  await expect(papers.last()).toHaveAttribute('data-page', '3');
});

test('125 percent zoom scales the fitted page by 1.25', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto('/?folder=unit-a&content=kit-a');
  const firstPaper = page.locator('.viewer .paper').first();
  await expect(firstPaper).toBeVisible();
  await expect(page.locator('.viewer .reader-image-frame.is-loading')).toHaveCount(0);
  const before = await firstPaper.boundingBox();
  expect(before).not.toBeNull();
  await page.getByRole('button', { name: '放大', exact: true }).click();
  await expect(page.getByRole('button', { name: /目前縮放 125%/ })).toBeVisible();
  const after = await firstPaper.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.width / before!.width).toBeCloseTo(1.25, 1);
  expect(after!.height / before!.height).toBeCloseTo(1.25, 1);
});

test('thumbnail toggle exposes every page and can open a page beyond the sixth', async ({ page }) => {
  await page.route('**/api/catalog', async (route) => {
    const response = await route.fetch();
    const catalog = await response.json();
    const kit = catalog.contents.find((content: { id: string }) => content.id === 'kit-a');
    kit.files = [...kit.files, kit.files[0], kit.files[1], kit.files[2]];
    await route.fulfill({ response, json: catalog });
  });
  await page.goto('/?folder=unit-a&content=kit-a');
  await expect(page.locator('.viewer .housing-rail')).toHaveCount(0);
  await page.getByRole('button', { name: '顯示頁面縮圖' }).click();
  const rail = page.getByRole('complementary', { name: '頁面縮圖' });
  await expect(rail.getByRole('button')).toHaveCount(8);
  await rail.getByRole('button', { name: /第 8 頁/ }).click();
  await expect(page.locator('.viewer .paper')).toHaveAttribute('data-page', '8');
  await expect(rail.getByRole('button', { name: /第 8 頁/ })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: '收起頁面縮圖' }).click();
  await expect(rail).toHaveCount(0);
});

test('portrait reader keeps full plan, visible heading and usable product panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?folder=unit-a&content=kit-a');
  const heading = page.locator('.viewer h1');
  await expect(heading).toHaveText('小空間，大可能');
  await expect(heading).toBeVisible();
  await expect(page.locator('.viewer .paper')).toHaveCount(1);
  await expect(page.locator('.viewer .paper img.reader-media')).toHaveCSS('object-fit', 'contain');
  const fit = await page.locator('.viewer .housing-canvas').evaluate((element) => {
    const canvas = element.getBoundingClientRect();
    const paper = element.querySelector('.paper')!.getBoundingClientRect();
    return { within: paper.top >= canvas.top - 1 && paper.bottom <= canvas.bottom + 1 && paper.left >= canvas.left - 1 && paper.right <= canvas.right + 1, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  expect(fit).toEqual({ within: true, overflow: false });
  await page.getByRole('button', { name: '查看相關產品', exact: true }).click();
  await expect(page.getByRole('heading', { name: '相關產品及優惠' })).toBeVisible();
  await expect(heading).toBeVisible();
  await page.getByRole('button', { name: '收起相關產品' }).click();
  await expect(page.locator('.viewer .paper')).toBeVisible();
  await expect(page.getByRole('button', { name: '查看相關產品', exact: true })).toBeFocused();
});

test('single-product detail uses live prices, preserves purchase links and returns to its list', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const first = { url: 'https://www.pricerite.com.hk/zh/qa-sofa.html', title: '詳情測試梳化', brand: 'QA', sku: 'QA-001', description: '產品詳情測試與使用說明。'.repeat(100), image: '/demo/living.svg', fetchedAt: '' };
  const second = { ...first, url: 'https://www.pricerite.com.hk/zh/qa-table.html', title: '詳情測試茶几', sku: 'QA-002' };
  await page.route('**/api/catalog', async (route) => {
    const response = await route.fetch();
    const catalog = await response.json();
    const kit = catalog.contents.find((item: { id: string }) => item.id === 'kit-a');
    kit.eshopProducts = [first, second];
    kit.productIds = ['qa-detail-product'];
    catalog.products.push({ id: 'qa-detail-product', name: '目錄測試餐椅', code: 'QA-003', brand: 'QA', colour: '米白色', style: '簡約', keywords: '', image: '/demo/living.svg', url: 'https://example.com/eshop/chair', storeUrl: 'https://example.com/store/chair' });
    await route.fulfill({ response, json: catalog });
  });
  await page.route('**/api/eshop-product?*', async (route) => {
    await route.fulfill({ json: { products: [
      { ...first, price: 1299, priceLabel: 'HK$1,299', basePrice: 1599, specialPrice: 1299, available: true },
      { ...second, price: null, priceLabel: '', basePrice: null, specialPrice: null, available: false },
    ] } });
  });
  await page.goto('/?folder=unit-a&content=kit-a');
  await page.getByRole('button', { name: '查看相關產品', exact: true }).click();
  await page.getByRole('button', { name: `查看 ${first.title} 詳情`, exact: true }).click();
  const detail = page.getByRole('region', { name: '單件產品詳情' });
  await expect(detail.getByRole('heading', { name: first.title })).toBeVisible();
  await expect(detail.getByText('HK$1,299', { exact: true })).toBeVisible();
  await expect(detail.getByText('HK$1,599', { exact: true })).toBeVisible();
  await expect(detail.getByRole('link', { name: '前往 eShop' })).toHaveAttribute('href', first.url);
  const visibleActions = await detail.evaluate((element) => {
    const panel = element.closest('.shopping-panel')!.getBoundingClientRect();
    const link = element.querySelector('.purchase-links a')!.getBoundingClientRect();
    const pager = element.querySelector('.product-detail-pager')!.getBoundingClientRect();
    return { panel: { top: panel.top, bottom: panel.bottom }, link: { top: link.top, bottom: link.bottom }, pager: { top: pager.top, bottom: pager.bottom } };
  });
  expect(visibleActions.link.top).toBeGreaterThanOrEqual(visibleActions.panel.top);
  expect(visibleActions.link.bottom).toBeLessThanOrEqual(visibleActions.panel.bottom);
  expect(visibleActions.pager.top).toBeGreaterThanOrEqual(visibleActions.panel.top);
  expect(visibleActions.pager.bottom).toBeLessThanOrEqual(visibleActions.panel.bottom);
  await page.screenshot({ path: testInfo.outputPath('product-detail-long-description.png') });
  await detail.getByRole('button', { name: '下一件產品' }).click();
  await expect(detail.getByRole('heading', { name: second.title })).toBeVisible();
  await expect(detail.getByText('已下架或連結失效')).toBeVisible();
  await expect(detail.getByRole('link', { name: '前往 eShop' })).toHaveCount(0);
  await detail.getByRole('button', { name: '下一件產品' }).click();
  await expect(detail.getByText('價格以購物頁面為準')).toBeVisible();
  await expect(detail.getByRole('link', { name: '前往自在購' })).toHaveAttribute('href', 'https://example.com/store/chair');
  await expect(detail.getByRole('link', { name: '前往 eShop' })).toHaveAttribute('href', 'https://example.com/eshop/chair');
  await detail.getByRole('button', { name: '上一件產品' }).click();
  await expect(detail.getByRole('heading', { name: second.title })).toBeVisible();
  await detail.getByRole('button', { name: '返回產品列表' }).click();
  await expect(detail).toHaveCount(0);
  await expect(page.getByRole('button', { name: `查看 ${second.title} 詳情`, exact: true })).toBeFocused();
});

test('image enlargement fits the tablet viewport and zoomed images remain scrollable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?folder=unit-a&content=kit-a');
  await page.getByRole('button', { name: '放大檢視圖片' }).click();
  const dialog = page.getByRole('dialog', { name: '放大檢視圖片' });
  const canvas = dialog.locator('.housing-zoom-canvas');
  const image = canvas.locator('img');
  await expect(dialog).toBeVisible();
  await expect(image).toHaveCSS('object-fit', 'contain');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  const fit = await canvas.evaluate((el) => {
    const image = el.querySelector('img')!;
    const canvas = el.getBoundingClientRect();
    const picture = image.getBoundingClientRect();
    return { canvas: { width: canvas.width, height: canvas.height }, image: { width: picture.width, height: picture.height }, scroll: { width: el.scrollWidth, height: el.scrollHeight, clientWidth: el.clientWidth, clientHeight: el.clientHeight } };
  });
  expect(fit.image.width).toBeLessThanOrEqual(fit.canvas.width + 1);
  expect(fit.image.height).toBeLessThanOrEqual(fit.canvas.height + 1);
  expect(fit.scroll.width).toBeLessThanOrEqual(fit.scroll.clientWidth + 1);
  expect(fit.scroll.height).toBeLessThanOrEqual(fit.scroll.clientHeight + 1);
  await page.screenshot({ path: testInfo.outputPath('fit-100.png') });
  await expect(dialog.getByRole('button', { name: '縮小圖片' })).toBeDisabled();
  await dialog.getByRole('button', { name: '放大圖片', exact: true }).click();
  await expect(dialog.getByText('150%', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('zoom-150.png') });
  const zoomed = await canvas.evaluate((el) => {
    const image = el.querySelector('img')!.getBoundingClientRect();
    return { width: el.scrollWidth, height: el.scrollHeight, clientWidth: el.clientWidth, clientHeight: el.clientHeight, left: el.scrollLeft, top: el.scrollTop, imageWidth: image.width, imageHeight: image.height };
  });
  expect(zoomed.imageWidth / fit.image.width).toBeCloseTo(1.5, 1);
  expect(zoomed.imageHeight / fit.image.height).toBeCloseTo(1.5, 1);
  expect(zoomed.width > zoomed.clientWidth || zoomed.height > zoomed.clientHeight).toBe(true);
  if (zoomed.width > zoomed.clientWidth) expect(zoomed.left).toBeCloseTo((zoomed.width - zoomed.clientWidth) / 2, 0);
  if (zoomed.height > zoomed.clientHeight) expect(zoomed.top).toBeCloseTo((zoomed.height - zoomed.clientHeight) / 2, 0);
  const edges = await canvas.evaluate((el) => {
    el.scrollTo({ left: el.scrollWidth, top: el.scrollHeight, behavior: 'instant' });
    const end = { left: el.scrollLeft, top: el.scrollTop };
    el.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    return { end, start: { left: el.scrollLeft, top: el.scrollTop } };
  });
  if (zoomed.width > zoomed.clientWidth) expect(edges.end.left).toBeGreaterThan(0);
  if (zoomed.height > zoomed.clientHeight) expect(edges.end.top).toBeGreaterThan(0);
  expect(edges.start).toEqual({ left: 0, top: 0 });
  await dialog.getByRole('button', { name: '縮小圖片' }).click();
  await expect(dialog.getByText('100%', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '關閉放大圖片' }).click();
  await expect(dialog).toHaveCount(0);
});

test('reader pickers use compact search fields and describe their searchable contents', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?folder=unit-a&content=kit-a');
  await page.getByRole('button', { name: '選擇房型文件' }).click();
  const documents = page.getByRole('dialog', { name: '選擇房型文件' });
  const documentSearch = documents.getByRole('searchbox', { name: '搜尋文件' });
  await expect(documentSearch).toHaveAttribute('placeholder', '搜尋文件名稱，例如平面圖或效果圖');
  const documentHeight = await documents.locator('.library-filter').evaluate((el) => el.getBoundingClientRect().height);
  expect(documentHeight).toBeGreaterThanOrEqual(44);
  expect(documentHeight).toBeLessThanOrEqual(56);
  await expect(documents.locator('.library-filter')).toHaveCSS('flex-direction', 'row');
  await expect(documents).toHaveCSS('opacity', '1');
  await page.screenshot({ path: testInfo.outputPath('document-picker.png') });
  await documentSearch.fill('平面圖');
  await expect(documents.locator('.document-list button')).toHaveCount(1);
  await documents.getByRole('button', { name: '關閉文件列表' }).click();
  await page.getByRole('button', { name: '換個單位' }).click();
  const browse = page.getByRole('dialog', { name: '今天想看看哪個家？' });
  const unitSearch = browse.getByRole('searchbox', { name: '搜尋單位資料' });
  await expect(unitSearch).toHaveAttribute('placeholder', '搜尋屋苑、目錄或房型名稱');
  const unitHeight = await browse.locator('.library-filter').evaluate((el) => el.getBoundingClientRect().height);
  expect(unitHeight).toBeGreaterThanOrEqual(44);
  expect(unitHeight).toBeLessThanOrEqual(56);
  await expect(browse.locator('.library-filter')).toHaveCSS('flex-direction', 'row');
  await browse.getByRole('button', { name: '關閉單位選擇' }).click();
});

test('reader has one shopping entry and makes the thumbnail list discoverable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?folder=unit-a&content=kit-a');
  await expect(page.getByRole('button', { name: '看看家具' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '查看相關產品', exact: true })).toBeVisible();
  await expect(page.getByText('輕點切換，選「單頁」看清細節')).toBeVisible();
  await expect(page.getByText('上下滑動查看更多')).toHaveCount(0);
  await page.getByRole('button', { name: '顯示頁面縮圖' }).click();
  await expect(page.getByText('上下滑動查看更多')).toBeVisible();
});
