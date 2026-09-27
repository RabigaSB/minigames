import { createElement } from '../create-element';

export function createGameDetailsDialog(): HTMLElement {
  const dialog = createElement('div', 'game-dialog');

  const content = createElement('div', 'game-dialog__content');

  const closeBtn = createElement('button', 'game-dialog__close');
  closeBtn.type = 'button';

  const hero = createElement('section', 'game-dialog__hero');
  const image = createElement('img', 'game-dialog__image');
  image.src = './assets/tukoni-banner.png';
  hero.append(image, closeBtn);

  const infoSection = createElement('section', 'game-dialog__info');

  const topRow = createElement('div', 'game-dialog__top-row');
  const title = createElement('h2', 'game-dialog__title', 'Tukoni: Forest Keepers');
  const stats = createElement('div', 'game-dialog__stats');
  const rating = createElement('span', 'game-dialog__rating', '4.9');
  const likes = createElement('span', 'game-dialog__likes', '31.2K');
  stats.append(rating, likes);
  topRow.append(title, stats);

  const description = createElement(
    'p',
    'game-dialog__description',
    'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
  );
  const badges = createElement('section', 'game-dialog__badges');

  badges.append(
    createBadge('Genre', 'Puzzle'),
    createBadge('Players', 'Solo'),
    createBadge('Duration', '40–90 min'),
    createBadge('Price', 'Free'),
  );

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

  favoriteBtn.addEventListener('click', () => {
    favoriteBtn.classList.toggle('active');
    const isActive = favoriteBtn.classList.contains('active');
    favoriteBtnText.textContent = isActive ? 'Remove from Favorites' : 'Add to Favorites';
  });

  const closeDialog = () => {
    dialog.classList.remove('game-dialog--open');
    document.body.classList.remove('dialog-open');
  };

  closeBtn.addEventListener('click', closeDialog);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('game-dialog--open')) {
      closeDialog();
    }
  });

  function createBadge(label: string, value: string) {
    const badge = createElement('div', 'game-dialog__badge');

    const title = createElement('p', 'game-dialog__badge-label', label);

    const text = createElement('p', 'game-dialog__badge-value', value);

    badge.append(title, text);

    return badge;
  }

  content.append(hero, infoSection);
  dialog.append(content);

  return dialog;
}
