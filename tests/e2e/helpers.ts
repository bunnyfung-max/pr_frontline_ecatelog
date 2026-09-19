import type { Page } from '@playwright/test';

export const DEMO_CMS_PASSWORD = 'Abc123';

export async function unlockCms(page: Page, password = DEMO_CMS_PASSWORD) {
  await page.getByLabel('內容管理密碼').fill(password);
  await page.getByRole('button', { name: '進入內容管理' }).click();
}
