import { test, expect } from '@playwright/test';

test('16:9 homepage keeps search above the fold and five uncropped folder cards accessible', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.directory-entry')).toHaveCount(5);
  await expect(page.getByRole('searchbox')).toHaveCSS('font-size', '20px');
  await expect(page.locator('.search-intro h1')).toHaveCSS('font-size', '36px');
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    targets: Array.from(document.querySelectorAll('.search-submit, .directory-entry')).map(
      (element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height };
      },
    ),
  }));
  expect(layout.width / layout.height).toBeCloseTo(16 / 9, 2);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
  for (const target of layout.targets) {
    expect(target.top).toBeGreaterThanOrEqual(0);
    expect(target.bottom).toBeLessThanOrEqual(layout.scrollHeight);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }
  expect(layout.targets[0].bottom).toBeLessThanOrEqual(layout.height);
  await expect(page.locator('.folder-tile')).toHaveCount(5);
  await expect(page.locator('.folder-tile').first()).toHaveCSS('border-radius', '12px');

  await page.goto('/?folder=unit-a');
  await expect(page.getByRole('heading', { name: '小空間，大可能' })).toBeVisible();
  const contentBottom = await page
    .locator('.search-content-entry')
    .first()
    .evaluate((element) => element.getBoundingClientRect().bottom);
  expect(contentBottom).toBeLessThanOrEqual(layout.height);
});
