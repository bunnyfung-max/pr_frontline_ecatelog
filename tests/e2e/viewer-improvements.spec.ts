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
