import { createElement } from '../create-element';

export function createDeveloperCta(): HTMLElement {
  const section = createElement('section', 'developer-cta');

  section.setAttribute('aria-labelledby', 'developer-cta-title');

  const container = createElement('div', 'developer-cta__container');

  const image = createElement('img', 'developer-cta__image');

  image.src = '/src/assets/developer.png';
  image.alt = 'Game developer working on a game';

  const content = createElement('div', 'developer-cta__content');

  const title = createElement('h2', 'developer-cta__title', 'Are You a Game Developer?');

  title.id = 'developer-cta-title';

  const description = createElement('p', 'developer-cta__description');

  const firstRow = createElement(
    'span',
    'developer-cta__description--span',
    "Want to see your game on MiniGames? We're always looking for fun,",
  );
  const secondRow = createElement(
    'span',
    'developer-cta__description--span',
    'engaging mini games to add to our platform. Submit your game',
  );
  const thirdtRow = createElement(
    'span',
    'developer-cta__description--span',
    'and reach thousands of players!',
  );

  description.append(firstRow, secondRow, thirdtRow);

  const button = createElement('a', 'developer-cta__button', 'Submit Form');

  button.href = '#';

  const contact = createElement(
    'p',
    'developer-cta__contact',
    'or contact us at developers@minigames.com',
  );

  content.append(title, description, button, contact);

  container.append(image, content);
  section.append(container);

  return section;
}
