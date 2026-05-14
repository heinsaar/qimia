import type { Layer } from '../types';
import type { I18nManager } from '../I18nManager';

type SelectLayerHandler = (layerId: string) => void;

export class LayerMenu {
  constructor(
    private readonly container: HTMLElement,
    private readonly layers: Layer[],
    private readonly i18n: I18nManager,
    private readonly onSelect: SelectLayerHandler,
  ) {}

  render(activeLayerId: string): void {
    this.container.innerHTML = '';

    const heading = document.createElement('h2');
    heading.className = 'sidebar-heading';
    heading.dataset.i18n = 'app.layers';
    heading.textContent = this.i18n.t('app.layers');

    const list = document.createElement('div');
    list.className = 'layer-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', this.i18n.t('app.layers'));

    this.layers.forEach((layer) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'layer-item';
      item.dataset.testid = 'layer-item';
      item.dataset.layerId = layer.id;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(layer.id === activeLayerId));
      item.addEventListener('click', () => this.onSelect(layer.id));

      const swatch = document.createElement('span');
      swatch.className = `layer-swatch layer-swatch-${layer.id}`;
      swatch.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'layer-copy';
      text.textContent = this.i18n.t(layer.titleKey);

      item.append(swatch, text);
      list.append(item);
    });

    const addLayer = document.createElement('button');
    addLayer.type = 'button';
    addLayer.className = 'layer-add';
    addLayer.disabled = true;
    addLayer.dataset.i18n = 'app.addLayer';
    addLayer.textContent = this.i18n.t('app.addLayer');

    this.container.append(heading, list, addLayer);
  }
}

