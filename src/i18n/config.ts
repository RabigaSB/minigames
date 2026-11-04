import i18next from 'i18next';

export const supportedLanguages = ['en', 'ru', 'kk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const i18n = i18next;

export const i18nReady = i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  resources: {
    en: { translation: {} },
    ru: { translation: {} },
    kk: { translation: {} },
  },
});
