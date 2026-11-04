import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { changeLanguage } from '../../i18n';
import {
  formatCompactNumber,
  formatDate,
  formatNumber,
  formatRelativeTime,
  formatToK,
} from './formatters';

describe('formatToK', () => {
  beforeEach(async () => changeLanguage('en'));

  afterEach(async () => changeLanguage('en'));

  it.each([
    [0, '0'],
    [999, '999'],
    [1_000, '1K'],
    [1_250, '1.3K'],
    [12_000, '12K'],
  ])('formats %i as %s', (input, expected) => {
    expect(formatToK(input)).toBe(expected);
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-01-01T00:00:00Z');

  beforeEach(async () => changeLanguage('en'));

  afterEach(async () => changeLanguage('en'));

  it.each([
    ['2026-01-01T00:00:00Z', 'just now', 0],
    ['2025-12-31T23:30:00Z', 'minute', 30],
    ['2025-12-31T22:00:00Z', 'hour', 2],
    ['2025-12-29T00:00:00Z', 'day', 3],
    ['2025-12-11T00:00:00Z', 'week', 3],
    ['2025-11-02T00:00:00Z', 'month', 2],
    ['2024-01-01T00:00:00Z', 'year', 2],
  ] as const)('formats timestamp %s into localized relative time', (timestamp, unit, value) => {
    const expected =
      unit === 'just now'
        ? 'just now'
        : new Intl.RelativeTimeFormat('en-US', { numeric: 'always' }).format(-value, unit);
    expect(formatRelativeTime(timestamp, now)).toBe(expected);
  });

  it('treats future values as just now', () => {
    expect(formatRelativeTime('2026-01-02T00:00:00Z', now)).toBe('just now');
  });

  it('handles invalid timestamps', () => {
    expect(formatRelativeTime('not-a-date', now)).toBe('Unknown time');
  });

  it('uses the active language while retaining the same time units', async () => {
    await changeLanguage('ru');
    expect(formatRelativeTime('2025-12-31T22:00:00Z', now)).toBe(
      new Intl.RelativeTimeFormat('ru-RU', { numeric: 'always' }).format(-2, 'hour'),
    );
    await changeLanguage('kk');
    expect(formatRelativeTime('2025-12-29T00:00:00Z', now)).toBe(
      new Intl.RelativeTimeFormat('kk-KZ', { numeric: 'always' }).format(-3, 'day'),
    );
  });
});

describe('locale-aware number and date formatting', () => {
  afterEach(async () => changeLanguage('en'));

  it.each([
    ['en', 'en-US'],
    ['ru', 'ru-RU'],
    ['kk', 'kk-KZ'],
  ] as const)('formats numbers and dates using %s locale', async (language, locale) => {
    await changeLanguage(language);

    expect(formatNumber(12_500)).toBe(new Intl.NumberFormat(locale).format(12_500));
    expect(formatCompactNumber(1_250)).toBe(
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(1_250),
    );
    expect(formatDate('2026-01-02T00:00:00.000Z')).toBe(
      new Intl.DateTimeFormat(locale).format(new Date('2026-01-02T00:00:00.000Z')),
    );
  });
});
