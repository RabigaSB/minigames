import { createElement } from './create-element';
import { createHeader } from './components/header';
import { createHomePage } from './pages/home';
import { createFooter } from './components/footer';

export function createApp(): HTMLElement {
  const app = createElement('div', 'app');

  const header = createHeader();
  const homePage = createHomePage();
  const footer = createFooter();

  app.append(header, homePage, footer);

  return app;
}
