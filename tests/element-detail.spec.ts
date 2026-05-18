import { expect, test } from '@playwright/test';
import { elementCell, openApp } from './fixtures/test-helpers';

test('detail panel shows hydrogen by default inside the table gap', async ({ page }) => {
  await openApp(page);

  const detail = page.locator('[data-testid="element-detail"]');
  const grid = page.locator('.periodic-grid');
  const detailBox = await detail.boundingBox();
  const gridBox = await grid.boundingBox();

  expect(detailBox).not.toBeNull();
  expect(gridBox).not.toBeNull();
  await expect(detail).toBeVisible();
  await expect(page.locator('[data-testid="detail-symbol"]')).toContainText('H');
  await expect(elementCell(page, 1)).toHaveAttribute('aria-pressed', 'true');
  expect(detailBox!.x).toBeGreaterThan(gridBox!.x);
  expect(detailBox!.y).toBeGreaterThanOrEqual(gridBox!.y);
  expect(detailBox!.x + detailBox!.width).toBeLessThan(gridBox!.x + gridBox!.width);
});

test('detail name sits in the top right of the detail panel', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 14).click();

  const detailBox = await page.locator('[data-testid="element-detail"]').boundingBox();
  const nameBox = await page.locator('[data-testid="detail-name"]').boundingBox();
  const symbolBox = await page.locator('[data-testid="detail-symbol"]').boundingBox();
  const storyBox = await page.locator('.detail-story').boundingBox();

  expect(detailBox).not.toBeNull();
  expect(nameBox).not.toBeNull();
  expect(symbolBox).not.toBeNull();
  expect(storyBox).not.toBeNull();
  expect(nameBox!.x).toBeGreaterThan(symbolBox!.x + symbolBox!.width);
  expect(nameBox!.y - detailBox!.y).toBeLessThan(36);
  expect(detailBox!.x + detailBox!.width - (nameBox!.x + nameBox!.width)).toBeLessThan(24);
  expect(storyBox!.y).toBeLessThan(symbolBox!.y + symbolBox!.height);
});

test('clicking an element updates detail panel', async ({ page }) => {
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

test('pressing Escape leaves the current inline detail visible', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="detail-symbol"]')).toContainText('Au');
});

test('clicking outside leaves the current inline detail visible', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 79).click();
  await page.locator('[data-testid="legend"]').click();

  await expect(page.locator('[data-testid="element-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="detail-symbol"]')).toContainText('Au');
});
