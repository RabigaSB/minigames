import { createElement } from '../create-element';
import { fetchGames } from '../utils/api';
import type { ApiGame } from '../utils/api';
import { showSnackbar } from '../utils/snackbar';
import { getFeedbackErrorKey } from '../utils/feedback';
import { onLanguageChange, t, type TranslationKey } from '../../i18n';
import { formatCompactNumber, formatNumber } from '../utils/formatters';

export function createNewGamesSection(onGameSelected: (slug: string) => void): HTMLElement {
  const section = createElement('section', 'carousel__section');

  renderSkeleton(section, 3);

  loadGamesData(section, onGameSelected);

  let unsubscribe = (): void => undefined;
  unsubscribe = onLanguageChange(() => {
    if (!section.isConnected) {
      unsubscribe();
      return;
    }
    const title = section.querySelector<HTMLElement>('.carousel__title');
    if (title) title.textContent = t('carousel.newGames');
    const loading = section.querySelector<HTMLElement>('.carousel__loading');
    if (loading) {
      loading.textContent = t('carousel.loading');
      loading.parentElement?.setAttribute('aria-label', t('carousel.loading'));
    }
    const empty = section.querySelector<HTMLElement>('.carousel__empty-banner');
    if (empty) empty.textContent = t('carousel.empty');
    const errorPrefix = section.querySelector<HTMLElement>('.carousel__error-prefix');
    if (errorPrefix) errorPrefix.textContent = t('carousel.errorPrefix');
    const errorMessage = section.querySelector<HTMLElement>('.carousel__error-message');
    const errorKey = errorMessage?.dataset.translationKey as TranslationKey | undefined;
    if (errorMessage && errorKey) errorMessage.textContent = t(errorKey);
    const retry = section.querySelector<HTMLButtonElement>('.carousel__retry-btn');
    if (retry) retry.textContent = t('common.retry');
    const previous = section.querySelector<HTMLImageElement>('.carousel__arrow--backward');
    previous?.setAttribute('aria-label', t('carousel.previous'));
    const next = section.querySelector<HTMLImageElement>('.carousel__arrow--forward');
    next?.setAttribute('aria-label', t('carousel.next'));
    section.querySelectorAll<HTMLElement>('.carousel__rating').forEach((rating) => {
      rating.textContent = formatNumber(Number(rating.dataset.rating), {
        maximumFractionDigits: 1,
      });
    });
    section.querySelectorAll<HTMLElement>('.carousel__likes').forEach((likes) => {
      const count = Number(likes.dataset.likesCount);
      likes.textContent = formatCompactNumber(count);
      likes.setAttribute('aria-label', t('gameDialog.likes', { count }));
    });
  });

  return section;
}

async function loadGamesData(
  section: HTMLElement,
  onGameSelected: (slug: string) => void,
): Promise<void> {
  try {
    const response = await fetchGames({ featured: true });
    section.innerHTML = '';

    const games = response.data;

    if (!games || games.length === 0) {
      renderEmptyState(section);
      return;
    }

    renderPopulatedCarousel(section, games, onGameSelected);
  } catch (error) {
    section.innerHTML = '';
    const errorKey = getFeedbackErrorKey(error, 'carousel.failedToLoad');
    renderErrorState(section, errorKey, onGameSelected);
    showSnackbar(errorKey, 'error');
  }
}

function renderSkeleton(section: HTMLElement, cardCount: number): void {
  const wrapper = createElement('div', 'carousel__wrapper');
  wrapper.append(createElement('h2', 'carousel__title', t('carousel.newGames')));
  const container = createElement('div', 'carousel__container skeleton-container');
  container.style.cssText = 'display: flex; gap: 16px; overflow: hidden;';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-label', t('carousel.loading'));
  container.append(createElement('p', 'carousel__loading', t('carousel.loading')));
  for (let index = 0; index < cardCount; index++) {
    const card = createElement('div', 'skeleton-card');
    card.style.cssText =
      'min-width: 288px; height: 300px; background: #2a2a2a; border-radius: 12px;';
    card.setAttribute('aria-hidden', 'true');
    container.append(card);
  }
  section.replaceChildren(wrapper, container);
}

function renderEmptyState(section: HTMLElement): void {
  const emptyBanner = createElement('div', 'carousel__empty-banner', t('carousel.empty'));
  section.append(emptyBanner);
}

function renderErrorState(
  section: HTMLElement,
  messageKey: TranslationKey,
  onGameSelected: (slug: string) => void,
): void {
  const errorBanner = createElement('div', 'carousel__error-banner');
  const errorText = createElement('p', 'carousel__error-text');
  const errorPrefix = createElement('span', 'carousel__error-prefix', t('carousel.errorPrefix'));
  const errorMessage = createElement('span', 'carousel__error-message', t(messageKey));
  errorMessage.dataset.translationKey = messageKey;
  errorText.append(errorPrefix, document.createTextNode(' '), errorMessage);
  const retryBtn = createElement('button', 'carousel__retry-btn', t('common.retry'));

  retryBtn.addEventListener('click', () => {
    renderSkeleton(section, 1);
    loadGamesData(section, onGameSelected);
  });

  errorBanner.append(errorText, retryBtn);
  section.append(errorBanner);
}

