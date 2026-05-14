import { expect, test } from '@playwright/test';
import { openApp } from './fixtures/test-helpers';

test('all element cells have aria-label', async ({ page }) => {
  await openApp(page);
  const cells = page.locator('[data-atomic]');
  const count = await cells.count();

  expect(count).toBe(118);
  for (let index = 0; index < count; index += 1) {
    await expect(cells.nth(index)).toHaveAttribute('aria-label', /.+/);
  }
});

test('sidebar layer items are keyboard-navigable', async ({ page }) => {
  await openApp(page);
  await page.focus('[data-testid="layer-item"]:first-child');
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-testid="layer-item"]:first-child')).toHaveAttribute('aria-selected', 'true');
});

