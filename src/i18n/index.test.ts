import { afterEach, describe, expect, it } from 'vitest';
import { changeLanguage, t } from './index';

describe('i18next pluralization', () => {
  afterEach(async () => changeLanguage('en'));

  it.each([
    [0, '0 likes', '0 отметок «Нравится»', '0 ұнату'],
    [1, '1 like', '1 отметка «Нравится»', '1 ұнату'],
    [2, '2 likes', '2 отметки «Нравится»', '2 ұнату'],
    [5, '5 likes', '5 отметок «Нравится»', '5 ұнату'],
    [11, '11 likes', '11 отметок «Нравится»', '11 ұнату'],
    [12, '12 likes', '12 отметок «Нравится»', '12 ұнату'],
    [14, '14 likes', '14 отметок «Нравится»', '14 ұнату'],
    [21, '21 likes', '21 отметка «Нравится»', '21 ұнату'],
    [22, '22 likes', '22 отметки «Нравится»', '22 ұнату'],
  ])('selects plural form for count %i', async (count, english, russian, kazakh) => {
    await changeLanguage('en');
    expect(t('gameDialog.likes', { count })).toBe(english);

    await changeLanguage('ru');
    expect(t('gameDialog.likes', { count })).toBe(russian);

    await changeLanguage('kk');
    expect(t('gameDialog.likes', { count })).toBe(kazakh);
  });

  it('pluralizes comments, points, and game counts with locale-specific rules', async () => {
    await changeLanguage('ru');
    expect(t('gameDialog.commentsTitle', { count: 21 })).toBe('21 комментарий');
    expect(t('gameDialog.points', { count: 5 })).toBe('5 очков');
    expect(t('leaderboard.gamesPlayedCount', { count: 2 })).toBe('2 сыгранные игры');
    expect(t('leaderboard.streakDays', { count: 22 })).toBe('22 дня');
    expect(t('gameDialog.commentsTitle', { count: 11 })).toBe('11 комментариев');

    await changeLanguage('kk');
    expect(t('gameDialog.commentsTitle', { count: 21 })).toBe('21 пікір');
    expect(t('leaderboard.gamesPlayedCount', { count: 2 })).toBe('2 ойын ойналды');
  });
});
