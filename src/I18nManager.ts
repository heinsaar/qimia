import type { Language, TranslationCatalog } from './types';

export class I18nManager {
  private strings: TranslationCatalog = {};
  private lang: Language = 'en';

  constructor(private readonly catalogs: Record<Language, TranslationCatalog>) {}

  async load(lang: Language): Promise<void> {
    this.lang = lang;
    this.strings = this.catalogs[lang] ?? this.catalogs.en;
    document.documentElement.lang = lang;
  }

  get language(): Language {
    return this.lang;
  }

  t(key: string, fallback?: string): string {
    return this.strings[key] ?? this.catalogs.en[key] ?? fallback ?? key;
  }

  formatNumber(value: number): string {
    const absoluteValue = Math.abs(value);
    if (absoluteValue > 0 && (absoluteValue < 0.000001 || absoluteValue >= 100000)) {
      return value.toExponential(2).replace(/\.?0+e/, 'e');
    }

    return new Intl.NumberFormat(this.lang, {
      maximumFractionDigits: Math.abs(value) < 1 ? 8 : 3,
    }).format(value);
  }

  applyToDOM(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (key) {
        element.textContent = this.t(key);
      }
    });

    root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((element) => {
      const key = element.dataset.i18nTitle;
      if (key) {
        element.title = this.t(key);
      }
    });

    root.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
      const key = element.dataset.i18nAria;
      if (key) {
        element.setAttribute('aria-label', this.t(key));
      }
    });
  }
}
