import type { ColorScale as ColorScaleDef, Element, ElementStoryMap, Layer } from './types';
import type { I18nManager } from './I18nManager';

interface DetailState {
  element: Element;
  layer: Layer;
  scale?: ColorScaleDef;
}

export class ElementDetail {
  private current: DetailState | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly i18n: I18nManager,
    private readonly onClose: () => void,
    private readonly stories: ElementStoryMap,
  ) {
    this.close();
  }

  show(element: Element, layer: Layer, scale?: ColorScaleDef): void {
    this.current = { element, layer, scale };
    this.render();
  }

  close(): void {
    this.current = null;
    this.container.innerHTML = `
      <aside class="detail-panel" data-testid="element-detail" hidden></aside>
    `;
  }

  rerender(): void {
    if (this.current) {
      this.render();
    }
  }

  private render(): void {
    if (!this.current) {
      this.close();
      return;
    }

    const { element, layer, scale } = this.current;
    const layerValue = layer.values[String(element.atomicNumber)];
    const name = this.i18n.t(element.nameKey);
    const story = this.storyFor(element);
    const rows = this.detailRows(element, layer, scale, layerValue)
      .map(
        (row) => `
          <div class="detail-row">
            <dt>${row.label}</dt>
            <dd>${row.value}</dd>
          </div>
        `,
      )
      .join('');

    this.container.innerHTML = `
      <aside class="detail-panel is-open" data-testid="element-detail" aria-label="${this.i18n.t('app.elementDetail')}">
        <button class="detail-close" type="button" data-i18n-aria="app.closeDetail" aria-label="${this.i18n.t(
          'app.closeDetail',
        )}">×</button>
        <div class="detail-heading">
          <span class="detail-number">${element.atomicNumber}</span>
          <h2 data-testid="detail-name">${name}</h2>
          <strong data-testid="detail-symbol">${element.symbol}</strong>
        </div>
        <section class="detail-story">
          <h3>${this.i18n.t('detail.story')}</h3>
          <p data-testid="detail-story">${story}</p>
        </section>
        <dl class="detail-list">${rows}</dl>
      </aside>
    `;

    this.container.querySelector<HTMLButtonElement>('.detail-close')?.addEventListener('click', this.onClose);
    this.i18n.applyToDOM(this.container);
  }

  private storyFor(element: Element): string {
    const story = this.stories[String(element.atomicNumber)];
    return story?.[this.i18n.language] ?? story?.en ?? this.i18n.t('detail.unavailable');
  }

  private detailRows(
    element: Element,
    layer: Layer,
    scale: ColorScaleDef | undefined,
    layerValue: unknown,
  ): Array<{ label: string; value: string }> {
    const optionalRows: Array<[string, string | number | undefined]> = [
      ['detail.atomicNumber', element.atomicNumber],
      ['detail.atomicMass', element.atomicMass],
      ['detail.category', this.i18n.t(`category.${element.category}`)],
      ['detail.block', element.block],
      ['detail.period', element.period <= 7 ? element.period : element.category],
      ['detail.group', element.group > 0 ? element.group : element.category],
      ['detail.electronegativity', element.electronegativity],
      ['detail.atomicRadius', element.atomicRadius ? `${element.atomicRadius} pm` : undefined],
      ['detail.ionizationEnergy', element.ionizationEnergy ? `${element.ionizationEnergy} eV` : undefined],
      ['detail.meltingPoint', element.meltingPoint ? `${element.meltingPoint} K` : undefined],
      ['detail.boilingPoint', element.boilingPoint ? `${element.boilingPoint} K` : undefined],
      ['detail.density', element.density ? `${element.density} g/cm³` : undefined],
      ['detail.yearDiscovered', this.formatYear(element.yearDiscovered)],
      ['detail.discoverer', element.discoverer],
      ['detail.activeLayerValue', this.formatLayerValue(layer, scale, layerValue)],
    ];

    return optionalRows
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({
        label: this.i18n.t(key),
        value: String(value),
      }));
  }

  private formatYear(year: number | undefined): string | undefined {
    if (year === undefined) {
      return undefined;
    }

    return year < 0 ? `${Math.abs(year)} BCE` : String(year);
  }

  private formatLayerValue(layer: Layer, scale: ColorScaleDef | undefined, value: unknown): string {
    if (value === undefined || value === null) {
      return this.i18n.t('app.noLayerValue');
    }

    if (layer.type === 'continuous' && typeof value === 'number') {
      return `${this.i18n.formatNumber(value)} ${layer.unit ?? this.i18n.t('detail.unitless')}`;
    }

    if (typeof value === 'object' && value !== null && 'category' in value) {
      const category = (value as { category?: unknown }).category;
      const labelKey = scale?.entries?.find((entry) => entry.key === category)?.labelKey;
      const label = labelKey ? this.i18n.t(labelKey) : String(category);
      const batteries = (value as { batteries?: unknown }).batteries;
      return Array.isArray(batteries) && batteries.length ? `${label}: ${batteries.join(', ')}` : label;
    }

    return String(value);
  }
}
