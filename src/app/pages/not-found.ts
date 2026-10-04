import { createElement } from '../create-element';
import { getAppPath } from '../constants';

export function createNotFoundPage(): HTMLElement {
  const main = createElement('section', 'not-found');
  const code = createElement('p', 'not-found__code', '404');
  const title = createElement('h1', 'not-found__title', 'Page not found');
  const message = createElement(
    'p',
    'not-found__message',
    'The page you are looking for does not exist or may have moved.',
  );
  const homeLink = createElement('a', 'not-found__home', 'Return to Home Page');
  homeLink.href = getAppPath('home');
  homeLink.dataset.nav = 'home';

  main.append(code, title, message, homeLink);
  return main;
}
