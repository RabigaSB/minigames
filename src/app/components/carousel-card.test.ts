import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGames } from '../utils/api';
import { createNewGamesSection } from './carousel-card';

vi.mock('../utils/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/api')>()),
  fetchGames: vi.fn(),
}));
vi.mock('../utils/snackbar', () => ({ showSnackbar: vi.fn() }));

const featuredGames = [
  {
    slug: 'one',
    name: 'One',
    category: 'Puzzle',
    price: 'Free',
    shortDescription: 'One game',
    rating: 4,
    likesCount: 1_250,
    cardImage: '/one.png',
  },
  {
    slug: 'two',
    name: 'Two',
    category: 'Arcade',
    price: '$2',
    shortDescription: 'Two game',
    rating: 3,
    likesCount: 50,
    cardImage: 'two.png',
  },
];

class ResizeObserverMock {
  private callback: ResizeObserverCallback;

  observe = vi.fn((target: Element) => {
    this.callback([{ contentRect: { width: 300 }, target } as ResizeObserverEntry], this as never);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
}

describe('featured games carousel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.clearAllMocks();
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.mocked(fetchGames).mockResolvedValue({ data: featuredGames } as never);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('loads featured games, formats cards, moves slides, and selects a game', async () => {
    vi.useFakeTimers();
    const onGameSelected = vi.fn<(slug: string) => void>();
    const section = createNewGamesSection(onGameSelected);
    document.body.append(section);
    await vi.waitFor(() => expect(section.querySelectorAll('.carousel__card')).toHaveLength(2));

    expect(fetchGames).toHaveBeenCalledWith({ featured: true });
    expect(section.querySelector('.carousel__likes')?.textContent).toBe('1.3K');
    expect(section.querySelector('.carousel__card')?.classList.contains(
      'carousel__card--info-enabled',
    )).toBe(true);

    const track = section.querySelector<HTMLElement>('.carousel__container')!;
    const firstCard = track.firstElementChild;
    section.querySelector<HTMLImageElement>('.carousel__arrow--forward')!.click();
    expect(track.lastElementChild).toBe(firstCard);
    section.querySelector<HTMLImageElement>('.carousel__arrow--backward')!.click();
    expect(track.firstElementChild).toBe(firstCard);

    track.querySelector('.carousel__card')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onGameSelected).toHaveBeenCalledWith('one');
  });

  it('renders an empty-state message when there are no featured games', async () => {
    vi.mocked(fetchGames).mockResolvedValueOnce({ data: [] } as never);
    const section = createNewGamesSection(vi.fn());
    document.body.append(section);

    await vi.waitFor(() => expect(section.querySelector('.carousel__empty-banner')).not.toBeNull());
  });

  it('renders an error banner and retries the featured request', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchGames)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce({ data: featuredGames } as never);
    const section = createNewGamesSection(vi.fn());
    document.body.append(section);

    await vi.waitFor(() => expect(section.querySelector('.carousel__error-banner')).not.toBeNull());
    section.querySelector<HTMLButtonElement>('.carousel__retry-btn')!.click();
    await vi.waitFor(() => expect(section.querySelector('.carousel__card')).not.toBeNull());
    expect(fetchGames).toHaveBeenCalledTimes(2);
  });

  it('supports touch swipe navigation and pauses/resumes autoplay', async () => {
    vi.useFakeTimers();
    const section = createNewGamesSection(vi.fn());
    document.body.append(section);
    await vi.waitFor(() => expect(section.querySelectorAll('.carousel__card')).toHaveLength(2));

    const track = section.querySelector<HTMLElement>('.carousel__container')!;
    const firstCard = track.firstElementChild;
    const touchStart = new Event('touchstart');
    Object.defineProperty(touchStart, 'touches', { value: [{ clientX: 200 }] });
    track.dispatchEvent(touchStart);
    const touchMove = new Event('touchmove');
    Object.defineProperty(touchMove, 'touches', { value: [{ clientX: 100 }] });
    track.dispatchEvent(touchMove);
    track.dispatchEvent(new Event('touchend'));
    expect(track.lastElementChild).toBe(firstCard);
  });
});
