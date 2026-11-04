import i18next from 'i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import kk from './locales/kk.json';

export const supportedLanguages = ['en', 'ru', 'kk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const i18n = i18next;

export const i18nReady = i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    kk: { translation: kk },
  },
});
