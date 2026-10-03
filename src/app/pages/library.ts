import { createElement } from '../create-element';
import { createSortDropdown } from '../components/sort-dropdown';
import { fetchGames, fetchCategories, type ApiGame, type ApiCategory } from '../utils/api';
import { formatToK } from '../utils/formatters';
import { createPagination } from '../components/pagination';
import { createGameDetailsDialog } from '../components/game-details-dialog';
import { showSnackbar } from '../utils/snackbar';

const currentLimit = 6;

export interface LibraryRouteState {
  category: string;
  sort: string;
  page: number;
}

export interface LibraryPageOptions {
  state?: LibraryRouteState;
  gameSlug?: string;
  onStateChange?: (state: LibraryRouteState, replace?: boolean) => void;
  onGameChange?: (slug: string | null) => void;
}

export function createLibraryPage(options: LibraryPageOptions = {}): HTMLElement {
  let currentCategory = options.state?.category ?? 'all';
  let currentPage = options.state?.page ?? 1;
  let currentSort = options.state?.sort ?? 'rating-desc';

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
  const gameDialog = createGameDetailsDialog(options.onGameChange, options.gameSlug);

  const getState = (): LibraryRouteState => ({
    category: currentCategory,
    sort: currentSort,
    page: currentPage,
  });

  const setState = (state: LibraryRouteState): void => {
    currentCategory = state.category;
    currentSort = state.sort;
    currentPage = state.page;
  };

  const updateUrlState = (replace = false): void => {
    options.onStateChange?.(getState(), replace);
  };

  const requestTracker = {
    current: 0,
    reconcilePage: (page: number): void => {
      currentPage = page;
      updateUrlState(true);
    },
  };

  const paginationComponent = createPagination((newPage) => {
    currentPage = newPage;
    updateUrlState();
    loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);
  }, currentPage) as HTMLElement & { updatePagination: (total: number, page: number) => void };

  loadCategories(
    chipsContainer,
    gridContainer,
    paginationComponent,
    gameDialog,
    getState,
    setState,
    updateUrlState,
    requestTracker,
  );

  const sortControl = createSortDropdown((newSort) => {
    currentSort = newSort;
    currentPage = 1;
    updateUrlState();
    loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);
  }, currentSort);

  controlsWrapper.append(chipsContainer, sortControl);

  // Trigger initial fetch
  loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);

  section.append(headerWrapper, controlsWrapper, gridContainer, paginationComponent);
  container.append(section);
  main.append(container, gameDialog);

  return main;
}

async function loadCategories(
  chipsContainer: HTMLElement,
  gridContainer: HTMLElement,
  paginationComponent: HTMLElement & { updatePagination: (total: number, page: number) => void },
  gameDialog: ReturnType<typeof createGameDetailsDialog>,
  getState: () => LibraryRouteState,
  setState: (state: LibraryRouteState) => void,
  updateUrlState: (replace?: boolean) => void,
  requestTracker: { current: number; reconcilePage: (page: number) => void },
): Promise<void> {
  try {
    const response = await fetchCategories();
    chipsContainer.innerHTML = '';

    const categories: ApiCategory[] = response.data || [];

    categories.forEach((cat) => {
      const chip = createElement('button', 'library__chip', cat.label);
      chip.type = 'button';
      chip.dataset.slug = cat.slug;

      if (cat.slug === getState().category) {
        chip.classList.add('active');
      }

      chip.addEventListener('click', () => {
        chipsContainer
          .querySelectorAll('.library__chip')
          .forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        setState({ ...getState(), category: cat.slug, page: 1 });
        updateUrlState();
        loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);
      });

      chipsContainer.append(chip);
    });

    const selectedCategory = categories.find((category) => category.slug === getState().category);
    if (!selectedCategory && categories.length > 0) {
      const fallbackCategory = categories.find((category) => category.isDefault) ?? categories[0];
      setState({ ...getState(), category: fallbackCategory.slug });
      updateUrlState(true);
      chipsContainer.querySelectorAll('.library__chip').forEach((chip) => {
        chip.classList.toggle('active', chip.getAttribute('data-slug') === fallbackCategory.slug);
      });
      loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to load categories';
    showSnackbar(errorMsg, 'error');

    chipsContainer.innerHTML = '';
    const fallbackChip = createElement('button', 'library__chip active', 'All Games');
    fallbackChip.type = 'button';
    fallbackChip.dataset.slug = 'all';
    fallbackChip.classList.toggle('active', getState().category === 'all');

    fallbackChip.addEventListener('click', () => {
      setState({ ...getState(), category: 'all', page: 1 });
      updateUrlState();
      loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker);
    });

    chipsContainer.append(fallbackChip);
  }
}

async function loadLibraryGames(
  gridContainer: HTMLElement,
  paginationComponent: HTMLElement & { updatePagination: (total: number, page: number) => void },
  gameDialog: ReturnType<typeof createGameDetailsDialog>,
  getState: () => LibraryRouteState,
  requestTracker: { current: number; reconcilePage: (page: number) => void },
): Promise<void> {
  const requestId = ++requestTracker.current;
  const state = getState();
  renderSkeleton(gridContainer);

  try {
    const response = await fetchGames({
      category: state.category,
      page: state.page,
      limit: currentLimit,
      sort: state.sort,
    });

    if (requestId !== requestTracker.current) return;

    gridContainer.innerHTML = '';

    if (response.meta) {
      if (response.meta.page !== state.page) {
        requestTracker.reconcilePage(response.meta.page);
      }
      paginationComponent.updatePagination(response.meta.totalPages, response.meta.page);
    }

    if (!response.data || response.data.length === 0) {
      renderEmptyState(gridContainer);
      return;
    }

    renderGameCards(gridContainer, response.data, gameDialog);
  } catch (error) {
    if (requestId !== requestTracker.current) return;
    gridContainer.innerHTML = '';
    const errorMsg = error instanceof Error ? error.message : 'Failed to load games';
    renderErrorState(gridContainer, errorMsg, () =>
      loadLibraryGames(gridContainer, paginationComponent, gameDialog, getState, requestTracker),
    );
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

function renderGameCards(
  gridContainer: HTMLElement,
  games: ApiGame[],
  gameDialog: ReturnType<typeof createGameDetailsDialog>,
): void {
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
      gameDialog.openGame(game.slug);
    });

    footerRow.append(stats, detailsBtn);
    content.append(topRow, desc, footerRow);
    card.append(imgWrapper, content);
    gridContainer.append(card);
  });
}
