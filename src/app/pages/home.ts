import { createElement } from '../create-element';

export function createHomePage(): HTMLElement {
  const main = createElement('main', 'home');

  const description = createElement('section', 'home__description');
  const descriptionContainer = createElement('div', 'home__description-container');
  const descriptionTitle = createElement(
    'h1',
    'home__description-title',
    'Take a Short Break & Have Fun',
  );
  const descriptionText = createElement(
    'p',
    'home__description-text',
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.',
  );
  const descriptionAction = createElement('a', 'home__description-button', 'Browse Library');
  descriptionAction.href = '/library';
  descriptionContainer.append(descriptionTitle, descriptionText, descriptionAction);
  description.append(descriptionContainer);

  main.append(description);

  return main;
}
