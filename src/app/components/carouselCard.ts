import { createElement } from '../create-element';
import type { Game } from '../../data/game';

export function createCarouselCard(game: Game): HTMLElement {
  const card = createElement('article', 'carousel__card');

  const image = createElement('img', 'carousel__img');
  image.src = './' + game.cardImage;
  image.alt = game.name;

  const content = createElement('div', 'carousel__content');

  const name = createElement('h3', 'carousel__name', game.name);

  const info = createElement('div', 'carousel__info');

  const rating = createElement('span', 'carousel__rating', `${game.rating}`);

  const likes = createElement('span', 'carousel__likes', `${formatLikes(game.likesCount)}`);

  info.append(rating, likes);
  content.append(name, info);
  card.append(image, content);

  return card;
}

function formatLikes(likesCount: number): string {
  if (likesCount >= 1000) {
    return `${(likesCount / 1000).toFixed(1)}K`;
  }

  return likesCount.toString();
}
