import { describe, expect, it } from 'vitest';
import { formatRelativeTime, formatToK } from './formatters';

describe('formatToK', () => {
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

  it.each([
    ['2026-01-01T00:00:00Z', 'just now'],
    ['2025-12-31T23:30:00Z', '30 min ago'],
    ['2025-12-31T22:00:00Z', '2 hours ago'],
    ['2025-12-29T00:00:00Z', '3 days ago'],
    ['2025-12-11T00:00:00Z', '3 weeks ago'],
    ['2025-11-02T00:00:00Z', '2 months ago'],
    ['2024-01-01T00:00:00Z', '2 years ago'],
  ])('formats %s as %s', (timestamp, expected) => {
    expect(formatRelativeTime(timestamp, now)).toBe(expected);
  });

  it('treats future values as just now', () => {
    expect(formatRelativeTime('2026-01-02T00:00:00Z', now)).toBe('just now');
  });

  it('handles invalid timestamps', () => {
    expect(formatRelativeTime('not-a-date', now)).toBe('Unknown time');
  });
});
