import { expect, test } from '@playwright/test';
import { elementCell, openApp } from './fixtures/test-helpers';

test('switching to Armenian renders Armenian text', async ({ page }) => {
  await openApp(page);
  await page.click('[data-lang="hy"]');

  await expect(page.locator('[data-testid="app-title"]')).toContainText('Պարբերական');
});

test('switching to Russian renders Russian element names', async ({ page }) => {
  await openApp(page);
  await page.click('[data-lang="ru"]');
  await elementCell(page, 3).click();

  await expect(page.locator('[data-testid="detail-name"]')).toContainText('Литий');
});

test('language persists on reload via localStorage', async ({ page }) => {
  await openApp(page);
  await page.click('[data-lang="ru"]');
  await page.reload();

  await expect(page.locator('[data-testid="lang-active"]')).toHaveAttribute('data-lang', 'ru');
});

