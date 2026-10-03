import { createElement } from '../create-element';
import { fetchGames } from '../utils/api';
import type { ApiGame } from '../utils/api';
import { showSnackbar } from '../utils/snackbar';

export function createNewGamesSection(onGameSelected: (slug: string) => void): HTMLElement {
  const section = createElement('section', 'carousel__section');

  // Render skeleton state immediately
  section.innerHTML = `
    <div class="carousel__wrapper">
      <h2 class="carousel__title">New Games</h2>
    </div>
    <div class="carousel__container skeleton-container" style="display: flex; gap: 16px; overflow: hidden;">
      <div class="skeleton-card" style="min-width: 288px; height: 300px; background: #2a2a2a; border-radius: 12px;"></div>
      <div class="skeleton-card" style="min-width: 288px; height: 300px; background: #2a2a2a; border-radius: 12px;"></div>
      <div class="skeleton-card" style="min-width: 288px; height: 300px; background: #2a2a2a; border-radius: 12px;"></div>
    </div>
  `;

  loadGamesData(section, onGameSelected);

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
    const errorMsg = error instanceof Error ? error.message : 'Failed to load featured games';
    renderErrorState(section, errorMsg, onGameSelected);
    showSnackbar(errorMsg, 'error');
  }
}

function renderEmptyState(section: HTMLElement): void {
  const emptyBanner = createElement(
    'div',
    'carousel__empty-banner',
    'No Featured Games Available.',
  );
  section.append(emptyBanner);
}

function renderErrorState(
  section: HTMLElement,
  message: string,
  onGameSelected: (slug: string) => void,
): void {
  const errorBanner = createElement('div', 'carousel__error-banner');
  const errorText = createElement('p', 'carousel__error-text', `Error: ${message}`);
  const retryBtn = createElement('button', 'carousel__retry-btn', 'Retry');

  retryBtn.addEventListener('click', () => {
    section.innerHTML = `
      <div class="carousel__wrapper">
        <h2 class="carousel__title">New Games</h2>
      </div>
      <div class="carousel__container skeleton-container">
        <div class="skeleton-card" style="min-width: 288px; height: 300px; background: #2a2a2a; border-radius: 12px;"></div>
      </div>
    `;
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
  const newGamesTitle = createElement('h2', 'carousel__title', 'New Games');

  const arrowWrapper = createElement('div', 'carousel__tools');
  const arrowForward = createElement('img', 'carousel__arrow--forward');
  const arrowBackward = createElement('img', 'carousel__arrow--backward');
  arrowForward.src = './assets/arrow.png';
  arrowForward.alt = 'arrow';
  arrowBackward.src = './assets/arrow.png';
  arrowBackward.alt = 'arrow';
  arrowWrapper.append(arrowBackward, arrowForward);
  titleWrapper.append(newGamesTitle, arrowWrapper);

  const carouselContainer = createElement('div', 'carousel__container');

  for (const game of games.slice(0, 9)) {
    carouselContainer.append(createCarouselCard(game, onGameSelected));
  }

  initCarouselLogic(carouselContainer, arrowBackward, arrowForward);
  section.append(titleWrapper, carouselContainer);
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

  const rating = createElement('span', 'carousel__rating', `${game.rating}`);
  const likes = createElement('span', 'carousel__likes', `${formatLikes(game.likesCount)}`);

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

function formatLikes(likesCount: number): string {
  if (likesCount >= 1000) {
    return `${(likesCount / 1000).toFixed(1)}K`;
  }
  return likesCount.toString();
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
