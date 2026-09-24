import { createElement } from '../create-element';
import { createMobileMenu } from './mobile-menu';
import { createAuthDialog } from './auth-dialog';

export function createHeader(): HTMLElement {
  const header = createElement('header', 'header');

  const container = createElement('div', 'header__container');

  const logoContainer = createElement('div', 'header__logo-container');
  const logoIcon = createElement('img', 'header__logo-icon');
  logoIcon.src = './assets/minigames_logo.png';
  logoIcon.alt = 'MiniGames logo';
  const logo = createElement('a', 'header__logo', 'MiniGames');
  logo.href = '/';
  logo.setAttribute('data-nav', 'home');
  logoContainer.append(logoIcon, logo);

  const navigation = createElement('nav', 'header__navigation');

  const headerBtnsWrapper = createElement('div', 'header__btns-wrapper');
  const homeLink = createElement('a', 'header__link active', 'Home');
  homeLink.href = '/';
  homeLink.setAttribute('data-nav', 'home');
  homeLink.setAttribute('data-text', 'Home');
  const libraryLink = createElement('a', 'header__link', 'Library');
  libraryLink.href = '/library';
  libraryLink.setAttribute('data-nav', 'library');
  libraryLink.setAttribute('data-text', 'Library');
  const tournamentsLink = createElement('a', 'header__link', 'Tournaments');
  tournamentsLink.href = '/';
  tournamentsLink.setAttribute('data-nav', 'home');
  tournamentsLink.setAttribute('data-text', 'Tournaments');
  const communityLink = createElement('a', 'header__link', 'Community');
  communityLink.href = '/';
  communityLink.setAttribute('data-nav', 'home');
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

  const authDialog = createAuthDialog();

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
      authDialog.classList.remove('auth-dialog--open');
    }
  });

  const openAuthDialog = () => {
    authDialog.classList.add('auth-dialog--open');
  };
  signInButton.addEventListener('click', openAuthDialog);
  signUpButton.addEventListener('click', openAuthDialog);

  const mobileLoginButton = mobileMenu.querySelector('.mobile-menu__login');

  const mobileSignUpButton = mobileMenu.querySelector('.mobile-menu__signup');

  const openAuthFromMobile = () => {
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.classList.remove('menu-open');

    authDialog.classList.add('auth-dialog--open');
  };

  mobileLoginButton?.addEventListener('click', openAuthFromMobile);

  mobileSignUpButton?.addEventListener('click', openAuthFromMobile);

  return header;
}
