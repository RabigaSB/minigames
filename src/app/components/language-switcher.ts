import { createElement } from '../create-element';
import {
  changeLanguage,
  getCurrentLanguage,
  onLanguageChange,
  supportedLanguages,
} from '../../i18n';

const languageNames = {
  en: 'English',
  ru: 'Русский',
  kk: 'Қазақша',
} as const;

onLanguageChange((language) => {
  document.querySelectorAll<HTMLSelectElement>('.language-switcher__select').forEach((select) => {
    select.value = language;
  });
});

export function createLanguageSwitcher(className = '', languageId = 'language-id'): HTMLElement {
  const switcher = createElement('label', `language-switcher ${className}`.trim());
  const label = createElement('span', 'language-switcher__label', 'Select language');
  const select = createElement(
    'select',
    'language-switcher__select',
    '',
    languageId,
  ) as HTMLSelectElement;
  select.setAttribute('aria-label', label.textContent ?? 'Select language');

  for (const language of supportedLanguages) {
    const option = createElement('option', '', languageNames[language]) as HTMLOptionElement;
    option.value = language;
    option.lang = language;
    select.append(option);
  }

  select.value = getCurrentLanguage();
  switcher.append(label, select);

  select.addEventListener('change', () => {
    const selectedLanguage = supportedLanguages.find((language) => language === select.value);
    if (!selectedLanguage) {
      select.value = getCurrentLanguage();
      return;
    }

    void changeLanguage(selectedLanguage).catch((error: unknown) => {
      select.value = getCurrentLanguage();
      console.error('Failed to change the application language.', error);
    });
  });

  return switcher;
}
