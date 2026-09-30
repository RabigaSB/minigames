import { createElement } from '../create-element';
import { createSortDropdown } from '../components/sort-dropdown';
import { fetchGames, fetchCategories, type ApiGame, type ApiCategory } from '../utils/api';
import { formatToK } from '../utils/formatters';
import { createPagination } from '../components/pagination';
import { createGameDetailsDialog } from '../components/game-details-dialog';
import { showSnackbar } from '../utils/snackbar';

let currentCategory = 'all';
let currentPage = 1;
const currentLimit = 6;
const currentSort = 'rating-desc';

export function createLibraryPage(): HTMLElement {
  const main = createElement('div', 'library');
  const section = createElement('section', 'library__section');
  const container = createElement('div', 'library__container');

  const headerWrapper = createElement('div', 'library__header-wrapper');
  const title = createElement('h1', 'library__title', 'Game Library');
  const subtitle = createElement(
    'p',
    'library__subtitle',
    'Browse our collection of casual mini-games',
  );
  headerWrapper.append(title, subtitle);

  const controlsWrapper = createElement('div', 'library__controls');
  const chipsContainer = createElement('div', 'library__chips');

  const gridContainer = createElement('div', 'library__grid');

  loadCategories(chipsContainer, gridContainer);

  const sortControl = createSortDropdown();
  controlsWrapper.append(chipsContainer, sortControl);

  // Trigger initial fetch
  loadLibraryGames(gridContainer);

  const paginationComponent = createPagination();

  section.append(headerWrapper, controlsWrapper, gridContainer, paginationComponent);
  container.append(section);
  main.append(container);

  const app = document.querySelector('.app');
  const gameDialog = createGameDetailsDialog();
  app?.append(gameDialog);

  return main;
}

async function loadCategories(
  chipsContainer: HTMLElement,
  gridContainer: HTMLElement,
): Promise<void> {
  try {
    const response = await fetchCategories();
    chipsContainer.innerHTML = '';

    const categories: ApiCategory[] = response.data || [];

    categories.forEach((cat, index) => {
      const chip = createElement('button', 'library__chip', cat.label);
      chip.type = 'button';
      chip.dataset.slug = cat.slug;

      if (cat.isDefault || index === 0) {
        chip.classList.add('active');
        currentCategory = cat.slug;
      }

      chip.addEventListener('click', () => {
        chipsContainer
          .querySelectorAll('.library__chip')
          .forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        currentCategory = cat.slug;
        currentPage = 1;
        loadLibraryGames(gridContainer);
      });

      chipsContainer.append(chip);
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to load categories';
    showSnackbar(errorMsg, 'error');

    //if API fails
    chipsContainer.innerHTML = '';
    const fallbackChip = createElement('button', 'library__chip active', 'All Games');
    fallbackChip.type = 'button';
    fallbackChip.dataset.slug = 'all';

    fallbackChip.addEventListener('click', () => {
      currentCategory = 'all';
      currentPage = 1;
      loadLibraryGames(gridContainer);
    });

    chipsContainer.append(fallbackChip);
  }
}

async function loadLibraryGames(gridContainer: HTMLElement): Promise<void> {
  renderSkeleton(gridContainer);

  try {
    const response = await fetchGames({
      category: currentCategory,
      page: currentPage,
      limit: currentLimit,
      sort: currentSort,
    });

    gridContainer.innerHTML = '';

    if (!response.data || response.data.length === 0) {
      renderEmptyState(gridContainer);
      return;
    }

    renderGameCards(gridContainer, response.data);
  } catch (error) {
    gridContainer.innerHTML = '';
    const errorMsg = error instanceof Error ? error.message : 'Failed to load games';
    renderErrorState(gridContainer, errorMsg, () => loadLibraryGames(gridContainer));
    showSnackbar(errorMsg, 'error');
  }
}

function renderSkeleton(container: HTMLElement): void {
  container.innerHTML = `
    <div class="library__skeleton" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--on-bg-low, #737380);">
      Loading games library...
    </div>
  `;
}

function renderEmptyState(container: HTMLElement): void {
  container.innerHTML = `
    <div class="library__empty" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
      No games found.
    </div>
  `;
}

function renderErrorState(container: HTMLElement, message: string, onRetry: () => void): void {
  const errorBanner = createElement('div', 'library__error');
  errorBanner.style.gridColumn = '1 / -1';

  const errorText = createElement('p', 'library__error-text', `Error: ${message}`);
  const retryBtn = createElement('button', 'library__retry-btn', 'Retry');

  retryBtn.addEventListener('click', onRetry);

  errorBanner.append(errorText, retryBtn);
  container.append(errorBanner);
}

function renderGameCards(gridContainer: HTMLElement, games: ApiGame[]): void {
  games.forEach((game) => {
    const card = createElement('article', 'game-card');

    const imgWrapper = createElement('div', 'game-card__image-wrapper');
    const img = createElement('img', 'game-card__image') as HTMLImageElement;
    img.src = game.cardImage.startsWith('http') ? game.cardImage : './' + game.cardImage;
    img.alt = game.name;
    img.loading = 'lazy';
    imgWrapper.append(img);

    const content = createElement('div', 'game-card__content');
    const topRow = createElement('div', 'game-card__top-row');
    const gameTitle = createElement('h2', 'game-card__title', game.name);
    const categoryBadge = createElement('span', 'game-card__category', game.category);
    const priceTag = createElement('span', 'game-card__price', game.price);
    if (game.price === 'Free') {
      priceTag.classList.add('game-card__price--free');
    }

    gameTitle.append(categoryBadge);
    topRow.append(gameTitle, priceTag);

    const desc = createElement('p', 'game-card__description', game.shortDescription);
    const footerRow = createElement('div', 'game-card__footer');
    const stats = createElement('div', 'game-card__stats');
    const rating = createElement('span', 'game-card__rating', `${game.rating}`);
    const likes = createElement(
      'span',
      'game-card__likes',
      `${formatToK(game.likesCount).toLocaleString()}`,
    );
    stats.append(rating, likes);
    const detailsBtn = createElement('button', 'game-card__details-btn', 'Details');
    detailsBtn.type = 'button';

    detailsBtn.addEventListener('click', () => {
      const dialog = document.querySelector('.game-dialog');
      dialog?.classList.add('game-dialog--open');
      document.body.classList.add('dialog-open');
    });

    footerRow.append(stats, detailsBtn);
    content.append(topRow, desc, footerRow);
    card.append(imgWrapper, content);
    gridContainer.append(card);
  });
}
