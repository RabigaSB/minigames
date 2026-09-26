import { createElement } from '../create-element';
import { createSortDropdown } from '../components/sort-dropdown';
import seedData from '../../data/all-games-seed.json';
import type { Game } from '../../data/game';
import { formatToK } from '../utils/formatters';
import { createPagination } from '../components/pagination';

export function createLibraryPage(): HTMLElement {
  const main = createElement('main', 'library');
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
  const categories = ['All Games', 'Puzzle', 'Card', 'Match', 'Farm', 'Strategy', 'Arcade'];

  categories.forEach((cat, index) => {
    const chip = createElement('button', 'library__chip', cat);
    chip.type = 'button';
    if (index === 0) chip.classList.add('active');

    chip.addEventListener('click', () => {
      chipsContainer
        .querySelectorAll('.library__chip')
        .forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });

    chipsContainer.append(chip);
  });

  const sortControl = createSortDropdown((selectedSort) => {
    // TODO: sorting action
    console.log(selectedSort);
  });

  controlsWrapper.append(chipsContainer, sortControl);

  // Game Cards
  const gridContainer = createElement('div', 'library__grid');

  const games: Game[] = seedData.data;

  const visibleGames = games.slice(0, 6);

  visibleGames.forEach((game) => {
    const card = createElement('article', 'game-card');

    const imgWrapper = createElement('div', 'game-card__image-wrapper');
    const img = createElement('img', 'game-card__image') as HTMLImageElement;
    img.src = './' + game.cardImage;
    img.alt = game.name;
    img.loading = 'lazy';
    imgWrapper.append(img);

    const content = createElement('div', 'game-card__content');
    const topRow = createElement('div', 'game-card__top-row');
    const gameTitle = createElement('h3', 'game-card__title', game.name);
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

    footerRow.append(stats, detailsBtn);

    content.append(topRow, desc, footerRow);
    card.append(imgWrapper, content);
    gridContainer.append(card);
  });

  const paginationComponent = createPagination();

  section.append(headerWrapper, controlsWrapper, gridContainer, paginationComponent);
  container.append(section);
  main.append(container);

  return main;
}
