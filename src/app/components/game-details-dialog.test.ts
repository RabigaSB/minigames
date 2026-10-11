import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../../services/app-session';
import {
  fetchGameComments,
  fetchGameDetails,
  submitGameComment,
  toggleCommentLike,
  toggleGameFavorite,
} from '../utils/api';
import { createGameDetailsDialog } from './game-details-dialog';

vi.mock('../utils/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/api')>()),
  fetchGameComments: vi.fn(),
  fetchGameDetails: vi.fn(),
  submitGameComment: vi.fn(),
  toggleCommentLike: vi.fn(),
  toggleGameFavorite: vi.fn(),
}));
vi.mock('../utils/snackbar', () => ({ showSnackbar: vi.fn() }));

const game = {
  slug: 'sample-game',
  name: 'Sample Game',
  heroImage: '/sample.png',
  rating: 4.5,
  likesCount: 1_250,
  isLikedByCurrentUser: false,
  fullDescription: 'A pleasant game.',
  specs: { genre: 'Puzzle', players: '1', duration: '10 min', price: 'Free' },
  topRecords: [],
};

const comment = {
  commentId: 'comment-id',
  authorName: ' Alice Example ',
  text: '<script>not html</script>',
  likesCount: 3,
  isLikedByCurrentUser: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const session: AppSession = {
  displayName: 'Player Name',
  email: 'player@example.com',
  authenticatedAt: Date.now(),
};

describe('game details dialog', () => {
  let currentSession: AppSession | null;
  let onAuthRequired: ReturnType<typeof vi.fn<() => void>>;
  let onGameChange: ReturnType<typeof vi.fn<(slug: string | null) => void>>;

  beforeEach(() => {
    document.body.replaceChildren();
    vi.clearAllMocks();
    currentSession = session;
    onAuthRequired = vi.fn<() => void>();
    onGameChange = vi.fn<(slug: string | null) => void>();
    vi.mocked(fetchGameDetails).mockResolvedValue({ data: game });
    vi.mocked(fetchGameComments).mockResolvedValue({
      data: [comment],
      meta: { totalComments: 9, returnedCount: 1, sort: 'newest' },
    });
    vi.mocked(toggleGameFavorite).mockResolvedValue({
      data: { isFavorited: true, likesCount: 1_251 },
    });
    vi.mocked(toggleCommentLike).mockResolvedValue({
      data: { commentId: 'comment-id', isLikedByCurrentUser: true, likesCount: 4 },
    });
    vi.mocked(submitGameComment).mockResolvedValue();
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  async function openDialog(slug = 'sample-game') {
    const dialog = createGameDetailsDialog(onGameChange, undefined, {
      getSession: () => currentSession,
      onAuthRequired,
    });
    document.body.append(dialog);
    dialog.openGame(slug);
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-dialog__title')?.textContent).toBe('Sample Game'),
    );
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-dialog__comment-card')).not.toBeNull(),
    );
    return dialog;
  }

  it('loads personalized details/comments and renders comment text safely', async () => {
    const dialog = await openDialog();

    expect(fetchGameDetails).toHaveBeenCalledWith('sample-game', session.email);
    expect(fetchGameComments).toHaveBeenCalledWith('sample-game', session.email);
    expect(
      dialog.querySelector('.game-dialog__comments-section .game-dialog__section-title')
        ?.textContent,
    ).toContain('Comments (9)');
    expect(dialog.querySelector('.game-dialog__comment-text')?.textContent).toBe(comment.text);
    expect(dialog.querySelector('.game-dialog__comment-text script')).toBeNull();
  });

  it('shows the guest auth prompt when a guest likes a game', async () => {
    currentSession = null;
    const dialog = await openDialog();
    dialog.querySelector<HTMLButtonElement>('.game-dialog__favorite-btn')!.click();

    expect(onAuthRequired).toHaveBeenCalledOnce();
    expect(toggleGameFavorite).not.toHaveBeenCalled();
  });

  it('updates favorites from the server response and unlocks the control', async () => {
    const dialog = await openDialog();
    const button = dialog.querySelector<HTMLButtonElement>('.game-dialog__favorite-btn')!;
    button.click();
    await vi.waitFor(() => expect(button.classList.contains('active')).toBe(true));

    expect(toggleGameFavorite).toHaveBeenCalledWith('sample-game', session.email);
    expect(dialog.querySelector('.game-dialog__likes')?.textContent).toBe('1.3K');
    expect(button.disabled).toBe(false);
  });

  it('restores favorite UI after API failure', async () => {
    vi.mocked(toggleGameFavorite).mockRejectedValue(new Error('Unavailable'));
    const dialog = await openDialog();
    const button = dialog.querySelector<HTMLButtonElement>('.game-dialog__favorite-btn')!;
    button.click();
    await vi.waitFor(() => expect(button.disabled).toBe(false));

    expect(button.classList.contains('active')).toBe(false);
    expect(dialog.querySelector('.game-dialog__favorite-btn-text')?.textContent).toBe(
      'Add to Favorites',
    );
  });

  it('submits a trimmed comment and refreshes latest comments', async () => {
    const dialog = await openDialog();
    const input = dialog.querySelector<HTMLTextAreaElement>('.game-dialog__comment-input')!;
    input.value = '  A nice game!  ';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await vi.waitFor(() => expect(submitGameComment).toHaveBeenCalledOnce());

    expect(submitGameComment).toHaveBeenCalledWith('sample-game', {
      userEmail: session.email,
      authorName: 'Player Name',
      text: 'A nice game!',
    });
    expect(input.value).toBe('');
    expect(fetchGameComments).toHaveBeenCalledTimes(2);
  });

  it('retains comment text after a definitive failure', async () => {
    vi.mocked(submitGameComment).mockRejectedValue(new Error('Rejected'));
    const dialog = await openDialog();
    const input = dialog.querySelector<HTMLTextAreaElement>('.game-dialog__comment-input')!;
    input.value = 'Retain this';
    dialog.querySelector<HTMLButtonElement>('.game-dialog__send-btn')!.click();
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-dialog__comment-submit-status')?.textContent).toContain(
        'Could not post comment',
      ),
    );

    expect(input.value).toBe('Retain this');
    expect(input.disabled).toBe(false);
  });

  it('rejects empty and over-limit comments without dispatching a request', async () => {
    const dialog = await openDialog();
    const input = dialog.querySelector<HTMLTextAreaElement>('.game-dialog__comment-input')!;
    const send = dialog.querySelector<HTMLButtonElement>('.game-dialog__send-btn')!;

    input.value = '   ';
    send.click();
    expect(dialog.querySelector('.game-dialog__comment-submit-status')?.textContent).toContain(
      'Write a comment',
    );
    input.value = 'x'.repeat(501);
    send.click();
    expect(dialog.querySelector('.game-dialog__comment-submit-status')?.textContent).toContain(
      '500 characters',
    );
    expect(submitGameComment).not.toHaveBeenCalled();
  });

  it('requires authentication before posting or liking a comment', async () => {
    currentSession = null;
    const dialog = await openDialog();
    const input = dialog.querySelector<HTMLTextAreaElement>('.game-dialog__comment-input')!;
    expect(input.disabled).toBe(true);

    const likeButton = dialog.querySelector<HTMLButtonElement>('.game-dialog__comment-like')!;
    likeButton.click();

    expect(onAuthRequired).toHaveBeenCalledOnce();
    expect(toggleCommentLike).not.toHaveBeenCalled();
  });

  it('updates comment-like state from server response', async () => {
    const dialog = await openDialog();
    const button = dialog.querySelector<HTMLButtonElement>('.game-dialog__comment-like')!;
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe('4'));

    expect(toggleCommentLike).toHaveBeenCalledWith('comment-id', session.email);
    expect(button.classList.contains('active')).toBe(true);
  });

  it('restores the prior like state after a failed comment-like request', async () => {
    vi.mocked(toggleCommentLike).mockRejectedValue(new Error('Unavailable'));
    const dialog = await openDialog();
    const button = dialog.querySelector<HTMLButtonElement>('.game-dialog__comment-like')!;
    button.click();
    await vi.waitFor(() => expect(button.disabled).toBe(false));

    expect(button.textContent).toBe('3');
    expect(button.classList.contains('active')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  it('clears form and hides the dialog when closed', async () => {
    const dialog = await openDialog();
    const input = dialog.querySelector<HTMLTextAreaElement>('.game-dialog__comment-input')!;
    input.value = 'draft';
    dialog.closeGame();

    expect(dialog.classList.contains('game-dialog--open')).toBe(false);
    expect(input.value).toBe('');
    expect(onGameChange).toHaveBeenLastCalledWith(null);
  });

  it('renders game and comment loading errors with retry controls', async () => {
    vi.mocked(fetchGameDetails).mockRejectedValueOnce(new Error('Game unavailable'));
    vi.mocked(fetchGameComments).mockRejectedValueOnce(new Error('Comments unavailable'));
    const dialog = createGameDetailsDialog(onGameChange, undefined, {
      getSession: () => currentSession,
      onAuthRequired,
    });
    document.body.append(dialog);
    dialog.openGame('sample-game');
    await vi.waitFor(() =>
      expect(dialog.querySelector('.game-dialog__state--error')).not.toBeNull(),
    );
    expect(dialog.querySelectorAll('.game-dialog__retry').length).toBeGreaterThan(0);
    dialog.dispose();
  });
});
