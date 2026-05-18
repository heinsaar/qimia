import { expect, test } from '@playwright/test';
import elementStories from '../data/elementStories.json';
import elements from '../data/elements.json';
import crustalLayer from '../data/layers/crustal_abundance.json';
import humanBodyLayer from '../data/layers/human_body.json';
import { ColorScale } from '../src/ColorScale';
import { LayerRegistry } from '../src/LayerRegistry';
import type { ColorScale as ColorScaleDef, ElementStoryMap, Layer } from '../src/types';

const stories = elementStories as ElementStoryMap;

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

test('ColorScale resolves zero continuous values to zero color', () => {
  const resolver = new ColorScale();
  const scale: ColorScaleDef = {
    type: 'continuous',
    scale: 'log10',
    stops: [{ value: -8, color: '#000000' }],
  };

  expect(resolver.resolve(scale, 0)).toBe('var(--color-cell-zero)');
});

test('crustal abundance layer includes every pictured element value', () => {
  const layer = crustalLayer as Layer;
  const values = layer.values as Record<string, number>;
  const displayValues = layer.displayValues ?? {};
  const expectedKeys = elements.map((element) => String(element.atomicNumber));

  expect(Object.keys(values).sort((left, right) => Number(left) - Number(right))).toEqual(expectedKeys);
  expect(Object.keys(displayValues).sort((left, right) => Number(left) - Number(right))).toEqual(expectedKeys);
  expect(layer.source).toContain('CRC Handbook of Chemistry and Physics, 97th edition');
  expect(layer.notes).toContain('Noble gases form no part of the solid crust and are not included.');
  expect(layer.legendBins).toHaveLength(7);
  expect(values['8']).toBe(46.1);
  expect(values['14']).toBe(28.2);
  expect(values['13']).toBe(8.23);
  expect(values['21']).toBe(0.000022);
  expect(values['27']).toBe(0.000025);
  expect(values['28']).toBe(0.000084);
  expect(values['31']).toBe(0.000019);
  expect(values['34']).toBe(5e-8);
  expect(values['39']).toBe(0.000033);
  expect(values['41']).toBe(0.00002);
  expect(values['57']).toBe(0.000039);
  expect(values['58']).toBe(0.000067);
  expect(values['60']).toBe(0.000042);
  expect(values['69']).toBe(5.2e-7);
  expect(values['79']).toBe(4e-9);
  expect(values['82']).toBe(0.000014);
  expect(values['90']).toBe(0.00001);
  expect(values['92']).toBe(0.000003);
  expect(values['2']).toBe(0);
  expect(values['43']).toBe(0);
  expect(values['118']).toBe(0);
  expect(displayValues['16']).toBe('0.0350%');
  expect(displayValues['41']).toBe('0.000020%');
  expect(displayValues['75']).toBe('7.0e-10%');
  expect(displayValues['90']).toBe('0.000010%');
});

test('human body layer includes every pictured element value', () => {
  const layer = humanBodyLayer as Layer;
  const values = layer.values as Record<string, { category: string; percent?: number; trace?: boolean }>;
  const displayValues = layer.displayValues ?? {};
  const expectedKeys = elements.map((element) => String(element.atomicNumber));

  expect(Object.keys(values).sort((left, right) => Number(left) - Number(right))).toEqual(expectedKeys);
  expect(Object.keys(displayValues).sort((left, right) => Number(left) - Number(right))).toEqual(expectedKeys);
  expect(layer.inset?.variant).toBe('human-body');
  expect(layer.inset?.visual).toBe('human');
  expect(layer.notes).toContain('layer.human.note.average');
  expect(displayValues['1']).toBe('10%');
  expect(displayValues['6']).toBe('22.3%');
  expect(displayValues['8']).toBe('61.4%');
  expect(displayValues['15']).toBe('1.11%');
  expect(displayValues['20']).toBe('1.43%');
  expect(displayValues['21']).toBe('TRACE');
  expect(displayValues['82']).toBe('0.00017%');
  expect(displayValues['118']).toBe('0%');
  expect(values['8'].category).toBe('essential');
  expect(values['42'].category).toBe('essential');
  expect(values['21'].trace).toBe(true);
  expect(values['2'].category).toBe('zero');
});

test('all elements have localized detail stories', () => {
  for (const element of elements) {
    const story = stories[String(element.atomicNumber)];
    expect(story, `${element.symbol} story`).toBeDefined();
    if (!story?.en || !story.ru || !story.hy) {
      throw new Error(`${element.symbol} is missing a localized detail story`);
    }

    const englishWordCount = story.en.trim().split(/\s+/).length;
    expect(englishWordCount, `${element.symbol} English story length`).toBeGreaterThanOrEqual(85);
    expect(englishWordCount, `${element.symbol} English story length`).toBeLessThanOrEqual(140);
    expect(story.ru).not.toMatch(/Known since antiquity|Ancient Egypt|Ancient china/);
    expect(story.hy).not.toMatch(/Known since antiquity|Ancient Egypt|Ancient china/);
  }
});
