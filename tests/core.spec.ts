import { expect, test } from '@playwright/test';
import { ColorScale } from '../src/ColorScale';
import { LayerRegistry } from '../src/LayerRegistry';
import type { ColorScale as ColorScaleDef, Layer } from '../src/types';

test('LayerRegistry returns registered layers in insertion order', () => {
  const registry = new LayerRegistry();
  const first: Layer = {
    id: 'first',
    titleKey: 'layer.first',
    descriptionKey: 'layer.first.description',
    colorScale: 'scale',
    type: 'continuous',
    values: {},
  };
  const second: Layer = { ...first, id: 'second' };

  registry.register(first);
  registry.register(second);

  expect(registry.getAll().map((layer) => layer.id)).toEqual(['first', 'second']);
});

test('ColorScale resolves categorical values to CSS variables', () => {
  const resolver = new ColorScale();
  const scale: ColorScaleDef = {
    type: 'categorical',
    entries: [{ key: 'anode', colorVar: '--color-anode', labelKey: 'scale.anode' }],
  };

  expect(resolver.resolve(scale, { category: 'anode' })).toBe('var(--color-anode)');
});

test('ColorScale interpolates continuous values', () => {
  const resolver = new ColorScale();
  const scale: ColorScaleDef = {
    type: 'continuous',
    scale: 'linear',
    stops: [
      { value: 0, color: '#000000' },
      { value: 10, color: '#ffffff' },
    ],
  };

  expect(resolver.resolve(scale, 5)).toBe('rgb(128, 128, 128)');
});

