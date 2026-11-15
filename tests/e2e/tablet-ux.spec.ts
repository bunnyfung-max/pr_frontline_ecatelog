import { test, expect } from '@playwright/test';

test('tablet category browsing keeps filters visible and limits estate choices', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '產品', exact: true }).click();
  const dialog = page.locator('#library-dialog');
  const box = await dialog.boundingBox();
  expect(box).toMatchObject({ width: 1200, height: 752 });
  await expect(dialog.getByRole('button', { name: '向右查看選擇產品' })).toBeVisible();
  await dialog.getByRole('button', { name: /收納 2/ }).click();
  await dialog.getByRole('searchbox', { name: '搜尋產品' }).fill('絕對沒有這個項目');
  await expect(dialog.locator('.scope-active-filter')).toContainText('收納');
  await expect(dialog.getByText(/沒有找到相符的\s*產品\s*資料/)).toBeVisible();
  await dialog.getByRole('button', { name: '清除已選' }).click();
  await expect(dialog.locator('.scope-active-filter')).not.toContainText('收納');
  await dialog.getByRole('button', { name: '清除搜尋' }).click();
  await dialog.getByRole('button', { name: '屋苑', exact: true }).click();
  await expect(dialog.getByRole('button', { name: /示例屋苑 A/ })).toBeVisible();
  const options = dialog.getByRole('navigation', { name: '選擇屋苑' });
  await expect(options.getByRole('button', { name: /POP 展示/ })).toHaveCount(0);
  await expect(options.getByRole('button', { name: /450–550 呎/ })).toHaveCount(0);
  await page.screenshot({ path: '../evidence/tablet-estate.png' });
});

test('tablet search can be changed in results and directory titles are not truncated', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: '搜尋全部銷售資料' }).fill('沒有此項目');
  await page.getByRole('button', { name: '搜尋', exact: true }).click();
  const dialog = page.locator('#library-dialog');
  await expect(dialog.getByRole('heading', { name: '沒有找到相符資料' })).toBeVisible();
  await dialog.getByRole('searchbox', { name: '修改搜尋關鍵字' }).fill('梳化');
  await dialog.getByRole('button', { name: '搜尋', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: '「梳化」的搜尋結果' })).toBeVisible();
  await expect(dialog.locator('.case-card').first()).toBeVisible();
  await dialog.getByRole('button', { name: '關閉搜尋結果' }).click();
  await page.getByRole('button', { name: /新屋入伙.*個資料夾/ }).click();
  await expect(dialog).toHaveAttribute('data-mode', 'directory');
  const heading = dialog.getByRole('heading', { name: 'Type A – 1至2人單位（客廳體驗）' });
  await expect(heading).toBeVisible();
  const layout = await heading.evaluate((el) => {
    const card = el.closest('.case-card')!;
    const rect = el.getBoundingClientRect();
    const parent = card.getBoundingClientRect();
    return { css: getComputedStyle(el).whiteSpace, inCard: rect.bottom <= parent.bottom && rect.right <= parent.right };
  });
  expect(layout).toEqual({ css: 'normal', inCard: true });
  await page.screenshot({ path: '../evidence/tablet-directory.png' });
});
