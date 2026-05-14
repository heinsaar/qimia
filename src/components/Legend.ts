import type { ColorScale, Layer } from '../types';
import type { I18nManager } from '../I18nManager';

export class Legend {
  constructor(
    private readonly container: HTMLElement,
    private readonly i18n: I18nManager,
  ) {}

  render(layer: Layer, scale: ColorScale | undefined): void {
    this.container.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'legend';
    section.dataset.testid = 'legend';
    section.setAttribute('aria-label', this.i18n.t('app.legend'));

    const title = document.createElement('h2');
    title.dataset.testid = 'legend-title';
    title.textContent = this.i18n.t(layer.titleKey);

    const description = document.createElement('p');
    description.textContent = this.i18n.t(layer.descriptionKey);

    section.append(title, description);

    if (scale?.type === 'categorical' && scale.entries) {
      const list = document.createElement('div');
      list.className = 'legend-list';
      scale.entries.forEach((entry) => {
        const item = document.createElement('span');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-swatch" style="background: var(${entry.colorVar})"></span>${this.i18n.t(
          entry.labelKey,
        )}`;
        list.append(item);
      });
      section.append(list);
    }

    if (scale?.type === 'continuous' && scale.stops?.length) {
      const gradient = document.createElement('div');
      gradient.className = 'legend-gradient';
      gradient.style.background = this.gradientFor(scale);

      const values = document.createElement('div');
      values.className = 'legend-range';
      const stops = [...scale.stops].sort((left, right) => left.value - right.value);
      const first = stops[0];
      const last = stops[stops.length - 1];
      values.innerHTML = `<span>${this.formatStop(first.value, scale, layer)}</span><span>${this.formatStop(
        last.value,
        scale,
        layer,
      )}</span>`;

      section.append(gradient, values);
    }

    this.container.append(section);
  }

  private gradientFor(scale: ColorScale): string {
    const stops = [...(scale.stops ?? [])].sort((left, right) => left.value - right.value);
    const first = stops[0].value;
    const last = stops[stops.length - 1].value;
    const parts = stops.map((stop) => {
      const position = ((stop.value - first) / (last - first)) * 100;
      return `${stop.color} ${position}%`;
    });
    return `linear-gradient(90deg, ${parts.join(', ')})`;
  }

  private formatStop(value: number, scale: ColorScale, layer: Layer): string {
    if (scale.scale === 'log10') {
      const rawValue = 10 ** value;
      return `${this.i18n.formatNumber(rawValue)} ${layer.unit ?? ''}`.trim();
    }

    return `${this.i18n.formatNumber(value)} ${layer.unit ?? ''}`.trim();
  }
}

