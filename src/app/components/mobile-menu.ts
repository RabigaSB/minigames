import { createElement } from '../create-element';

export function createMobileMenu(): HTMLElement {
  const menu = createElement('div', 'mobile-menu');

  const header = createElement('div', 'mobile-menu__header');

  const logoContainer = createElement('div', 'mobile-menu__logo-container');
  const logoIcon = createElement('img', 'mobile-menu__logo-icon');
  logoIcon.src = './assets/minigames_logo.png';
  logoIcon.alt = 'MiniGames logo';
  const logo = createElement('a', 'mobile-menu__logo', 'MiniGames');
  logo.href = '/';
  logoContainer.append(logoIcon, logo);

  const closeButton = createElement('button', 'mobile-menu__close', '×');

  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close navigation menu');

  header.append(logoContainer, closeButton);

  const navigation = createElement('nav', 'mobile-menu__navigation');

  const navigationList = createElement('ul', 'mobile-menu__list');

  const links = [
    ['Home', '/', 'home'],
    ['Library', '/library', 'library'],
    ['Tournaments', '/', 'home'],
    ['Community', '/', 'home'],
  ];

  for (const [text, href, navData] of links) {
    const item = createElement('li', 'mobile-menu__item');

    const link = createElement('a', 'mobile-menu__link', text);

    link.href = href;

    link.setAttribute('data-nav', navData);

    item.append(link);
    navigationList.append(item);
  }

  navigation.append(navigationList);

  const actions = createElement('div', 'mobile-menu__actions');

  const loginButton = createElement('button', 'mobile-menu__login', 'Log In');

  loginButton.type = 'button';

  const signUpButton = createElement('button', 'mobile-menu__signup', 'Sign Up');

  signUpButton.type = 'button';

  actions.append(loginButton, signUpButton);

  menu.append(header, navigation, actions);

  return menu;
}
