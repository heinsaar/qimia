import './style.css';
import { ColorScale } from './ColorScale';
import { ElementDetail } from './ElementDetail';
import { I18nManager } from './I18nManager';
import { LayerRegistry } from './LayerRegistry';
import { TableRenderer } from './TableRenderer';
import { LangPicker } from './components/LangPicker';
import { LayerMenu } from './components/LayerMenu';
import { Legend } from './components/Legend';
import type { AppState, ColorScaleMap, Element, ElementStoryMap, Language, Layer, TranslationCatalog } from './types';
import colorScaleData from '../data/colorScales.json';
import elementsData from '../data/elements.json';
import elementStoriesData from '../data/elementStories.json';
import atomicRadiusLayer from '../data/layers/atomic_radius.json';
import batteryLayer from '../data/layers/battery.json';
import crustalLayer from '../data/layers/crustal_abundance.json';
import electronegativityLayer from '../data/layers/electronegativity.json';
import ionizationLayer from '../data/layers/ionization_energy.json';
import waterCompositionLayer from '../data/layers/water_composition.json';
import en from '../i18n/en.json';
import hy from '../i18n/hy.json';
import ru from '../i18n/ru.json';

const registry = new LayerRegistry();
const layers = [
  batteryLayer,
  crustalLayer,
  waterCompositionLayer,
  electronegativityLayer,
  atomicRadiusLayer,
  ionizationLayer,
] as Layer[];
layers.forEach((layer) => registry.register(layer));

const elements = elementsData as Element[];
const elementStories = elementStoriesData as ElementStoryMap;
const colorScales = colorScaleData as ColorScaleMap;
const i18n = new I18nManager({
  en: en as TranslationCatalog,
  ru: ru as TranslationCatalog,
  hy: hy as TranslationCatalog,
});
const colorScale = new ColorScale();

const state: AppState = {
  activeLayerId: readLayerId(),
  language: readLanguage(),
  selectedElement: null,
};

const root = requiredElement<HTMLDivElement>('#app');

void boot();

async function boot(): Promise<void> {
  await i18n.load(state.language);
  root.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow" data-i18n="app.layer">${i18n.t('app.layer')}</p>
          <h1 data-testid="app-title" data-i18n="app.title">${i18n.t('app.title')}</h1>
        </div>
        <div id="lang-picker"></div>
      </header>
      <div class="main-layout">
        <aside class="sidebar">
          <nav id="layer-menu"></nav>
        </aside>
        <main class="workspace">
          <div class="table-scroll">
            <div id="periodic-table"></div>
          </div>
          <div id="legend-root"></div>
        </main>
      </div>
      <div id="detail-root"></div>
    </div>
  `;
  i18n.applyToDOM(root);

  const layerMenuRoot = requiredElement<HTMLElement>('#layer-menu');
  const tableRoot = requiredElement<HTMLElement>('#periodic-table');
  const legendRoot = requiredElement<HTMLElement>('#legend-root');
  const langPickerRoot = requiredElement<HTMLElement>('#lang-picker');
  const detailRoot = requiredElement<HTMLElement>('#detail-root');

  const layerMenu = new LayerMenu(layerMenuRoot, registry.getAll(), i18n, selectLayer);
  const tableRenderer = new TableRenderer(tableRoot, elements, i18n, colorScale);
  const legend = new Legend(legendRoot, i18n);
  const langPicker = new LangPicker(langPickerRoot, i18n, selectLanguage);
  const detail = new ElementDetail(detailRoot, i18n, closeDetail, elementStories);

  tableRenderer.render((element) => {
    state.selectedElement = element.atomicNumber;
    tableRenderer.setSelected(element.atomicNumber);
    detail.show(element, activeLayer(), activeScale());
  });

  renderState();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDetail();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (state.selectedElement === null || !(event.target instanceof HTMLElement)) {
      return;
    }

    if (!event.target.closest('.detail-panel') && !event.target.closest('.element-cell')) {
      closeDetail();
    }
  });

  function selectLayer(layerId: string): void {
    state.activeLayerId = layerId;
    localStorage.setItem('qimia.activeLayer', layerId);
    renderState();
  }

  async function selectLanguage(language: Language): Promise<void> {
    state.language = language;
    localStorage.setItem('qimia.language', language);
    await i18n.load(language);
    document.title = i18n.t('app.title');
    i18n.applyToDOM(root);
    tableRenderer.updateLabels();
    detail.rerender();
    renderState();
  }

  function renderState(): void {
    const layer = activeLayer();
    const scale = activeScale();
    layerMenu.render(state.activeLayerId);
    langPicker.render(state.language);
    legend.render(layer, scale);
    tableRenderer.updateLayer(layer, scale);
    tableRenderer.setSelected(state.selectedElement);

    const selectedElement = elements.find((element) => element.atomicNumber === state.selectedElement);
    if (selectedElement) {
      detail.show(selectedElement, layer, scale);
    }
  }

  function closeDetail(): void {
    state.selectedElement = null;
    tableRenderer.setSelected(null);
    detail.close();
  }
}

function activeLayer(): Layer {
  return registry.get(state.activeLayerId) ?? registry.getAll()[0];
}

function activeScale() {
  return colorScales[activeLayer().colorScale];
}

function readLanguage(): Language {
  const stored = localStorage.getItem('qimia.language');
  return stored === 'ru' || stored === 'hy' || stored === 'en' ? stored : 'en';
}

function readLayerId(): string {
  const stored = localStorage.getItem('qimia.activeLayer');
  return stored && registry.get(stored) ? stored : registry.getAll()[0].id;
}

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}
