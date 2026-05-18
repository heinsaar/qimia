import { expect, test } from '@playwright/test';
import { cssVariable, elementCell, openApp } from './fixtures/test-helpers';

test('sidebar lists all registered layers', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('[data-testid="layer-item"]')).toHaveCount(7);
});

test('switching to battery layer colors lithium cell', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="battery"]');

  const bg = await cssVariable(elementCell(page, 3), '--cell-bg');
  expect(bg).not.toBe('');
  expect(bg).not.toBe('var(--color-cell-empty)');
  await expect(elementCell(page, 3).locator('.element-layer-value')).toHaveText('Anode material');
});

test('switching layers updates the legend', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="crustal_abundance"]');

  await expect(page.locator('[data-testid="legend"]')).toBeVisible();
  await expect(page.locator('[data-testid="legend-title"]')).toContainText('Crustal');
});

test('crustal abundance layer renders reported values on element cells', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="crustal_abundance"]');

  await expect(page.locator('[data-atomic] .element-layer-value')).toHaveCount(118);
  await expect(elementCell(page, 1).locator('.element-layer-value')).toHaveText('0.140%');
  await expect(elementCell(page, 21).locator('.element-layer-value')).toHaveText('0.000022%');
  await expect(elementCell(page, 43).locator('.element-layer-value')).toHaveText('0%');
  await expect(elementCell(page, 75).locator('.element-layer-value')).toHaveText('7.0e-10%');
});

test('numeric layers render their own values on element cells', async ({ page }) => {
  await openApp(page);

  await page.click('[data-layer-id="electronegativity"]');
  await expect(elementCell(page, 8).locator('.element-layer-value')).toHaveText('3.44 Pauling');

  await page.click('[data-layer-id="atomic_radius"]');
  await expect(elementCell(page, 8).locator('.element-layer-value')).toHaveText('48 pm');

  await page.click('[data-layer-id="ionization_energy"]');
  await expect(elementCell(page, 8).locator('.element-layer-value')).toHaveText('13.62 eV');

  await page.click('[data-layer-id="water_composition"]');
  await expect(elementCell(page, 8).locator('.element-layer-value')).toHaveText('8.57e+5 mg/L');
});

test('water abundance layer uses ocean water concentrations', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="water_composition"]');

  await expect(page.locator('[data-testid="legend-title"]')).toContainText('Water');
  await expect(elementCell(page, 1)).toHaveAttribute('data-has-layer-value', 'true');
  await expect(elementCell(page, 8)).toHaveAttribute('data-has-layer-value', 'true');
  await expect(elementCell(page, 17)).toHaveAttribute('data-has-layer-value', 'true');
  await expect(elementCell(page, 87)).toHaveAttribute('data-has-layer-value', 'true');

  const franciumBg = await cssVariable(elementCell(page, 87), '--cell-bg');
  expect(franciumBg).toBe('#a6a6a6');
});

test('human body layer renders pictured percentages and context', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="human_body"]');

  await expect(page.locator('[data-testid="legend-title"]')).toContainText('Human Body');
  await expect(page.locator('[data-testid="layer-context"]')).toContainText('Essential elements');
  await expect(page.locator('[data-testid="layer-context"]')).toContainText('Trace = <0.00001%');
  await expect(elementCell(page, 1).locator('.element-layer-value')).toHaveText('10%');
  await expect(elementCell(page, 8).locator('.element-layer-value')).toHaveText('61.4%');
  await expect(elementCell(page, 21).locator('.element-layer-value')).toHaveText('TRACE');
  await expect(elementCell(page, 82).locator('.element-layer-value')).toHaveText('0.00017%');
  await expect(elementCell(page, 118).locator('.element-layer-value')).toHaveText('0%');
});

test('generic layer context uses layer metadata in the table inset', async ({ page }) => {
  await openApp(page);
  await page.click('[data-layer-id="crustal_abundance"]');

  const context = page.locator('[data-testid="layer-context"]');
  const title = page.locator('[data-testid="layer-context-title"]');
  const contextBox = await context.boundingBox();
  const titleBox = await title.boundingBox();

  expect(contextBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  await expect(title).toContainText('Crustal Abundance');
  await expect(context).toContainText('Noble gases form no part');
  await expect(context).toContainText('10-100%');
  expect(titleBox!.y - contextBox!.y).toBeLessThan(40);
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
  expect(metrics.gridWidth / metrics.clientWidth).toBeGreaterThan(0.98);
});

test('periodic table keeps the same footprint across layers', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1024 });
  await openApp(page);

  const layers = [
    'battery',
    'crustal_abundance',
    'water_composition',
    'human_body',
    'electronegativity',
    'atomic_radius',
    'ionization_energy',
  ];
  const footprints: Array<{ x: number; width: number; height: number }> = [];

  for (const layer of layers) {
    await page.click(`[data-layer-id="${layer}"]`);
    footprints.push(
      await page.locator('.periodic-grid').evaluate((grid) => {
        const rect = grid.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    );
  }

  expect(new Set(footprints.map((footprint) => footprint.x)).size).toBe(1);
  expect(new Set(footprints.map((footprint) => footprint.width)).size).toBe(1);
  expect(new Set(footprints.map((footprint) => footprint.height)).size).toBe(1);
});
