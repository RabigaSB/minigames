import { createElement } from './create-element';
import { createHeader } from './components/header';

export function createApp(): HTMLElement {
  const app = createElement('div', 'app');

  const header = createHeader();

  app.append(header);

  return app;
}