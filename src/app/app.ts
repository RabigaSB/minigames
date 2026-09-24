import { createElement } from './create-element';
import { createHeader } from './components/header';
import { createFooter } from './components/footer';
import { Router } from './router';

export function createApp(): HTMLElement {
  const app = createElement('div', 'app');

  const header = createHeader();
  const contentContainer = createElement('main', 'app__content');
  const footer = createFooter();

  const router = new Router(contentContainer);
  router.navigate('home');

  app.append(header, contentContainer, footer);
  return app;
}
