import type { I18nManager } from '../I18nManager';
import type { Language } from '../types';

const LANGUAGES: Language[] = ['en', 'ru', 'hy'];

type SelectLanguageHandler = (language: Language) => void;

export class LangPicker {
  constructor(
    private readonly container: HTMLElement,
    private readonly i18n: I18nManager,
    private readonly onSelect: SelectLanguageHandler,
  ) {}

  render(activeLanguage: Language): void {
    this.container.innerHTML = '';
    this.container.className = 'lang-picker';
    this.container.setAttribute('aria-label', this.i18n.t('app.language'));

    LANGUAGES.forEach((language) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-button';
      button.dataset.lang = language;
      button.textContent = language.toUpperCase();
      button.title = this.i18n.t(`lang.${language}`);
      button.setAttribute('aria-label', this.i18n.t(`lang.${language}`));
      button.setAttribute('aria-pressed', String(language === activeLanguage));
      if (language === activeLanguage) {
        button.dataset.testid = 'lang-active';
      }
      button.addEventListener('click', () => this.onSelect(language));
      this.container.append(button);
    });
  }
}

