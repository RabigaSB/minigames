import { createElement } from '../create-element';

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

  controlsWrapper.append(chipsContainer);
  section.append(headerWrapper, controlsWrapper);
  container.append(section);
  main.append(container);

  return main;
}
