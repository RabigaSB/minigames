import { createElement } from '../create-element';
import type { Game } from '../../data/game';
import { createGameDetailsDialog } from './game-details-dialog';

export function createNewGamesSection(games: Game[]): HTMLElement {
  const newGames = createElement('section', 'carousel__section');
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

  const featuredGames = games.filter((game) => game.featured).slice(0, 9);

  for (const game of featuredGames) {
    carouselContainer.append(createCarouselCard(game));
  }

  initCarouselLogic(carouselContainer, arrowBackward, arrowForward);

  newGames.append(titleWrapper, carouselContainer);

  return newGames;
}

function createCarouselCard(game: Game): HTMLElement {
  const card = createElement('article', 'carousel__card');
  card.style.transition = 'all 0.4s ease-in-out';

  const image = createElement('img', 'carousel__img');
  image.src = './' + game.cardImage;
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
    const dialog = createGameDetailsDialog();
    document.body.append(dialog);
    requestAnimationFrame(() => dialog.classList.add('game-dialog--open'));
    document.body.classList.add('dialog-open');
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
      if (!isPaused) nextSlide();
      startAutoplay();
    }, remainingTime);
  };

  const pauseAutoplay = () => {
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
