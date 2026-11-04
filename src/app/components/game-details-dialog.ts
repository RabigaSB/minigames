import { createElement } from '../create-element';
import {
  fetchGameComments,
  fetchGameDetails,
  toggleGameFavorite,
  toggleCommentLike,
  submitGameComment,
  CommentSubmissionError,
  type GameComment,
  type GameDetails,
} from '../utils/api';
import { showSnackbar } from '../utils/snackbar';
import type { AppSession } from '../../services/app-session';
import { getCurrentLanguage, onLanguageChange, t, type TranslationKey } from '../../i18n';

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
  closeBtn.setAttribute('aria-label', t('gameDialog.close'));

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
  const playNowBtn = createElement('button', 'game-dialog__play-btn', t('gameDialog.playNow'));
  playNowBtn.type = 'button';

  const favoriteBtn = createElement('button', 'game-dialog__favorite-btn');
  favoriteBtn.type = 'button';
  const favoriteBtnText = createElement(
    'span',
    'game-dialog__favorite-btn-text',
    t('favorites.add'),
  );

  favoriteBtn.append(favoriteBtnText);

  actionsRow.append(playNowBtn, favoriteBtn);

  infoSection.append(topRow, description, badges, actionsRow);

  //records section
  const recordsSection = createElement('section', 'game-dialog__records-section');
  const recordsTitleIcon = createElement('span', 'game-dialog__title-icon', '🏆');
  const recordsTitle = createElement(
    'h3',
    'game-dialog__section-title',
    t('gameDialog.topRecords'),
  );
  const recordsList = createElement('div', 'game-dialog__records-list');
  recordsTitleIcon.setAttribute('aria-hidden', 'true');
  recordsTitle.prepend(recordsTitleIcon);

  recordsSection.append(recordsTitle, recordsList);

  // Comments Section
  const commentsSection = createElement('div', 'game-dialog__comments-section');
  const commentsTitle = createElement(
    'h3',
    'game-dialog__section-title',
    t('gameDialog.commentsTitle', { count: 0 }),
  );

  const commentForm = createElement('div', 'game-dialog__comment-form');
  const userAvatar = createElement('div', 'game-dialog__avatar', '');
  userAvatar.setAttribute('aria-hidden', 'true');
  const commentInput = createElement(
    'textarea',
    'game-dialog__comment-input',
  ) as HTMLTextAreaElement;
  commentInput.rows = 2;
  commentInput.placeholder = t('gameDialog.signInToComment');
  commentInput.disabled = true;
  commentInput.name = 'game-dialog__comment';
  const sendBtn = createElement('button', 'game-dialog__send-btn');
  sendBtn.type = 'button';
  sendBtn.disabled = true;
  sendBtn.setAttribute('aria-label', t('gameDialog.sendComment'));
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

  const translatedBadgeLabels: Array<{ key: TranslationKey; element: HTMLElement }> = [];
  let gameStateKey: TranslationKey | null = null;
  let gameStateDetail = '';
  let commentStateKey: TranslationKey | null = null;
  let commentStateDetail = '';
  let commentsCount = 0;
  let commentSubmissionKey: TranslationKey | null = null;
  let commentSubmissionDetail = '';

  const updateCommentSubmissionStatus = (): void => {
    commentSubmissionStatus.replaceChildren();
    if (!commentSubmissionKey) return;
    appendTranslatedMessage(commentSubmissionStatus, commentSubmissionKey, commentSubmissionDetail);
  };

  const appendTranslatedMessage = (
    element: HTMLElement,
    key: TranslationKey,
    detail = '',
  ): void => {
    element.replaceChildren(createElement('span', '', t(key)));
    if (detail) element.append(document.createTextNode(` ${detail}`));
  };

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
    commentSubmissionKey = null;
    commentSubmissionDetail = '';
    commentSubmissionStatus.classList.remove('game-dialog__comment-submit-status--error');
    favoriteBtn.classList.remove('active');
    favoriteBtnText.textContent = t('favorites.add');
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

  function createBadge(labelKey: TranslationKey, value: string) {
    const badge = createElement('div', 'game-dialog__badge');

    const title = createElement('p', 'game-dialog__badge-label', t(labelKey));
    translatedBadgeLabels.push({ key: labelKey, element: title });

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

  const renderState = (
    kind: 'loading' | 'error' | 'empty',
    messageKey: TranslationKey,
    detail = '',
  ): void => {
    gameStateKey = messageKey;
    gameStateDetail = detail;
    state.replaceChildren();
    state.className = `game-dialog__state game-dialog__state--${kind}`;
    state.hidden = false;
    const stateMessage = createElement('p', 'game-dialog__state-message');
    appendTranslatedMessage(stateMessage, messageKey, detail);
    state.append(stateMessage);
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
      const retryButton = createElement('button', 'game-dialog__retry', t('gameDialog.retry'));
      retryButton.type = 'button';
      retryButton.addEventListener('click', () => void loadGame(currentSlug));
      state.append(retryButton);
    }
  };

  const renderGame = (game: GameDetails): void => {
    title.textContent = game.name;
    rating.dataset.rating = String(game.rating);
    rating.textContent = formatLocalizedNumber(game.rating);
    rating.setAttribute(
      'aria-label',
      t('gameDialog.rating', { rating: formatLocalizedNumber(game.rating) }),
    );
    likes.textContent = formatLocalizedCompactNumber(game.likesCount);
    likes.setAttribute('aria-label', t('gameDialog.likes', { count: game.likesCount }));
    description.textContent = game.fullDescription;
    favoriteBtn.classList.toggle('active', game.isLikedByCurrentUser);
    favoriteBtnText.textContent = game.isLikedByCurrentUser
      ? t('favorites.remove')
      : t('favorites.add');
    image.src = game.heroImage.startsWith('http')
      ? game.heroImage
      : game.heroImage.startsWith('/')
        ? `.${game.heroImage}`
        : `./${game.heroImage}`;
    image.alt = t('gameDialog.heroImageAlt', { name: game.name });
    image.hidden = false;
    translatedBadgeLabels.length = 0;
    badges.replaceChildren(
      createBadge('gameDialog.genre', game.specs.genre),
      createBadge('gameDialog.players', game.specs.players),
      createBadge('gameDialog.duration', game.specs.duration),
      createBadge('gameDialog.price', game.specs.price),
    );

    recordsList.replaceChildren();
    if (!game.topRecords?.length) {
      recordsList.append(createElement('p', 'game-dialog__empty', t('gameDialog.noRecords')));
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
          t('gameDialog.points', { count: record.score }),
        );
        scoreInfo.dataset.score = String(record.score);
        const achievedDate = new Date(record.achievedAt);
        const timeInfo = createElement(
          'span',
          'game-dialog__record-time',
          Number.isNaN(achievedDate.getTime())
            ? record.achievedAt
            : achievedDate.toLocaleDateString(getNumberLocale()),
        );
        timeInfo.dataset.achievedAt = record.achievedAt;
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
    gameStateKey = null;
    gameStateDetail = '';
  };

  const renderCommentsState = (
    kind: 'loading' | 'error' | 'empty',
    messageKey: TranslationKey,
    detail = '',
  ): void => {
    commentStateKey = messageKey;
    commentStateDetail = detail;
    commentsList.replaceChildren();
    commentsState.replaceChildren();
    commentsState.className = `game-dialog__state game-dialog__comments-state game-dialog__state--${kind}`;
    commentsState.hidden = false;
    const stateMessage = createElement('p', 'game-dialog__state-message');
    appendTranslatedMessage(stateMessage, messageKey, detail);
    commentsState.append(stateMessage);

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
      const retryButton = createElement('button', 'game-dialog__retry', t('gameDialog.retry'));
      retryButton.type = 'button';
      retryButton.addEventListener('click', () => void loadComments(currentSlug));
      commentsState.append(retryButton);
    }
  };

  const avatarPalette = ['#e9eef6', '#a3e2c9', '#bce3ff', '#ffc6ff', '#e8dff5'];
  const commentAvatarColors = new Map<string, string>();

  const getStableAvatarColor = (authorName: string): string => {
    const normalizedName = authorName.trim();
    if (!normalizedName) {
      return avatarPalette[0];
    }

    const cachedColor = commentAvatarColors.get(normalizedName);
    if (cachedColor) {
      return cachedColor;
    }

    const color = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
    commentAvatarColors.set(normalizedName, color);
    return color;
  };

  const renderComment = (comment: GameComment): HTMLElement => {
    const card = createElement('article', 'game-dialog__comment-card');
    const cardHeader = createElement('div', 'game-dialog__comment-header');
    const authorName = comment.authorName.trim();
    const avatarText = authorName.charAt(0).toUpperCase() || '?';
    const avatar = createElement('div', 'game-dialog__comment-avatar', avatarText);
    avatar.style.backgroundColor = getStableAvatarColor(comment.authorName);
    const userInfo = createElement('div', 'game-dialog__comment-user-info');
    const userName = createElement('span', 'game-dialog__comment-user', comment.authorName);
    const commentTime = createElement(
      'time',
      'game-dialog__comment-time',
      formatLocalizedRelativeTime(comment.createdAt),
    );
    commentTime.dateTime = comment.createdAt;
    commentTime.dataset.createdAt = comment.createdAt;
    userInfo.append(userName, commentTime);
    cardHeader.append(avatar, userInfo);

    const commentText = createElement('p', 'game-dialog__comment-text', comment.text);
    const cardFooter = createElement('div', 'game-dialog__comment-footer');
    const likes = createElement('button', 'game-dialog__comment-like', String(comment.likesCount));
    likes.type = 'button';
    likes.classList.toggle('active', comment.isLikedByCurrentUser);
    likes.dataset.liked = String(comment.isLikedByCurrentUser);
    likes.setAttribute(
      'aria-label',
      t(comment.isLikedByCurrentUser ? 'gameDialog.unlikeComment' : 'gameDialog.likeComment'),
    );
    likes.disabled = false;
    likes.addEventListener('click', async () => {
      const session = options.getSession?.() ?? null;
      if (!session) {
        showSnackbar(t('gameDialog.signInToLike'), 'warning');
        options.onAuthRequired?.();
        return;
      }

      if (pendingCommentLikes.has(comment.commentId)) return;

      pendingCommentLikes.add(comment.commentId);
      likes.disabled = true;
      likes.setAttribute('aria-busy', 'true');
      likes.textContent = '...';

      try {
        const response = await toggleCommentLike(comment.commentId, session.email);
        likes.classList.toggle('active', response.data.isLikedByCurrentUser);
        likes.dataset.liked = String(response.data.isLikedByCurrentUser);
        likes.textContent = String(response.data.likesCount);
        likes.setAttribute(
          'aria-label',
          t(
            response.data.isLikedByCurrentUser
              ? 'gameDialog.unlikeComment'
              : 'gameDialog.likeComment',
          ),
        );
        showSnackbar(
          t(
            response.data.isLikedByCurrentUser
              ? 'gameDialog.commentLiked'
              : 'gameDialog.commentLikeRemoved',
          ),
          'success',
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('gameDialog.failedToUpdateLike');
        likes.textContent = String(comment.likesCount);
        likes.classList.toggle('active', comment.isLikedByCurrentUser);
        likes.dataset.liked = String(comment.isLikedByCurrentUser);
        showSnackbar(errorMessage, 'error');
      } finally {
        pendingCommentLikes.delete(comment.commentId);
        likes.disabled = false;
        likes.removeAttribute('aria-busy');
      }
    });
    cardFooter.append(likes);
    card.append(cardHeader, commentText, cardFooter);
    return card;
  };

  let activeCommentsRequest = 0;
  let commentRequestPending = false;
  const pendingCommentLikes = new Set<string>();

  const updateCommentAccess = (): AppSession | null => {
    const session = options.getSession?.() ?? null;
    const disabled = commentRequestPending || !session;
    commentInput.disabled = disabled;
    sendBtn.disabled = disabled;
    userAvatar.textContent = session?.displayName.trim().charAt(0).toUpperCase() ?? '';
    commentInput.placeholder = session
      ? t('gameDialog.writeComment')
      : t('gameDialog.signInToComment');
    commentForm.setAttribute('aria-disabled', String(!session));
    return session;
  };

  const handleAppSessionChange = (): void => {
    updateCommentAccess();
    if (dialog.classList.contains('game-dialog--open') && currentSlug) {
      void loadGame(currentSlug);
      void loadComments(currentSlug);
    }
  };
  window.addEventListener('appsessionchange', handleAppSessionChange);

  const loadComments = async (slug: string, userEmail?: string): Promise<void> => {
    const requestId = ++activeCommentsRequest;
    commentsCount = 0;
    commentsTitle.textContent = t('gameDialog.commentsTitle', { count: commentsCount });
    renderCommentsState('loading', 'gameDialog.loadingComments');

    try {
      const session = options.getSession?.() ?? null;
      const response = await fetchGameComments(slug, userEmail ?? session?.email);
      if (requestId !== activeCommentsRequest) return;

      commentsCount = response.meta.totalComments;
      commentsTitle.textContent = t('gameDialog.commentsTitle', { count: commentsCount });
      commentsState.hidden = true;
      commentStateKey = null;
      commentStateDetail = '';
      commentsList.replaceChildren();

      if (!response.data.length) {
        renderCommentsState('empty', 'gameDialog.noComments');
        return;
      }

      response.data.forEach((comment) => commentsList.append(renderComment(comment)));
    } catch (error) {
      if (requestId !== activeCommentsRequest) return;
      const errorMessage =
        error instanceof Error ? error.message : t('gameDialog.commentsLoadError');
      renderCommentsState('error', 'gameDialog.commentsLoadError', errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const submitComment = async (): Promise<void> => {
    if (commentRequestPending) return;
    const session = updateCommentAccess();
    if (!session) {
      showSnackbar(t('gameDialog.signInToComment'), 'warning');
      options.onAuthRequired?.();
      return;
    }
    const text = commentInput.value.trim();
    if (!text) {
      commentSubmissionKey = 'gameDialog.writeBeforeSending';
      commentSubmissionDetail = '';
      updateCommentSubmissionStatus();
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }
    if (text.length > 500) {
      commentSubmissionKey = 'gameDialog.commentTooLong';
      commentSubmissionDetail = '';
      updateCommentSubmissionStatus();
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }
    const profileName = session.displayName.trim();
    const emailName = session.email.split('@')[0]?.trim() ?? '';
    const authorName =
      profileName.length >= 2 && profileName.length <= 30
        ? profileName
        : emailName.length >= 2 && emailName.length <= 30
          ? emailName
          : 'Player';
    if (authorName.trim().length < 2 || authorName.trim().length > 30) {
      commentSubmissionKey = 'gameDialog.invalidProfileName';
      commentSubmissionDetail = '';
      updateCommentSubmissionStatus();
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      return;
    }

    commentRequestPending = true;
    commentSubmissionKey = 'gameDialog.sendingComment';
    commentSubmissionDetail = '';
    updateCommentSubmissionStatus();
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
      commentSubmissionKey = null;
      commentSubmissionDetail = '';
      showSnackbar(t('gameDialog.commentPosted'), 'success');
      await loadComments(requestSlug, session.email);
    } catch (error) {
      const outcomeUnknown = error instanceof CommentSubmissionError && error.outcomeUnknown;
      const errorMessage =
        error instanceof Error ? error.message : t('gameDialog.failedToSubmitComment');
      commentSubmissionKey = outcomeUnknown
        ? 'gameDialog.commentOutcomeUnknown'
        : 'gameDialog.commentPostFailed';
      commentSubmissionDetail = errorMessage;
      updateCommentSubmissionStatus();
      commentSubmissionStatus.classList.add('game-dialog__comment-submit-status--error');
      showSnackbar(
        outcomeUnknown ? t('gameDialog.commentOutcomeUnknownNotice') : errorMessage,
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
    renderState('loading', 'gameDialog.loadingGame');
    try {
      const session = options.getSession?.() ?? null;
      const response = await fetchGameDetails(slug, session?.email);
      if (requestId !== activeRequest) return;
      if (!response.data) {
        renderState('empty', 'gameDialog.gameUnavailable');
        return;
      }
      currentGame = response.data;
      renderGame(response.data);
    } catch (error) {
      if (requestId !== activeRequest) return;
      const errorMessage = error instanceof Error ? error.message : t('gameDialog.gameLoadError');
      renderState('error', 'gameDialog.gameLoadError', errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const updateFavoriteControl = (): void => {
    if (!currentGame) return;
    favoriteBtn.classList.toggle('active', currentGame.isLikedByCurrentUser);
    favoriteBtnText.textContent = currentGame.isLikedByCurrentUser
      ? t('favorites.remove')
      : t('favorites.add');
    likes.textContent = formatLocalizedCompactNumber(currentGame.likesCount);
    likes.setAttribute('aria-label', t('gameDialog.likes', { count: currentGame.likesCount }));
  };

  favoriteBtn.addEventListener('click', async () => {
    if (favoriteRequestPending) return;
    const session = options.getSession?.() ?? null;
    if (!session) {
      showSnackbar(t('gameDialog.signInToFavorite'), 'warning');
      options.onAuthRequired?.();
      return;
    }
    if (!currentGame || !currentSlug) return;

    favoriteRequestPending = true;
    favoriteBtn.disabled = true;
    favoriteBtn.setAttribute('aria-busy', 'true');
    favoriteBtnText.textContent = t('gameDialog.updatingFavorite');
    try {
      const requestSlug = currentSlug;
      const response = await toggleGameFavorite(requestSlug, session.email);
      if (
        !response.data ||
        typeof response.data.isFavorited !== 'boolean' ||
        !Number.isFinite(response.data.likesCount)
      ) {
        throw new Error(t('gameDialog.invalidFavoriteResponse'));
      }
      if (requestSlug !== currentSlug) return;
      currentGame = {
        ...currentGame,
        isLikedByCurrentUser: response.data.isFavorited,
        likesCount: response.data.likesCount,
      };
      updateFavoriteControl();
      showSnackbar(
        response.data.isFavorited
          ? t('gameDialog.addedToFavorites')
          : t('gameDialog.removedFromFavorites'),
        'success',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('gameDialog.failedToUpdateFavorite');
      updateFavoriteControl();
      showSnackbar(errorMessage, 'error');
    } finally {
      favoriteRequestPending = false;
      favoriteBtn.disabled = false;
      favoriteBtn.removeAttribute('aria-busy');
    }
  });

  dialog.openGame = (slug: string, syncUrl = true): void => {
    options.getSession?.();
    currentSlug = slug;
    commentInput.value = '';
    commentInput.style.height = 'auto';
    commentSubmissionStatus.textContent = '';
    commentSubmissionKey = null;
    commentSubmissionDetail = '';
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
    unsubscribeLanguageChange();
    document.removeEventListener('keydown', handleEscape);
    window.removeEventListener('appsessionchange', handleAppSessionChange);
  };

  const unsubscribeLanguageChange = onLanguageChange(() => {
    if (!dialog.isConnected) {
      unsubscribeLanguageChange();
      return;
    }

    closeBtn.setAttribute('aria-label', t('gameDialog.close'));
    playNowBtn.textContent = t('gameDialog.playNow');
    recordsTitle.textContent = t('gameDialog.topRecords');
    recordsTitle.prepend(recordsTitleIcon);
    commentsTitle.textContent = t('gameDialog.commentsTitle', { count: commentsCount });
    sendBtn.setAttribute('aria-label', t('gameDialog.sendComment'));
    commentInput.placeholder = options.getSession?.()
      ? t('gameDialog.writeComment')
      : t('gameDialog.signInToComment');
    translatedBadgeLabels.forEach(({ key, element }) => {
      element.textContent = t(key);
    });

    const ratingValue = Number(rating.dataset.rating);
    if (Number.isFinite(ratingValue)) {
      rating.textContent = formatLocalizedNumber(ratingValue);
      rating.setAttribute(
        'aria-label',
        t('gameDialog.rating', { rating: formatLocalizedNumber(ratingValue) }),
      );
    }

    if (currentGame) {
      image.alt = t('gameDialog.heroImageAlt', { name: currentGame.name });
      favoriteBtnText.textContent = favoriteRequestPending
        ? t('gameDialog.updatingFavorite')
        : t(currentGame.isLikedByCurrentUser ? 'favorites.remove' : 'favorites.add');
      likes.setAttribute('aria-label', t('gameDialog.likes', { count: currentGame.likesCount }));
    }

    if (gameStateKey) {
      const stateMessage = state.querySelector<HTMLElement>('.game-dialog__state-message');
      if (stateMessage) appendTranslatedMessage(stateMessage, gameStateKey, gameStateDetail);
      state.querySelectorAll<HTMLButtonElement>('.game-dialog__retry').forEach((button) => {
        button.textContent = t('gameDialog.retry');
      });
    }

    const emptyRecords = recordsList.querySelector<HTMLElement>('.game-dialog__empty');
    if (emptyRecords) emptyRecords.textContent = t('gameDialog.noRecords');
    recordsList.querySelectorAll<HTMLElement>('.game-dialog__record-score').forEach((score) => {
      const value = Number(score.dataset.score);
      score.textContent = t('gameDialog.points', { count: value });
    });
    recordsList.querySelectorAll<HTMLElement>('.game-dialog__record-time').forEach((time) => {
      const date = new Date(time.dataset.achievedAt ?? '');
      if (!Number.isNaN(date.getTime()))
        time.textContent = date.toLocaleDateString(getNumberLocale());
    });

    if (commentStateKey) {
      const stateMessage = commentsState.querySelector<HTMLElement>('.game-dialog__state-message');
      if (stateMessage) appendTranslatedMessage(stateMessage, commentStateKey, commentStateDetail);
      commentsState.querySelectorAll<HTMLButtonElement>('.game-dialog__retry').forEach((button) => {
        button.textContent = t('gameDialog.retry');
      });
    }
    commentsList.querySelectorAll<HTMLElement>('.game-dialog__comment-time').forEach((time) => {
      time.textContent = formatLocalizedRelativeTime(time.dataset.createdAt ?? '');
    });
    commentsList
      .querySelectorAll<HTMLButtonElement>('.game-dialog__comment-like')
      .forEach((button) => {
        button.setAttribute(
          'aria-label',
          t(
            button.dataset.liked === 'true' ? 'gameDialog.unlikeComment' : 'gameDialog.likeComment',
          ),
        );
      });
    updateCommentSubmissionStatus();
  });

  if (initialSlug) dialog.openGame(initialSlug, false);

  return dialog;
}

function getNumberLocale(): string {
  const language = getCurrentLanguage();
  return language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';
}

function formatLocalizedNumber(value: number): string {
  return new Intl.NumberFormat(getNumberLocale(), { maximumFractionDigits: 1 }).format(value);
}

function formatLocalizedCompactNumber(value: number): string {
  return new Intl.NumberFormat(getNumberLocale(), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatLocalizedRelativeTime(timestamp: string, now = Date.now()): string {
  const createdAt = new Date(timestamp).getTime();
  if (Number.isNaN(createdAt)) return t('gameDialog.unknownTime');

  const elapsedDays = Math.floor(Math.max(0, now - createdAt) / 86_400_000);
  if (elapsedDays === 0) {
    const elapsedMinutes = Math.floor(Math.max(0, now - createdAt) / 60_000);
    if (elapsedMinutes === 0) return t('gameDialog.justNow');
    if (elapsedMinutes < 60) {
      return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
        -elapsedMinutes,
        'minute',
      );
    }
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
      -elapsedHours,
      'hour',
    );
  }

  if (elapsedDays < 7) {
    return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
      -elapsedDays,
      'day',
    );
  }
  if (elapsedDays < 28) {
    return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
      -Math.floor(elapsedDays / 7),
      'week',
    );
  }
  if (elapsedDays < 365) {
    return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
      -Math.min(11, Math.max(1, Math.floor(elapsedDays / 30))),
      'month',
    );
  }
  return new Intl.RelativeTimeFormat(getNumberLocale(), { numeric: 'always' }).format(
    -Math.max(1, Math.floor(elapsedDays / 365)),
    'year',
  );
}
