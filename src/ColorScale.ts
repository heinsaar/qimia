import type { ColorScale as ColorScaleDef, ColorStop } from './types';

export class ColorScale {
  resolve(scale: ColorScaleDef | undefined, value: unknown): string {
    if (!scale || value === null || value === undefined) {
      return 'var(--color-cell-empty)';
    }

    if (scale.type === 'categorical') {
      const category = this.extractCategory(value);
      const entry = scale.entries?.find((candidate) => candidate.key === category);
      return entry ? `var(${entry.colorVar})` : 'var(--color-cell-empty)';
    }

    const numberValue = this.extractNumber(value);
    if (numberValue === null || !scale.stops?.length) {
      return 'var(--color-cell-empty)';
    }

    if (numberValue === 0) {
      return 'var(--color-cell-zero)';
    }

    const transformedValue = scale.scale === 'log10' ? Math.log10(numberValue) : numberValue;
    return this.interpolate(scale.stops, transformedValue);
  }

  private extractCategory(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && value !== null && 'category' in value) {
      const category = (value as { category?: unknown }).category;
      return typeof category === 'string' ? category : null;
    }

    return null;
  }

  private extractNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    return null;
  }

  private interpolate(stops: ColorStop[], value: number): string {
    const sortedStops = [...stops].sort((left, right) => left.value - right.value);

    if (value <= sortedStops[0].value) {
      return sortedStops[0].color;
    }

    const lastStop = sortedStops[sortedStops.length - 1];
    if (value >= lastStop.value) {
      return lastStop.color;
    }

    const upperIndex = sortedStops.findIndex((stop) => stop.value >= value);
    const lower = sortedStops[upperIndex - 1];
    const upper = sortedStops[upperIndex];
    const ratio = (value - lower.value) / (upper.value - lower.value);
    return this.mixHex(lower.color, upper.color, ratio);
  }

  private mixHex(leftHex: string, rightHex: string, ratio: number): string {
    const left = this.hexToRgb(leftHex);
    const right = this.hexToRgb(rightHex);
    const mixed = left.map((channel, index) => Math.round(channel + (right[index] - channel) * ratio));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const normalized = hex.replace('#', '');
    const expanded =
      normalized.length === 3
        ? normalized
            .split('')
            .map((part) => part + part)
            .join('')
        : normalized;

    return [
      Number.parseInt(expanded.slice(0, 2), 16),
      Number.parseInt(expanded.slice(2, 4), 16),
      Number.parseInt(expanded.slice(4, 6), 16),
    ];
  }
}
