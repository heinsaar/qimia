import { expect, test } from '@playwright/test';
import { elementCell, openApp } from './fixtures/test-helpers';

test('clicking an element opens detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();

  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="detail-symbol"]')).toContainText('Au');
});

test('pressing Escape closes detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await page.keyboard.press('Escape');

  await expect(page.locator('[data-testid="element-detail"]')).not.toBeVisible();
});

test('clicking outside closes detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await page.locator('[data-testid="legend"]').click();

  await expect(page.locator('[data-testid="element-detail"]')).not.toBeVisible();
});
