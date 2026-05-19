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

test('detail name sits top left with properties below it', async ({ page }) => {
  await openApp(page);
  await elementCell(page, 14).click();

  const detailBox = await page.locator('[data-testid="element-detail"]').boundingBox();
  const nameBox = await page.locator('[data-testid="detail-name"]').boundingBox();
  const numberBox = await page.locator('.detail-number').boundingBox();
  const symbolBox = await page.locator('[data-testid="detail-symbol"]').boundingBox();
  const listBox = await page.locator('.detail-list').boundingBox();
  const storyBox = await page.locator('.detail-story').boundingBox();
  const insetBox = await page.locator('#table-inset').boundingBox();

  expect(detailBox).not.toBeNull();
  expect(nameBox).not.toBeNull();
  expect(numberBox).not.toBeNull();
  expect(symbolBox).not.toBeNull();
  expect(listBox).not.toBeNull();
  expect(storyBox).not.toBeNull();
  expect(insetBox).not.toBeNull();
  expect(nameBox!.x - detailBox!.x).toBeLessThan(24);
  expect(nameBox!.y - detailBox!.y).toBeLessThan(28);
  expect(numberBox!.x).toBeGreaterThan(nameBox!.x + nameBox!.width);
  expect(symbolBox!.x - detailBox!.x).toBeLessThan(24);
  expect(listBox!.x - detailBox!.x).toBeLessThan(24);
  expect(listBox!.y).toBeGreaterThan(symbolBox!.y);
  expect(storyBox!.x).toBeGreaterThan(symbolBox!.x + symbolBox!.width);
  expect(detailBox!.y + detailBox!.height).toBeLessThanOrEqual(insetBox!.y + insetBox!.height + 1);
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
