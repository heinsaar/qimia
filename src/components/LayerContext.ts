import type { Layer } from '../types';
import type { I18nManager } from '../I18nManager';

export class LayerContext {
  constructor(
    private readonly container: HTMLElement,
    private readonly i18n: I18nManager,
  ) {}

  render(layer: Layer): void {
    const inset = layer.inset;
    const detailKeys = inset?.details ?? layer.notes ?? [];

    this.container.innerHTML = `
      <section class="layer-context-panel ${inset?.variant === 'human-body' ? 'is-human-body' : ''}" data-testid="layer-context">
        ${inset?.visual === 'human' ? this.humanFigure() : ''}
        <div class="layer-context-content">
          <h2 data-testid="layer-context-title">${this.i18n.t(inset?.titleKey ?? layer.titleKey)}</h2>
          <p>${this.i18n.t(layer.descriptionKey)}</p>
          ${inset?.key?.length ? this.renderKey(inset.key) : this.renderLegendBins(layer)}
          ${detailKeys.length ? this.renderDetails(detailKeys) : ''}
          ${layer.source ? `<p class="layer-context-source">${layer.source}</p>` : ''}
        </div>
      </section>
    `;
  }

  private humanFigure(): string {
    return `
      <div class="human-figure" aria-hidden="true">
        <span class="human-head"></span>
        <span class="human-torso"></span>
        <span class="human-arm left"></span>
        <span class="human-arm right"></span>
        <span class="human-leg left"></span>
        <span class="human-leg right"></span>
      </div>
    `;
  }

  private renderKey(entries: NonNullable<Layer['inset']>['key']): string {
    return `
      <div class="layer-context-key">
        ${(entries ?? [])
          .map(
            (entry) => `
              <span class="layer-context-key-item">
                <span class="layer-context-swatch" style="background: var(${entry.colorVar})"></span>
                ${this.i18n.t(entry.labelKey)}
              </span>
            `,
          )
          .join('')}
      </div>
    `;
  }

  private renderLegendBins(layer: Layer): string {
    if (!layer.legendBins?.length) {
      return '';
    }

    return `
      <div class="layer-context-bins">
        ${layer.legendBins
          .slice(0, 4)
          .map((bin) => `<span class="layer-context-bin">${bin.label}</span>`)
          .join('')}
      </div>
    `;
  }

  private renderDetails(detailKeys: string[]): string {
    return `
      <div class="layer-context-details">
        ${detailKeys.map((key) => `<p>${this.i18n.t(key, key)}</p>`).join('')}
      </div>
    `;
  }
}
