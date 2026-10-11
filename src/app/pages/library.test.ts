import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCategories, fetchGames } from '../utils/api';
import { createLibraryPage } from './library';

vi.mock('../utils/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/api')>()),
  fetchCategories: vi.fn(),
  fetchGames: vi.fn(),
}));
vi.mock('../utils/snackbar', () => ({ showSnackbar: vi.fn() }));
vi.mock('../components/game-details-dialog', () => ({
  createGameDetailsDialog: vi.fn((onGameChange: (slug: string | null) => void) => {
    const dialog = document.createElement('div');
    dialog.className = 'game-dialog';
    return Object.assign(dialog, {
      openGame: (slug: string) => onGameChange(slug),
      closeGame: () => onGameChange(null),
      dispose: vi.fn(),
    });
  }),
}));

const game = {
  slug: 'sample-game',
  name: 'Sample Game',
  category: 'Puzzle',
  price: 'Free',
  shortDescription: 'A sample description.',
  rating: 4.5,
  likesCount: 1_250,
  cardImage: '/sample.png',
};
const gamesResponse = {
  data: [game],
  meta: { page: 1, limit: 6, totalItems: 1, totalPages: 1, appliedFilter: { category: 'all', sort: 'rating-desc' } },
};
const categoriesResponse = {
  data: [
    { slug: 'all', label: 'All', isDefault: true },
    { slug: 'puzzle', label: 'Puzzle', isDefault: false },
  ],
  meta: { totalItems: 2, description: 'Categories' },
};

describe('library page', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.clearAllMocks();
    vi.mocked(fetchCategories).mockResolvedValue(categoriesResponse);
    vi.mocked(fetchGames).mockResolvedValue(gamesResponse);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
  });
  afterEach(() => document.body.replaceChildren());

  it('loads categories and games, renders cards, and updates route state from controls', async () => {
    const onStateChange = vi.fn();
    const onGameChange = vi.fn();
    const page = createLibraryPage({
      onStateChange,
      onGameChange,
      getSession: () => null,
    });
    document.body.append(page);

    await vi.waitFor(() => expect(page.querySelector('.game-card')).not.toBeNull());
    expect(fetchCategories).toHaveBeenCalledOnce();
    expect(fetchGames).toHaveBeenCalledWith({
      category: 'all',
      page: 1,
      limit: 6,
      sort: 'rating-desc',
    });
    expect(page.querySelector('.game-card__price')?.classList.contains('game-card__price--free'))
      .toBe(true);
    expect(page.querySelector('.game-card__likes')?.textContent).toBe('1.3K');

    page.querySelector<HTMLButtonElement>('.library__chip[data-slug="puzzle"]')!.click();
    await vi.waitFor(() => expect(onStateChange).toHaveBeenCalled());
    expect(onStateChange).toHaveBeenLastCalledWith(
      { category: 'puzzle', sort: 'rating-desc', page: 1 },
      false,
    );

    page.querySelector('.sort-dropdown__button')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    [...page.querySelectorAll('.sort-dropdown__item')][2].dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(onStateChange).toHaveBeenLastCalledWith(
        { category: 'puzzle', sort: 'name-asc', page: 1 },
        false,
      ),
    );

    page.querySelector<HTMLButtonElement>('.game-card__details-btn')!.click();
    expect(onGameChange).toHaveBeenCalledWith('sample-game');
  });

  it('renders empty state when no games match', async () => {
    vi.mocked(fetchGames).mockResolvedValueOnce({
      ...gamesResponse,
      data: [],
      meta: { ...gamesResponse.meta, totalItems: 0 },
    });
    const page = createLibraryPage();
    document.body.append(page);

    await vi.waitFor(() => expect(page.querySelector('.library__empty')).not.toBeNull());
  });

  it('renders a retryable error state when the game list request fails', async () => {
    vi.mocked(fetchGames)
      .mockRejectedValueOnce(new Error('Network issue'))
      .mockResolvedValueOnce(gamesResponse);
    const page = createLibraryPage();
    document.body.append(page);

    await vi.waitFor(() => expect(page.querySelector('.library__error')).not.toBeNull());
    expect(page.querySelector('.library__error-text')?.textContent).toContain('Network issue');
    page.querySelector<HTMLButtonElement>('.library__retry-btn')!.click();
    await vi.waitFor(() => expect(page.querySelector('.game-card')).not.toBeNull());
  });

  it('falls back to all-games chip if categories fail and reconciles server page metadata', async () => {
    vi.mocked(fetchCategories).mockRejectedValueOnce(new Error('No categories'));
    vi.mocked(fetchGames).mockResolvedValueOnce({
      ...gamesResponse,
      meta: { ...gamesResponse.meta, page: 2, totalPages: 4 },
    });
    const onStateChange = vi.fn();
    const page = createLibraryPage({ onStateChange });
    document.body.append(page);

    await vi.waitFor(() => expect(page.querySelector('.library__chip')).not.toBeNull());
    expect(page.querySelector('.library__chip')?.textContent).toBe('All Games');
    expect(onStateChange).toHaveBeenCalledWith(
      { category: 'all', sort: 'rating-desc', page: 2 },
      true,
    );
    page.querySelector<HTMLButtonElement>('.library__chip')!.click();
    await vi.waitFor(() => expect(fetchGames).toHaveBeenCalledTimes(2));
  });
});
