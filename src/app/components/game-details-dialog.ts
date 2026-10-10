import { createElement } from '../create-element';
import {
  fetchGameComments,
  fetchGameDetails,
  toggleGameFavorite,
  submitGameComment,
  CommentSubmissionError,
  type GameComment,
  type GameDetails,
} from '../utils/api';
import { formatRelativeTime, formatToK } from '../utils/formatters';
import { showSnackbar } from '../utils/snackbar';
import type { AppSession } from '../../services/app-session';

export interface GameDetailsDialog extends HTMLElement {
  openGame(slug: string, syncUrl?: boolean): void;
  closeGame(syncUrl?: boolean): void;
  dispose(): void;
}

export interface GameDetailsDialogOptions {
  getSession?: () => AppSession | null;
  onAuthRequired?: () => void;
}

export function createGameDetailsDialog(
  onGameChange: (slug: string | null) => void = () => undefined,
  initialSlug?: string,
  options: GameDetailsDialogOptions = {},
): GameDetailsDialog {
  const dialog = Object.assign(createElement('div', 'game-dialog'), {
    openGame: (slug: string, syncUrl?: boolean): void => {
      void slug;
      void syncUrl;
    },
    closeGame: (syncUrl?: boolean): void => void syncUrl,
    dispose: (): void => undefined,
  });

  const content = createElement('div', 'game-dialog__content');

  //hero section
  const closeBtn = createElement('button', 'game-dialog__close');
  closeBtn.type = 'button';

  const hero = createElement('div', 'game-dialog__hero');
  const image = createElement('img', 'game-dialog__image');
  hero.append(image, closeBtn);

  const state = createElement('div', 'game-dialog__state');
  state.setAttribute('role', 'status');
  state.setAttribute('aria-live', 'polite');

  //info section
  const infoSection = createElement('section', 'game-dialog__info');

  const topRow = createElement('div', 'game-dialog__top-row');
  const title = createElement('h2', 'game-dialog__title');
  const stats = createElement('div', 'game-dialog__stats');
  const rating = createElement('span', 'game-dialog__rating');
  const likes = createElement('span', 'game-dialog__likes');
  stats.append(rating, likes);
  topRow.append(title, stats);

  const description = createElement('p', 'game-dialog__description');
  const badges = createElement('div', 'game-dialog__badges');

  const actionsRow = createElement('div', 'game-dialog__actions');
  const playNowBtn = createElement('button', 'game-dialog__play-btn', 'Play Now');
  playNowBtn.type = 'button';

  const favoriteBtn = createElement('button', 'game-dialog__favorite-btn');
  favoriteBtn.type = 'button';
  const favoriteBtnText = createElement(
    'span',
    'game-dialog__favorite-btn-text',
    'Add to Favorites',
  );

  favoriteBtn.append(favoriteBtnText);

  actionsRow.append(playNowBtn, favoriteBtn);

  infoSection.append(topRow, description, badges, actionsRow);

  //records section
  const recordsSection = createElement('section', 'game-dialog__records-section');
  const recordsTitleIcon = createElement('span', 'game-dialog__title-icon', '🏆');
  const recordsTitle = createElement('h3', 'game-dialog__section-title', 'Top Records');
  const recordsList = createElement('div', 'game-dialog__records-list');
  recordsTitle.prepend(recordsTitleIcon);

  recordsSection.append(recordsTitle, recordsList);

  // Comments Section
  const commentsSection = createElement('div', 'game-dialog__comments-section');
  const commentsTitle = createElement('h3', 'game-dialog__section-title', 'Comments (0)');

  const commentForm = createElement('div', 'game-dialog__comment-form');
  const userAvatar = createElement('div', 'game-dialog__avatar', '');
  userAvatar.setAttribute('aria-hidden', 'true');
  const commentInput = createElement(
    'textarea',
    'game-dialog__comment-input',
  ) as HTMLTextAreaElement;
  commentInput.rows = 2;
  commentInput.placeholder = 'Sign in to write a comment.';
  commentInput.disabled = true;
  commentInput.name = 'game-dialog__comment';
  const sendBtn = createElement('button', 'game-dialog__send-btn');
  sendBtn.type = 'button';
  sendBtn.disabled = true;
  sendBtn.setAttribute('aria-label', 'Send comment');
  const commentSubmissionStatus = createElement('p', 'game-dialog__comment-submit-status');
  commentSubmissionStatus.setAttribute('role', 'status');
  commentSubmissionStatus.setAttribute('aria-live', 'polite');
  commentForm.append(userAvatar, commentInput, sendBtn);

  const commentsList = createElement('div', 'game-dialog__comments-list');
  const commentsState = createElement('div', 'game-dialog__state game-dialog__comments-state');
  commentsState.setAttribute('role', 'status');
  commentsState.setAttribute('aria-live', 'polite');
  commentsState.hidden = true;

  commentsSection.append(
    commentsTitle,
    commentForm,
    commentSubmissionStatus,
    commentsState,
    commentsList,
  );

  //helpers and event listeners
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  const closeDialog = (syncUrl = true) => {
    activeRequest++;
    activeCommentsRequest++;
    dialog.classList.remove('game-dialog--open');
    document.body.classList.remove('dialog-open');
    content.scrollTop = 0;
    commentInput.value = '';
    commentInput.style.height = 'auto';
    commentSubmissionStatus.textContent = '';
    commentSubmissionStatus.classList.remove('game-dialog__comment-submit-status--error');
    favoriteBtn.classList.remove('active');
    favoriteBtnText.textContent = 'Add to Favorites';
    commentsList.querySelectorAll('.game-dialog__comment-like').forEach((btn) => {
      btn.classList.remove('active');
    });
    if (syncUrl) onGameChange(null);
  };

  closeBtn.addEventListener('click', () => closeDialog());

  const handleEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && dialog.classList.contains('game-dialog--open')) {
      closeDialog();
    }
  };
  document.addEventListener('keydown', handleEscape);

  function createBadge(label: string, value: string) {
    const badge = createElement('div', 'game-dialog__badge');

    const title = createElement('p', 'game-dialog__badge-label', label);

    const text = createElement('p', 'game-dialog__badge-value', value);

    badge.append(title, text);

    return badge;
  }

  commentInput.addEventListener('input', () => {
    commentInput.style.height = 'auto';
    commentInput.style.height = `${commentInput.scrollHeight}px`;
  });

  content.append(hero, state, infoSection, recordsSection, commentsSection);
  dialog.append(content);

  const loadedSections = [infoSection, recordsSection, commentsSection];

  const renderState = (kind: 'loading' | 'error' | 'empty', message: string): void => {
    state.replaceChildren();
    state.className = `game-dialog__state game-dialog__state--${kind}`;
    state.hidden = false;
    state.append(createElement('p', 'game-dialog__state-message', message));
    image.hidden = true;
    loadedSections.forEach((section) => {
      section.hidden = true;
    });

    if (kind === 'loading') {
      const skeleton = createElement('div', 'game-dialog__skeleton');
      skeleton.setAttribute('aria-hidden', 'true');
      skeleton.append(
        createElement('span', 'game-dialog__skeleton-line'),
        createElement('span', 'game-dialog__skeleton-line'),
        createElement('span', 'game-dialog__skeleton-line'),
      );
      state.append(skeleton);
    }

    if (kind === 'error') {
      const retryButton = createElement('button', 'game-dialog__retry', 'Retry');
      retryButton.type = 'button';
      retryButton.addEventListener('click', () => void loadGame(currentSlug));
      state.append(retryButton);
    }
  };

  const renderGame = (game: GameDetails): void => {
    title.textContent = game.name;
    rating.textContent = String(game.rating);
    likes.textContent = formatToK(game.likesCount);
    description.textContent = game.fullDescription;
    favoriteBtn.classList.toggle('active', game.isLikedByCurrentUser);
    favoriteBtnText.textContent = game.isLikedByCurrentUser
      ? 'Remove from Favorites'
      : 'Add to Favorites';
    image.src = game.heroImage.startsWith('http')
      ? game.heroImage
      : game.heroImage.startsWith('/')
        ? `.${game.heroImage}`
        : `./${game.heroImage}`;
    image.alt = `${game.name} hero image`;
    image.hidden = false;
    badges.replaceChildren(
      createBadge('Genre', game.specs.genre),
      createBadge('Players', game.specs.players),
      createBadge('Duration', game.specs.duration),
      createBadge('Price', game.specs.price),
    );

    recordsList.replaceChildren();
    if (!game.topRecords?.length) {
      recordsList.append(createElement('p', 'game-dialog__empty', 'No records yet.'));
    } else {
      game.topRecords.forEach((record) => {
        const item = createElement('div', 'game-dialog__record-item');
        const numberWrapper = createElement('div', 'game-dialog__record-wrapper');
        const userWrapper = createElement('div', 'game-dialog__user-wrapper');
        const userRank = createElement('span', 'game-dialog__record-rank', `#${record.position}`);
        const userInfo = createElement('span', 'game-dialog__record-user', record.playerName);
        const scoreInfo = createElement(
          'span',
          'game-dialog__record-score',
          `${record.score.toLocaleString()} pts`,
        );
        const achievedDate = new Date(record.achievedAt);
        const timeInfo = createElement(
          'span',
          'game-dialog__record-time',
          Number.isNaN(achievedDate.getTime())
            ? record.achievedAt
            : achievedDate.toLocaleDateString(),
        );
        userWrapper.append(userRank, userInfo);
        numberWrapper.append(scoreInfo, timeInfo);
        item.append(userWrapper, numberWrapper);
        recordsList.append(item);
      });
    }

    state.hidden = true;
    image.hidden = false;
    loadedSections.forEach((section) => {
      section.hidden = false;
    });
  };

  const renderCommentsState = (kind: 'loading' | 'error' | 'empty', message: string): void => {
    commentsList.replaceChildren();
    commentsState.replaceChildren();
    commentsState.className = `game-dialog__state game-dialog__comments-state game-dialog__state--${kind}`;
    commentsState.hidden = false;
    commentsState.append(createElement('p', 'game-dialog__state-message', message));

    if (kind === 'loading') {
      const skeleton = createElement('div', 'game-dialog__skeleton');
      skeleton.setAttribute('aria-hidden', 'true');
      skeleton.append(
        createElement('span', 'game-dialog__skeleton-line'),
        createElement('span', 'game-dialog__skeleton-line'),
      );
      commentsState.append(skeleton);
    }

    if (kind === 'error') {
      const retryButton = createElement('button', 'game-dialog__retry', 'Retry');
      retryButton.type = 'button';
      retryButton.addEventListener('click', () => void loadComments(currentSlug));
      commentsState.append(retryButton);
    }
  };

  const renderComment = (comment: GameComment): HTMLElement => {
    const card = createElement('article', 'game-dialog__comment-card');
    const cardHeader = createElement('div', 'game-dialog__comment-header');
    const avatarText = comment.authorName.trim().charAt(0).toUpperCase() || '?';
    const avatar = createElement('div', 'game-dialog__comment-avatar', avatarText);
    const userInfo = createElement('div', 'game-dialog__comment-user-info');
    const userName = createElement('span', 'game-dialog__comment-user', comment.authorName);
    const commentTime = createElement(
      'time',
      'game-dialog__comment-time',
      formatRelativeTime(comment.createdAt),
    );
    commentTime.dateTime = comment.createdAt;
    userInfo.append(userName, commentTime);
    cardHeader.append(avatar, userInfo);

    const commentText = createElement('p', 'game-dialog__comment-text', comment.text);
    const cardFooter = createElement('div', 'game-dialog__comment-footer');
    const likes = createElement('span', 'game-dialog__comment-like', String(comment.likesCount));
    likes.classList.toggle('active', comment.isLikedByCurrentUser);
    cardFooter.append(likes);
    card.append(cardHeader, commentText, cardFooter);
    return card;
  };

  let activeCommentsRequest = 0;
  let commentRequestPending = false;

  const updateCommentAccess = (): AppSession | null => {
    const session = options.getSession?.() ?? null;
    const disabled = commentRequestPending || !session;
    commentInput.disabled = disabled;
    sendBtn.disabled = disabled;
    userAvatar.textContent = session?.displayName.trim().charAt(0).toUpperCase() ?? '';
    commentInput.placeholder = session ? 'Write a comment...' : 'Sign in to write a comment.';
    commentForm.setAttribute('aria-disabled', String(!session));
    return session;
  };

  const loadComments = async (slug: string, userEmail?: string): Promise<void> => {
    const requestId = ++activeCommentsRequest;
    commentsTitle.textContent = 'Comments';
    renderCommentsState('loading', 'Loading comments...');

    try {
      const session = options.getSession?.() ?? null;
      const response = await fetchGameComments(slug, userEmail ?? session?.email);
      if (requestId !== activeCommentsRequest) return;

      commentsTitle.textContent = `Comments (${response.meta.totalComments})`;
      commentsState.hidden = true;
      commentsList.replaceChildren();

      if (!response.data.length) {
        renderCommentsState('empty', 'No comments yet.');
        return;
      }

      response.data.forEach((comment) => commentsList.append(renderComment(comment)));
    } catch (error) {
      if (requestId !== activeCommentsRequest) return;
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      renderCommentsState('error', `Could not load comments. ${errorMessage}`);
      showSnackbar(errorMessage, 'error');
    }
  };

  const submitComment = async (): Promise<void> => {
    if (commentRequestPending) return;
    const session = updateCommentAccess();
    if (!session) {
      showSnackbar('Sign in to post a comment.', 'warning');
      options.onAuthRequired?.();
      return;
    }
    const text = commentInput.value.trim();
    if (!text) {
      commentSubmissionStatus.textContent = 'Write a comment before sending.';
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }
    if (text.length > 500) {
      commentSubmissionStatus.textContent = 'Comments must be 500 characters or fewer.';
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }
    const authorName = session.displayName;
    if (authorName.trim().length < 2 || authorName.trim().length > 30) {
      commentSubmissionStatus.textContent =
        'Your profile name must be between 2 and 30 characters to post a comment.';
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }

    commentRequestPending = true;
    commentSubmissionStatus.textContent = 'Sending comment...';
    commentSubmissionStatus.classList.remove('game-dialog__comment-submit-status--error');
    updateCommentAccess();
    sendBtn.setAttribute('aria-busy', 'true');
    try {
      const requestSlug = currentSlug;
      await submitGameComment(requestSlug, {
        userEmail: session.email,
        authorName,
        text,
      });
      if (requestSlug !== currentSlug) return;
      commentInput.value = '';
      commentInput.style.height = 'auto';
      commentSubmissionStatus.textContent = '';
      showSnackbar('Comment posted.', 'success');
      await loadComments(requestSlug, session.email);
    } catch (error) {
      const outcomeUnknown = error instanceof CommentSubmissionError && error.outcomeUnknown;
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit the comment.';
      commentSubmissionStatus.textContent = outcomeUnknown
        ? `Comment result unknown. ${errorMessage}`
        : `Could not post comment. ${errorMessage}`;
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      showSnackbar(
        outcomeUnknown
          ? 'Comment result is unknown. Check the comments before retrying.'
          : errorMessage,
        'error',
      );
    } finally {
      commentRequestPending = false;
      sendBtn.removeAttribute('aria-busy');
      updateCommentAccess();
    }
  };

  sendBtn.addEventListener('click', () => void submitComment());
  commentInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void submitComment();
    }
  });

  let currentSlug = '';
  let activeRequest = 0;
  let favoriteRequestPending = false;
  let currentGame: GameDetails | null = null;

  const loadGame = async (slug: string): Promise<void> => {
    const requestId = ++activeRequest;
    renderState('loading', 'Loading game details...');
    try {
      const session = options.getSession?.() ?? null;
      const response = await fetchGameDetails(slug, session?.email);
      if (requestId !== activeRequest) return;
      if (!response.data) {
        renderState('empty', 'Game details are not available.');
        return;
      }
      currentGame = response.data;
      renderGame(response.data);
    } catch (error) {
      if (requestId !== activeRequest) return;
      const errorMessage = error instanceof Error ? error.message : 'Failed to load game details';
      renderState('error', `Could not load game details. ${errorMessage}`);
      showSnackbar(errorMessage, 'error');
    }
  };

  const updateFavoriteControl = (): void => {
    if (!currentGame) return;
    favoriteBtn.classList.toggle('active', currentGame.isLikedByCurrentUser);
    favoriteBtnText.textContent = currentGame.isLikedByCurrentUser
      ? 'Remove from Favorites'
      : 'Add to Favorites';
    likes.textContent = formatToK(currentGame.likesCount);
  };

  favoriteBtn.addEventListener('click', async () => {
    if (favoriteRequestPending) return;
    const session = options.getSession?.() ?? null;
    if (!session) {
      showSnackbar('Sign in to add games to your favorites.', 'warning');
      options.onAuthRequired?.();
      return;
    }
    if (!currentGame || !currentSlug) return;

    favoriteRequestPending = true;
    favoriteBtn.disabled = true;
    favoriteBtn.setAttribute('aria-busy', 'true');
    favoriteBtnText.textContent = 'Updating...';
    try {
      const requestSlug = currentSlug;
      const response = await toggleGameFavorite(requestSlug, session.email);
      if (
        !response.data ||
        typeof response.data.isFavorited !== 'boolean' ||
        !Number.isFinite(response.data.likesCount)
      ) {
        throw new Error('The server returned an invalid favorite response.');
      }
      if (requestSlug !== currentSlug) return;
      currentGame = {
        ...currentGame,
        isLikedByCurrentUser: response.data.isFavorited,
        likesCount: response.data.likesCount,
      };
      updateFavoriteControl();
      showSnackbar(
        response.data.isFavorited ? 'Added to favorites.' : 'Removed from favorites.',
        'success',
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite.';
      updateFavoriteControl();
      showSnackbar(errorMessage, 'error');
    } finally {
      favoriteRequestPending = false;
      favoriteBtn.disabled = false;
      favoriteBtn.removeAttribute('aria-busy');
    }
  });

  dialog.openGame = (slug: string, syncUrl = true): void => {
    currentSlug = slug;
    commentInput.value = '';
    commentInput.style.height = 'auto';
    commentSubmissionStatus.textContent = '';
    commentSubmissionStatus.classList.remove('game-dialog__comment-submit-status--error');
    updateCommentAccess();
    dialog.classList.add('game-dialog--open');
    document.body.classList.add('dialog-open');
    if (syncUrl) onGameChange(slug);
    void loadGame(slug);
    void loadComments(slug);
  };

  dialog.closeGame = (syncUrl = true): void => closeDialog(syncUrl);
  dialog.dispose = (): void => {
    closeDialog(false);
    document.removeEventListener('keydown', handleEscape);
  };

  if (initialSlug) dialog.openGame(initialSlug, false);

  return dialog;
}
