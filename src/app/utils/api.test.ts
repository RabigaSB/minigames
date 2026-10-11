import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CommentSubmissionError,
  fetchCategories,
  fetchGameComments,
  fetchGameDetails,
  fetchGames,
  fetchLeaderboard,
  submitGameComment,
  toggleCommentLike,
  toggleGameFavorite,
} from './api';

const API_BASE = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('game API requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches personalized game details and URL-encodes identity and slug', async () => {
    const payload = { data: { slug: 'game/name' } };
    const fetchMock = mockFetch(jsonResponse(payload));

    await expect(fetchGameDetails('game/name', 'a+b@example.com')).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/games/game%2Fname?userEmail=a%2Bb%40example.com`,
    );
  });

  it('omits the identity query for guest game-details requests', async () => {
    const fetchMock = mockFetch(jsonResponse({ data: {} }));

    await fetchGameDetails('sample-game');

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/games/sample-game`);
  });

  it('posts a favorite toggle with the active session email', async () => {
    const payload = { data: { isFavorited: true, likesCount: 4 } };
    const fetchMock = mockFetch(jsonResponse(payload));

    await expect(toggleGameFavorite('sample-game', 'user@example.com')).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/games/sample-game/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: 'user@example.com' }),
    });
  });

  it('requests latest personalized comments with required pagination options', async () => {
    const fetchMock = mockFetch(jsonResponse({ data: [], meta: { totalComments: 0 } }));

    await fetchGameComments('sample-game', 'a+b@example.com');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/games/sample-game/comments?limit=3&sort=newest&userEmail=a%2Bb%40example.com`,
    );
  });

  it('posts comment-like toggles with the active session email', async () => {
    const payload = {
      data: { commentId: 'comment/id', isLikedByCurrentUser: true, likesCount: 2 },
    };
    const fetchMock = mockFetch(jsonResponse(payload));

    await expect(toggleCommentLike('comment/id', 'user@example.com')).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/comments/comment%2Fid/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: 'user@example.com' }),
    });
  });

  it('accepts a created comment response with status 201', async () => {
    const fetchMock = mockFetch(jsonResponse({ data: { commentId: 'id' } }, 201));

    await expect(
      submitGameComment('sample-game', {
        userEmail: 'user@example.com',
        authorName: 'Player',
        text: 'Nice game!',
      }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('marks network failures during comment submission as an unknown outcome', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Network unavailable'));
    vi.stubGlobal('fetch', fetchMock);

    const submission = submitGameComment('sample-game', {
      userEmail: 'user@example.com',
      authorName: 'Player',
      text: 'Nice game!',
    });

    await expect(submission).rejects.toBeInstanceOf(CommentSubmissionError);
    await expect(submission).rejects.toMatchObject({ outcomeUnknown: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('reports definitive client-side comment rejection as retryable', async () => {
    mockFetch(jsonResponse({ error: 'Invalid comment' }, 400));

    await expect(
      submitGameComment('sample-game', {
        userEmail: 'user@example.com',
        authorName: 'Player',
        text: '',
      }),
    ).rejects.toMatchObject({
      message: 'Invalid comment',
      outcomeUnknown: false,
    });
  });

  it('reports server errors during comment submission as an unknown outcome', async () => {
    mockFetch(jsonResponse({ error: 'Server error' }, 500));

    await expect(
      submitGameComment('sample-game', {
        userEmail: 'user@example.com',
        authorName: 'Player',
        text: 'Nice game!',
      }),
    ).rejects.toMatchObject({
      message: 'Server error',
      outcomeUnknown: true,
    });
  });

  it('fetches categories and leaderboard data from their response envelopes', async () => {
    const categories = { data: [{ slug: 'puzzle', label: 'Puzzle', isDefault: true }], meta: {} };
    mockFetch(jsonResponse(categories));
    await expect(fetchCategories()).resolves.toEqual(categories);

    const players = [{ rank: 1, playerName: 'Player' }];
    mockFetch(jsonResponse({ data: players }));
    await expect(fetchLeaderboard()).resolves.toEqual(players);
  });

  it('builds game-list query parameters including false values', async () => {
    const payload = { data: [], meta: {} };
    const fetchMock = mockFetch(jsonResponse(payload));

    await expect(
      fetchGames({ featured: false, page: 2, limit: 6, category: 'puzzle games', sort: 'name-asc' }),
    ).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/games?featured=false&page=2&limit=6&category=puzzle+games&sort=name-asc`,
    );
  });

  it.each([
    ['details', () => fetchGameDetails('bad-game')],
    ['favorites', () => toggleGameFavorite('bad-game', 'user@example.com')],
    ['comments', () => fetchGameComments('bad-game')],
    ['comment likes', () => toggleCommentLike('bad-id', 'user@example.com')],
    ['categories', () => fetchCategories()],
    ['leaderboard', () => fetchLeaderboard()],
    ['games', () => fetchGames()],
  ])('surfaces server error messages for %s', async (_label, request) => {
    mockFetch(jsonResponse({ error: 'Service unavailable' }, 503));
    await expect(request()).rejects.toThrow('Service unavailable');
  });

  it('falls back to HTTP status when an error response is not JSON', async () => {
    const response = new Response('not-json', { status: 502 });
    mockFetch(response);
    await expect(fetchGames()).rejects.toThrow('HTTP Error: 502');
  });
});
