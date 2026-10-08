import { createElement } from '../create-element';
import { createMobileMenu } from './mobile-menu';
import { createAuthDialog, type AuthMode } from './auth-dialog';
import { ROUTES } from '../constants';
import { getAppPath } from '../constants';
import {
  APP_SESSION_LIFETIME_MS,
  clearAppSession,
  restoreAppSession,
  type AppSession,
} from '../../services/app-session';
import { logOut } from '../../services/firebase';
import { showSnackbar } from '../utils/snackbar';

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

  const userName = createElement('span', 'header__user');
  userName.hidden = true;
  const logoutButton = createElement('button', 'header__logout', 'Log out');
  logoutButton.type = 'button';
  logoutButton.hidden = true;

  const burgerButton = createElement('button', 'header__burger');
  burgerButton.type = 'button';
  const mobileMenu = createMobileMenu();

  const mobileLoginButton = mobileMenu.querySelector('.mobile-menu__login') as HTMLButtonElement;
  const mobileSignUpButton = mobileMenu.querySelector('.mobile-menu__signup') as HTMLButtonElement;
  const mobileUserName = mobileMenu.querySelector('.mobile-menu__user') as HTMLSpanElement;
  const mobileLogoutButton = mobileMenu.querySelector('.mobile-menu__logout') as HTMLButtonElement;

  const applySession = (session: AppSession | null): void => {
    signInButton.hidden = Boolean(session);
    signUpButton.hidden = Boolean(session);
    userName.hidden = !session;
    userName.textContent = session?.displayName ?? '';
    logoutButton.hidden = !session;
    mobileLoginButton.hidden = Boolean(session);
    mobileSignUpButton.hidden = Boolean(session);
    mobileUserName.hidden = !session;
    mobileUserName.textContent = session?.displayName ?? '';
    mobileLogoutButton.hidden = !session;
  };

  let activeSession: AppSession | null = null;
  let expirationTimer: number | undefined;
  const expireSession = (): void => {
    if (!activeSession) return;
    activeSession = null;
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    clearAppSession();
    applySession(null);
    showSnackbar('Your session has expired. Please sign in again.', 'error');
    void logOut().catch((error: unknown) => {
      console.error('Failed to clear the expired Firebase session.', error);
    });
  };
  const setSession = (session: AppSession): void => {
    activeSession = session;
    applySession(session);
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    const remainingTime = session.authenticatedAt + APP_SESSION_LIFETIME_MS - Date.now();
    if (remainingTime <= 0) {
      expireSession();
      return;
    }
    expirationTimer = window.setTimeout(expireSession, remainingTime);
  };

  const checkSessionExpiration = (): void => {
    if (activeSession && Date.now() >= activeSession.authenticatedAt + APP_SESSION_LIFETIME_MS) {
      expireSession();
    }
  };

  const authDialog = createAuthDialog(onAuthChange, setSession, (pending) => {
    signInButton.disabled = pending;
    signUpButton.disabled = pending;
    mobileLoginButton.disabled = pending;
    mobileSignUpButton.disabled = pending;
    logoutButton.disabled = pending;
    mobileLogoutButton.disabled = pending;
  });

  headerBtnsWrapper.append(navigation, actions);
  actions.append(signInButton, signUpButton, userName, logoutButton, burgerButton);
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
    checkSessionExpiration();
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

  const openAuthFromMobile = (mode: AuthMode) => {
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.classList.remove('menu-open');

    authDialog.openAuth(mode);
  };

  mobileLoginButton?.addEventListener('click', () => openAuthFromMobile('login'));

  mobileSignUpButton?.addEventListener('click', () => openAuthFromMobile('register'));

  const handleLogout = async (): Promise<void> => {
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    activeSession = null;
    clearAppSession();
    applySession(null);
    try {
      await logOut();
      showSnackbar('You are now signed out.', 'success');
    } catch (error) {
      console.error('Failed to sign out from Firebase.', error);
      showSnackbar('Unable to sign out. Please try again.', 'error');
    }
  };
  logoutButton.addEventListener('click', () => void handleLogout());
  mobileLogoutButton.addEventListener('click', () => void handleLogout());

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkSessionExpiration();
  });
  document.addEventListener('click', checkSessionExpiration, true);
  window.addEventListener('popstate', checkSessionExpiration, true);

  try {
    const restoredSession = restoreAppSession();
    if (restoredSession.status === 'valid') {
      setSession(restoredSession.session);
    } else if (restoredSession.status === 'expired') {
      showSnackbar('Your session has expired. Please sign in again.', 'error');
      void logOut().catch((error: unknown) => {
        console.error('Failed to clear the expired Firebase session.', error);
      });
    } else if (restoredSession.status === 'invalid') {
      showSnackbar('Your saved session was invalid and has been cleared.', 'error');
      void logOut().catch((error: unknown) => {
        console.error('Failed to clear the invalid Firebase session.', error);
      });
    }
  } catch (error) {
    console.error('Failed to restore the MiniGames app session.', error);
    showSnackbar('Unable to restore your session. Please sign in again.', 'error');
  }

  return header;
}
