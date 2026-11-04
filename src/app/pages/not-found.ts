import { createElement } from '../create-element';
import { getAppPath } from '../constants';
import { onLanguageChange, t } from '../../i18n';

export function createNotFoundPage(): HTMLElement {
  const main = createElement('section', 'not-found');
  main.setAttribute('aria-labelledby', 'not-found-title');
  const code = createElement('p', 'not-found__code', '404');
  const title = createElement('h1', 'not-found__title', t('notFound.title'));
  title.id = 'not-found-title';
  const message = createElement('p', 'not-found__message', t('notFound.message'));
  const homeLink = createElement('a', 'not-found__home', t('notFound.home'));
  homeLink.href = getAppPath('home');
  homeLink.dataset.nav = 'home';

  main.append(code, title, message, homeLink);
  let unsubscribe = (): void => undefined;
  unsubscribe = onLanguageChange(() => {
    if (!main.isConnected) {
      unsubscribe();
      return;
    }

    title.textContent = t('notFound.title');
    message.textContent = t('notFound.message');
    homeLink.textContent = t('notFound.home');
  });
  return main;
}
