import { createElement } from '../create-element';
import { createMobileMenu } from './mobile-menu';

export function createHeader(): HTMLElement {
  const header = createElement('header', 'header');

  const container = createElement('div', 'header__container');

  const logoContainer = createElement('div', 'header__logo-container');
  const logoIcon = createElement('img', 'header__logo-icon');
  logoIcon.src = '/src/assets/minigames_logo.png';
  logoIcon.alt = 'MiniGames logo';
  const logo = createElement('a', 'header__logo', 'MiniGames');
  logo.href = '/';
  logo.setAttribute('aria-label', 'MiniGames home page');
  logoContainer.append(logoIcon, logo);

  const navigation = createElement('nav', 'header__navigation');
  navigation.setAttribute('aria-label', 'Main navigation');

  const headerBtnsWrapper = createElement('div', 'header__btns-wrapper');
  const homeLink = createElement('a', 'header__link', 'Home');
  homeLink.href = '/';
  const libraryLink = createElement('a', 'header__link', 'Library');
  libraryLink.href = '/library';
  const tournamentsLink = createElement('a', 'header__link', 'Tournaments');
  tournamentsLink.href = '/tournaments';
  const communityLink = createElement('a', 'header__link', 'Community');
  communityLink.href = '/community';
  navigation.append(homeLink, libraryLink, tournamentsLink, communityLink);

  const actions = createElement('div', 'header__actions');

  const signInButton = createElement('button', 'header__sign-in', 'Log in');
  signInButton.type = 'button';

  const signUpButton = createElement('button', 'header__sign-up', 'Sign up');
  signUpButton.type = 'button';

  const burgerButton = createElement('button', 'header__burger');
  burgerButton.type = 'button';
  const mobileMenu = createMobileMenu();

  headerBtnsWrapper.append(navigation, actions);
  actions.append(signInButton, signUpButton, burgerButton);
  container.append(logoContainer, headerBtnsWrapper, mobileMenu);
  header.append(container);

  const closeButton = mobileMenu.querySelector('.mobile-menu__close');
  burgerButton.addEventListener('click', () => {
    mobileMenu.classList.add('mobile-menu--open');
    document.body.classList.add('menu-open');
  });
  closeButton?.addEventListener('click', () => {
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.classList.remove('menu-open');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--open')) {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.classList.remove('menu-open');
    }
  });

  return header;
}
