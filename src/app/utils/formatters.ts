import { getCurrentLanguage, t } from '../../i18n';

function getIntlLocale(): string {
  const language = getCurrentLanguage();
  return language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getIntlLocale(), options).format(value);
}

export function formatCompactNumber(value: number): string {
  return formatNumber(value, { notation: 'compact', maximumFractionDigits: 1 });
}

export function formatToK(value: number): string {
  return formatCompactNumber(value);
}

export function formatDate(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);

  return new Intl.DateTimeFormat(getIntlLocale()).format(date);
}

export function formatRelativeTime(timestamp: string, now = Date.now()): string {
  const createdAt = new Date(timestamp).getTime();
  if (Number.isNaN(createdAt)) return t('gameDialog.unknownTime');

  const elapsedMilliseconds = Math.max(0, now - createdAt);
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
  if (elapsedMinutes < 1) return t('gameDialog.justNow');
  if (elapsedMinutes < 60) {
    return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
      -elapsedMinutes,
      'minute',
    );
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
      -elapsedHours,
      'hour',
    );
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
      -elapsedDays,
      'day',
    );
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedDays < 28) {
    return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
      -elapsedWeeks,
      'week',
    );
  }

  if (elapsedDays < 365) {
    const elapsedMonths = Math.min(11, Math.max(1, Math.floor(elapsedDays / 30)));
    return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
      -elapsedMonths,
      'month',
    );
  }

  const elapsedYears = Math.max(1, Math.floor(elapsedDays / 365));
  return new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'always' }).format(
    -elapsedYears,
    'year',
  );
}
