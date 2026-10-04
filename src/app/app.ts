import { createElement } from './create-element';
import { createHeader } from './components/header';
import type { AuthDialog } from './components/auth-dialog';
import { createFooter } from './components/footer';
import { Router } from './router';

export function createApp(): HTMLElement {
  const app = createElement('div', 'app');

  const contentContainer = createElement('main', 'app__content');
  const footer = createFooter();

  const router = new Router(contentContainer);
  const header = createHeader((mode) => router.handleAuthChange(mode));
  const authDialog = header.querySelector('.auth-dialog') as AuthDialog;
  router.setAuthDialog(authDialog);

  app.append(header, contentContainer, footer);
  router.start();
  return app;
}
