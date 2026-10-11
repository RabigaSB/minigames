import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchLeaderboard } from '../utils/api';
import { createLeaderboard } from './leaderboard';
import { createPagination } from './pagination';
import { createSortDropdown } from './sort-dropdown';
import { showSnackbar } from '../utils/snackbar';

vi.mock('../utils/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/api')>()),
  fetchLeaderboard: vi.fn(),
}));

describe('pagination controls', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
  });

  it('renders page windows, updates page state, and disables boundary controls', () => {
    const onPageChange = vi.fn<(page: number) => void>();
    const pagination = createPagination(onPageChange, 4) as HTMLElement & {
      updatePagination(total: number, page: number): void;
    };
    document.body.append(pagination);
    pagination.updatePagination(10, 4);

    expect(pagination.querySelectorAll('.pagination__page-btn')).toHaveLength(4);
    expect(pagination.querySelector('#pagination__page-btn-4')?.classList.contains('active')).toBe(
      true,
    );

    pagination.querySelector<HTMLButtonElement>('.pagination__arrow--next')!.click();
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    pagination.querySelector<HTMLButtonElement>('.pagination__arrow--prev')!.click();
    expect(onPageChange).toHaveBeenLastCalledWith(4);

    pagination.updatePagination(1, 1);
    expect(pagination.querySelectorAll('.pagination__page-btn')).toHaveLength(1);
    expect(pagination.querySelector<HTMLButtonElement>('.pagination__arrow--prev')!.disabled).toBe(
      true,
    );
    expect(pagination.querySelector<HTMLButtonElement>('.pagination__arrow--next')!.disabled).toBe(
      true,
    );
  });

  it('uses the mobile page-window size and ignores out-of-range clicks', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const onPageChange = vi.fn<(page: number) => void>();
    const pagination = createPagination(onPageChange, 1) as HTMLElement & {
      updatePagination(total: number, page: number): void;
    };
    pagination.updatePagination(8, 1);
    expect(pagination.querySelectorAll('.pagination__page-btn')).toHaveLength(3);

    pagination.querySelector<HTMLButtonElement>('#pagination__page-btn-1')!.click();
    expect(onPageChange).toHaveBeenCalledWith(1);
    pagination.querySelector<HTMLButtonElement>('#pagination__page-btn-3')!.click();
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });
});

describe('sort dropdown', () => {
  afterEach(() => document.body.replaceChildren());

  it('toggles its menu, changes the active sort, and closes after document click', () => {
    const onSort = vi.fn<(value: string) => void>();
    const dropdown = createSortDropdown(onSort, 'name-desc');
    document.body.append(dropdown);
    const button = dropdown.querySelector('button')!;
    const menu = dropdown.querySelector('ul')!;

    expect(button.textContent).toBe('Sort by: Name Z→A');
    button.click();
    expect(menu.classList.contains('sort-dropdown__menu--hidden')).toBe(false);
    [...dropdown.querySelectorAll('.sort-dropdown__item')][0].dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(onSort).toHaveBeenCalledWith('rating-asc');
    expect(button.textContent).toBe('Sort by: Rating ↑');
    expect(menu.querySelector('.sort-dropdown__item--active')?.textContent).toBe('Rating ↑');

    button.click();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menu.classList.contains('sort-dropdown__menu--hidden')).toBe(true);
  });
});

describe('leaderboard', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.clearAllMocks();
  });
  afterEach(() => document.body.replaceChildren());

  it('renders loading then leaderboard rows, initials, and formatted fields', async () => {
    vi.mocked(fetchLeaderboard).mockResolvedValue([
      {
        rank: 1,
        playerName: 'alice_smith',
        gamesPlayed: 9,
        totalScore: 12_500,
        streakDays: 1,
        favoriteGameSlug: 'sample',
        favoriteGameName: 'Sample Game',
      },
    ]);
    const section = createLeaderboard();
    document.body.append(section);
    const wrapper = section.querySelector('.leaderboard__content-wrapper')!;
    expect(wrapper.textContent).toContain('Loading');

    await vi.waitFor(() => expect(wrapper.querySelector('.leaderboard__row')).not.toBeNull());
    expect(wrapper.querySelector('.leaderboard__avatar')?.textContent).toBe('AS');
    expect(wrapper.textContent).toContain('12,500');
    expect(wrapper.textContent).toContain('1 day');
  });

  it('renders an empty state for an empty leaderboard', async () => {
    vi.mocked(fetchLeaderboard).mockResolvedValue([]);
    const section = createLeaderboard();
    document.body.append(section);
    await vi.waitFor(() =>
      expect(section.querySelector('.leaderboard__empty')?.textContent).toContain('No leaderboard'),
    );
  });

  it('renders an error state and retries loading on request', async () => {
    vi.mocked(fetchLeaderboard)
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce([]);
    const section = createLeaderboard();
    document.body.append(section);
    await vi.waitFor(() =>
      expect(section.querySelector('.leaderboard__error-text')?.textContent).toContain(
        'Unavailable',
      ),
    );
    section.querySelector<HTMLButtonElement>('.leaderboard__retry-btn')!.click();
    await vi.waitFor(() => expect(section.querySelector('.leaderboard__empty')).not.toBeNull());
    expect(fetchLeaderboard).toHaveBeenCalledTimes(2);
  });
});

describe('snackbar notifications', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('renders the selected variant and dismisses after the timeout', async () => {
    vi.useFakeTimers();
    showSnackbar('Saved', 'success');
    const snackbar = document.querySelector('.snackbar')!;
    expect(snackbar.textContent).toBe('Saved');
    expect(snackbar.classList.contains('snackbar--success')).toBe(true);
    await vi.advanceTimersByTimeAsync(3_100);
    expect(snackbar.classList.contains('snackbar--visible')).toBe(false);
    await vi.advanceTimersByTimeAsync(300);
    expect(document.querySelector('.snackbar')).toBeNull();
  });
});
