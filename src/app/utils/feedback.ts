import type { TranslationKey } from '../../i18n';

export function getFeedbackErrorKey(error: unknown, fallbackKey: TranslationKey): TranslationKey {
  if (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.name === 'NetworkError' || /network|fetch failed|connection/i.test(error.message)))
  ) {
    return 'feedback.networkError';
  }

  return fallbackKey;
}