function renderPopulatedCarousel(
  section: HTMLElement,
  games: ApiGame[],
  onGameSelected: (slug: string) => void,
): void {
  const titleWrapper = createElement('div', 'carousel__wrapper');
  const newGamesTitle = createElement('h2', 'carousel__title', t('carousel.newGames'));

  const arrowWrapper = createElement('div', 'carousel__tools');
  const arrowForward = createElement('img', 'carousel__arrow--forward');
  const arrowBackward = createElement('img', 'carousel__arrow--backward');
  arrowForward.src = './assets/arrow.png';
  arrowForward.alt = '';
  arrowForward.setAttribute('role', 'button');
  arrowForward.tabIndex = 0;
  arrowForward.setAttribute('aria-label', t('carousel.next'));
  arrowBackward.src = './assets/arrow.png';
  arrowBackward.alt = '';
  arrowBackward.setAttribute('role', 'button');
  arrowBackward.tabIndex = 0;
  arrowBackward.setAttribute('aria-label', t('carousel.previous'));
  arrowWrapper.append(arrowBackward, arrowForward);
  titleWrapper.append(newGamesTitle, arrowWrapper);

  const carouselContainer = createElement('div', 'carousel__container');

  for (const game of games.slice(0, 9)) {
    carouselContainer.append(createCarouselCard(game, onGameSelected));
  }

  initCarouselLogic(carouselContainer, arrowBackward, arrowForward);
  arrowBackward.addEventListener('keydown', activateArrowOnKeyboard);
  arrowForward.addEventListener('keydown', activateArrowOnKeyboard);
  section.append(titleWrapper, carouselContainer);
}

function activateArrowOnKeyboard(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }
}

function createCarouselCard(game: ApiGame, onGameSelected: (slug: string) => void): HTMLElement {
  const card = createElement('article', 'carousel__card');
  card.style.transition = 'all 0.4s ease-in-out';

  const image = createElement('img', 'carousel__img');
  image.src = game.cardImage.startsWith('/') ? `.${game.cardImage}` : `./${game.cardImage}`;
  image.alt = game.name;

  const content = createElement('div', 'carousel__content');

  const name = createElement('h3', 'carousel__name', game.name);
  name.style.whiteSpace = 'nowrap';
  name.style.overflow = 'hidden';
  name.style.textOverflow = 'ellipsis';

  const info = createElement('div', 'carousel__info');

  const rating = createElement(
    'span',
    'carousel__rating',
    formatNumber(game.rating, { maximumFractionDigits: 1 }),
  );
  rating.dataset.rating = String(game.rating);
  const likes = createElement('span', 'carousel__likes', formatCompactNumber(game.likesCount));
  likes.dataset.likesCount = String(game.likesCount);
  likes.setAttribute('aria-label', t('gameDialog.likes', { count: game.likesCount }));

  info.append(rating, likes);
  content.append(name, info);
  card.append(image, content);

  card.addEventListener('click', () => {
    onGameSelected(game.slug);
  });

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width >= 288) {
        card.classList.add('carousel__card--info-enabled');
      } else {
        card.classList.remove('carousel__card--info-enabled');
      }
    }
  });
  observer.observe(card);

  return card;
}

function initCarouselLogic(track: HTMLElement, arrowLeft: HTMLElement, arrowRight: HTMLElement) {
  let autoplayTimer: number | null = null;
  let isPaused = false;
  let remainingTime = 4000;
  let startTime = Date.now();

  const nextSlide = () => {
    const first = track.firstElementChild;
    if (first) track.append(first);
  };

  const prevSlide = () => {
    const last = track.lastElementChild;
    if (last) track.prepend(last);
  };

  const startAutoplay = () => {
    if (autoplayTimer) window.clearTimeout(autoplayTimer);
    startTime = Date.now();
    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = null;
      if (!isPaused) nextSlide();
      remainingTime = 4000;
      if (!isPaused) startAutoplay();
    }, remainingTime);
  };

  const pauseAutoplay = () => {
    if (isPaused) return;
    isPaused = true;
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
      remainingTime -= Date.now() - startTime;
      if (remainingTime < 0) remainingTime = 4000;
    }
  };

  const resumeAutoplay = (resetDuration = false) => {
    isPaused = false;
    if (resetDuration) remainingTime = 4000;
    startAutoplay();
  };

  arrowRight.addEventListener('click', () => {
    nextSlide();
    resumeAutoplay(true);
  });

  arrowLeft.addEventListener('click', () => {
    prevSlide();
    resumeAutoplay(true);
  });

  let startX = 0;
  let endX = 0;
  let hasSwiped = false;

  track.addEventListener('mousedown', () => {
    pauseAutoplay();
    hasSwiped = false;
  });

  window.addEventListener('mouseup', () => {
    if (isPaused) resumeAutoplay(hasSwiped);
  });

  track.addEventListener(
    'touchstart',
    (e) => {
      pauseAutoplay();
      startX = e.touches[0].clientX;
      hasSwiped = false;
    },
    { passive: true },
  );

  track.addEventListener(
    'touchmove',
    (e) => {
      endX = e.touches[0].clientX;
      if (Math.abs(endX - startX) > 30) {
        hasSwiped = true;
      }
    },
    { passive: true },
  );

  track.addEventListener('touchend', () => {
    if (hasSwiped) {
      if (endX < startX - 30) nextSlide();
      else if (endX > startX + 30) prevSlide();
      resumeAutoplay(true);
    } else {
      resumeAutoplay(false);
    }
  });

  startAutoplay();
}
