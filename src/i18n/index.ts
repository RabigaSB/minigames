import i18next, { type TOptions } from 'i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import kk from './locales/kk.json';

export const supportedLanguages = ['en', 'ru', 'kk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

type TranslationResource = typeof en;
type NestedKey<T> = {
  [Key in keyof T & string]: T[Key] extends string
    ? Key
    : T[Key] extends Record<string, unknown>
      ? `${Key}.${NestedKey<T[Key]>}`
      : never;
}[keyof T & string];

type PluralBase<Key extends string> =
  Key extends `${infer Base}_${'zero' | 'one' | 'two' | 'few' | 'many' | 'other'}` ? Base : never;

type ResourceKey = NestedKey<TranslationResource>;
export type TranslationKey = ResourceKey | PluralBase<ResourceKey>;

const i18nReady = i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    kk: { translation: kk },
  },
});

export function t(key: TranslationKey, options?: TOptions): string {
  return i18next.t(key, { ...options, returnObjects: false });
}

export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  await i18nReady;
  await i18next.changeLanguage(language);
}

export function getCurrentLanguage(): SupportedLanguage {
  const language = i18next.resolvedLanguage ?? i18next.language;
  const baseLanguage = language.split('-')[0];

  return supportedLanguages.find((supportedLanguage) => supportedLanguage === baseLanguage) ?? 'en';
}

export function onLanguageChange(listener: (language: SupportedLanguage) => void): () => void {
  const handleLanguageChange = (language: string): void => {
    const baseLanguage = language.split('-')[0];
    const supportedLanguage = supportedLanguages.find((candidate) => candidate === baseLanguage);

    if (supportedLanguage) listener(supportedLanguage);
  };

  i18next.on('languageChanged', handleLanguageChange);
  return () => i18next.off('languageChanged', handleLanguageChange);
}

export { i18nReady };
