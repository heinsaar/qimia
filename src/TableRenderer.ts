import { ColorScale } from './ColorScale';
import type { ColorScale as ColorScaleDef, Element, Layer } from './types';
import type { I18nManager } from './I18nManager';

type SelectElementHandler = (element: Element) => void;

export class TableRenderer {
  private readonly cells = new Map<number, HTMLButtonElement>();
  private grid: HTMLDivElement | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly elements: Element[],
    private readonly i18n: I18nManager,
    private readonly colorScale: ColorScale,
  ) {}

  render(onSelect: SelectElementHandler): void {
    this.container.innerHTML = '';
    this.cells.clear();

    this.grid = document.createElement('div');
    this.grid.className = 'periodic-grid';
    this.grid.setAttribute('role', 'grid');
    this.grid.setAttribute('aria-label', this.i18n.t('app.tableLabel'));

    this.grid.append(this.createSeriesMarker('57-71', 6));
    this.grid.append(this.createSeriesMarker('89-103', 7));

    this.elements.forEach((element) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'element-cell';
      cell.dataset.atomic = String(element.atomicNumber);
      cell.dataset.category = element.category;
      cell.style.gridColumn = String(this.gridColumnFor(element));
      cell.style.gridRow = String(element.period);
      cell.addEventListener('click', () => onSelect(element));
      this.cells.set(element.atomicNumber, cell);
      this.grid?.append(cell);
    });

    this.container.append(this.grid);
    this.updateLabels();
  }

  updateLayer(layer: Layer, scale: ColorScaleDef | undefined): void {
    this.cells.forEach((cell, atomicNumber) => {
      const layerValue = layer.values[String(atomicNumber)];
      cell.style.setProperty('--cell-bg', this.colorScale.resolve(scale, layerValue));
      cell.dataset.hasLayerValue = layerValue === undefined ? 'false' : 'true';
    });
  }

  updateLabels(): void {
    this.grid?.setAttribute('aria-label', this.i18n.t('app.tableLabel'));

    this.elements.forEach((element) => {
      const cell = this.cells.get(element.atomicNumber);
      if (!cell) {
        return;
      }

      const name = this.i18n.t(element.nameKey);
      cell.setAttribute('aria-label', `${name}, ${element.symbol}, ${element.atomicNumber}`);
      cell.dataset.tooltip = `${name} (${element.symbol})`;
      cell.innerHTML = `
        <span class="element-number">${element.atomicNumber}</span>
        <span class="element-symbol">${element.symbol}</span>
        <span class="element-name">${name}</span>
      `;
    });
  }

  setSelected(atomicNumber: number | null): void {
    this.cells.forEach((cell, cellAtomicNumber) => {
      const selected = atomicNumber === cellAtomicNumber;
      cell.classList.toggle('is-selected', selected);
      cell.setAttribute('aria-pressed', String(selected));
    });
  }

  private createSeriesMarker(label: string, row: number): HTMLDivElement {
    const marker = document.createElement('div');
    marker.className = 'series-marker';
    marker.textContent = label;
    marker.style.gridColumn = '3';
    marker.style.gridRow = String(row);
    marker.setAttribute('aria-hidden', 'true');
    return marker;
  }

  private gridColumnFor(element: Element): number {
    if (element.period === 8) {
      return element.atomicNumber - 57 + 4;
    }

    if (element.period === 9) {
      return element.atomicNumber - 89 + 4;
    }

    return element.group;
  }
}

