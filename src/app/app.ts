import { createElement } from './create-element';
import { createHeader } from './components/header';
import { createHomePage } from './pages/home';

export function createApp(): HTMLElement {
  const app = createElement('div', 'app');

  const header = createHeader();
  const homePage = createHomePage();

  app.append(header, homePage);

  return app;
}
