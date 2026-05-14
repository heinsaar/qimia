import { expect, test } from '@playwright/test';
import { cssVariable, elementCell, openApp } from './fixtures/test-helpers';

test('sidebar lists all registered layers', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('[data-testid="layer-item"]')).toHaveCount(5);
});

test('switching to battery layer colors lithium cell', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="battery"]');

  const bg = await cssVariable(elementCell(page, 3), '--cell-bg');
  expect(bg).not.toBe('');
  expect(bg).not.toBe('var(--color-cell-empty)');
});

test('switching layers updates the legend', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="crustal_abundance"]');

  await expect(page.locator('[data-testid="legend"]')).toBeVisible();
  await expect(page.locator('[data-testid="legend-title"]')).toContainText('Crustal');
});

test('periodic table scales to the available desktop workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openApp(page);

  const metrics = await page.locator('.table-scroll').evaluate((container) => {
    const grid = container.querySelector<HTMLElement>('.periodic-grid');
    if (!grid) {
      throw new Error('Missing periodic grid');
    }

    return {
      clientWidth: container.clientWidth,
      scrollWidth: container.scrollWidth,
      gridWidth: grid.getBoundingClientRect().width,
    };
  });

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.gridWidth / metrics.clientWidth).toBeGreaterThan(0.82);
});
