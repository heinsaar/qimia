import { expect, test } from '@playwright/test';
import { openApp } from './fixtures/test-helpers';

test('all element cells have aria-label', async ({ page }) => {
  await openApp(page);
  const cells = page.locator('[data-atomic]');
  await expect(cells).toHaveCount(118);

  const missingLabels = await cells.evaluateAll((elements) =>
    elements
      .filter((element) => !element.getAttribute('aria-label'))
      .map((element) => element.getAttribute('data-atomic')),
  );

  expect(missingLabels).toEqual([]);
});

test('sidebar layer items are keyboard-navigable', async ({ page }) => {
  await openApp(page);
  await page.focus('[data-testid="layer-item"]:first-child');
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-testid="layer-item"]:first-child')).toHaveAttribute('aria-selected', 'true');
});
