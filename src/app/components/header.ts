import { createElement } from '../create-element';
import { createMobileMenu } from './mobile-menu';
import { createAuthDialog, type AuthMode } from './auth-dialog';
import { ROUTES } from '../constants';
import { getAppPath } from '../constants';

export function createHeader(
  onAuthChange: (mode: AuthMode | null) => void = () => undefined,
): HTMLElement {
  const header = createElement('header', 'header');

  const container = createElement('div', 'header__container');

  const logoContainer = createElement('div', 'header__logo-container');
  const logoIcon = createElement('img', 'header__logo-icon');
  logoIcon.src = './assets/minigames_logo.png';
  logoIcon.alt = 'MiniGames logo';
  const logo = createElement('a', 'header__logo', 'MiniGames');
  logo.href = getAppPath('home');
  logo.setAttribute('data-nav', ROUTES.HOME);
  logoContainer.append(logoIcon, logo);

  const navigation = createElement('nav', 'header__navigation');

  const headerBtnsWrapper = createElement('div', 'header__btns-wrapper');
  const homeLink = createElement('a', 'header__link active', 'Home');
  homeLink.href = getAppPath('home');
  homeLink.setAttribute('data-nav', ROUTES.HOME);
  homeLink.setAttribute('data-text', 'Home');
  const libraryLink = createElement('a', 'header__link', 'Library');
  libraryLink.href = getAppPath('library');
  libraryLink.setAttribute('data-nav', ROUTES.LIBRARY);
  libraryLink.setAttribute('data-text', 'Library');
  const tournamentsLink = createElement('a', 'header__link', 'Tournaments');
  tournamentsLink.href = getAppPath('home');
  tournamentsLink.setAttribute('data-text', 'Tournaments');
  const communityLink = createElement('a', 'header__link', 'Community');
  communityLink.href = getAppPath('home');
  communityLink.setAttribute('data-text', 'Community');
  navigation.append(homeLink, libraryLink, tournamentsLink, communityLink);

  const actions = createElement('div', 'header__actions');

  const signInButton = createElement('button', 'header__sign-in', 'Log in');
  signInButton.type = 'button';

  const signUpButton = createElement('button', 'header__sign-up', 'Sign up');
  signUpButton.type = 'button';

  const burgerButton = createElement('button', 'header__burger');
  burgerButton.type = 'button';
  const mobileMenu = createMobileMenu();

  const authDialog = createAuthDialog(onAuthChange);

  headerBtnsWrapper.append(navigation, actions);
  actions.append(signInButton, signUpButton, burgerButton);
  container.append(logoContainer, headerBtnsWrapper, mobileMenu, authDialog);
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
    if (event.key !== 'Escape') {
      return;
    }

    if (mobileMenu.classList.contains('mobile-menu--open')) {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.classList.remove('menu-open');
    }

    if (authDialog.classList.contains('auth-dialog--open')) {
      authDialog.closeAuth();
    }
  });

  const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.classList.remove('menu-open');
    });
  });

  signInButton.addEventListener('click', () => authDialog.openAuth('login'));
  signUpButton.addEventListener('click', () => authDialog.openAuth('register'));

  const mobileLoginButton = mobileMenu.querySelector('.mobile-menu__login');

  const mobileSignUpButton = mobileMenu.querySelector('.mobile-menu__signup');

  const openAuthFromMobile = (mode: AuthMode) => {
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.classList.remove('menu-open');

    authDialog.openAuth(mode);
  };

  mobileLoginButton?.addEventListener('click', () => openAuthFromMobile('login'));

  mobileSignUpButton?.addEventListener('click', () => openAuthFromMobile('register'));

  return header;
}
