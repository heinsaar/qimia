import { expect, test } from '@playwright/test';
import { elementCell, openApp } from './fixtures/test-helpers';

test('clicking an element opens detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();

  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="detail-symbol"]')).toContainText('Au');
  await expect(page.locator('[data-testid="detail-story"]')).toContainText('Gold (Au) is element 79');
});

test('detail story switches language with the app', async ({ page }) => {
  await openApp(page);
  await page.click('[data-lang="ru"]');
  await elementCell(page, 79).click();

  await expect(page.locator('[data-testid="detail-story"]')).toContainText('Золото (Au)');
});

test('detail story supports Armenian', async ({ page }) => {
  await openApp(page);
  await page.click('[data-lang="hy"]');
  await elementCell(page, 79).click();

  await expect(page.locator('[data-testid="detail-story"]')).toContainText('Ոսկի (Au)');
});

test('detail panel uses reported crustal abundance labels', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="crustal_abundance"]');
  await elementCell(page, 90).click();

  await expect(page.locator('[data-testid="element-detail"]')).toContainText('0.000010%');
});

test('pressing Escape closes detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.locator('[data-testid="element-detail"]')).not.toBeVisible();
});

test('clicking outside closes detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await page.locator('[data-testid="legend"]').click();

  await expect(page.locator('[data-testid="element-detail"]')).not.toBeVisible();
});
