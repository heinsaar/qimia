import type { Locator, Page } from '@playwright/test';

export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
}

export function elementCell(page: Page, atomicNumber: number): Locator {
  return page.locator(`[data-atomic="${atomicNumber}"]`);
}

export async function cssVariable(locator: Locator, name: string): Promise<string> {
  return locator.evaluate((element, variableName) => getComputedStyle(element).getPropertyValue(variableName).trim(), name);
}

