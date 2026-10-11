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

export interface AppHeader extends HTMLElement {
  getAppSession(): AppSession | null;
  requireAuthentication(): void;
}

export function createHeader(
  onAuthChange: (mode: AuthMode | null) => void = () => undefined,
): AppHeader {
  const header = Object.assign(createElement('header', 'header'), {
    getAppSession: (): AppSession | null => null,
    requireAuthentication: (): void => undefined,
  });

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

  const userProfile = createElement('div', 'header__profile');
  userProfile.hidden = true;
  const userAvatar = createElement('div', 'header__avatar');
  userAvatar.setAttribute('aria-hidden', 'true');
  const userName = createElement('span', 'header__user');
  userProfile.append(userName, userAvatar);
  const logoutButton = createElement('button', 'header__logout', 'Log out');
  logoutButton.type = 'button';
  logoutButton.hidden = true;

  const burgerButton = createElement('button', 'header__burger');
  burgerButton.type = 'button';
  const mobileMenu = createMobileMenu();

  const mobileLoginButton = mobileMenu.querySelector('.mobile-menu__login') as HTMLButtonElement;
  const mobileSignUpButton = mobileMenu.querySelector('.mobile-menu__signup') as HTMLButtonElement;
  const mobileLogoutButton = mobileMenu.querySelector('.mobile-menu__logout') as HTMLButtonElement;

  const getProfileName = (session: AppSession | null): string => {
    if (!session) return 'Player';
    const preferredName = session.displayName.trim();
    if (preferredName) return preferredName;
    const emailName = session.email.split('@')[0]?.trim();
    return emailName || 'Player';
  };

  const getInitials = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '?';

    const words = trimmed.split(/\s+/).filter(Boolean);
    const alphaNumeric = /[\p{L}\p{N}]/u;
    const firstCharacters: string[] = [];

    for (const word of words) {
      const match = word.match(alphaNumeric);
      if (match) {
        firstCharacters.push(match[0].toUpperCase());
      }
      if (firstCharacters.length >= 2) break;
    }

    if (firstCharacters.length > 0) {
      return firstCharacters.join('').slice(0, 2);
    }

    return '?';
  };

  const renderAvatarFallback = (
    avatarElement: HTMLDivElement,
    session: AppSession,
    label: string,
  ): void => {
    const initials = getInitials(getProfileName(session));
    avatarElement.textContent = initials;
    avatarElement.classList.remove('has-photo');
    avatarElement.setAttribute('aria-label', label);
  };

  let avatarRenderId = 0;
  const applySession = (session: AppSession | null): void => {
    const renderId = ++avatarRenderId;
    const hasSession = Boolean(session);
    signInButton.hidden = hasSession;
    signUpButton.hidden = hasSession;
    userProfile.hidden = !hasSession;
    logoutButton.hidden = !hasSession;
    mobileLoginButton.hidden = hasSession;
    mobileSignUpButton.hidden = hasSession;
    mobileLogoutButton.hidden = !hasSession;
    window.dispatchEvent(new Event('appsessionchange'));

    if (!session) {
      userAvatar.textContent = '';
      userAvatar.classList.remove('has-photo');
      userAvatar.style.backgroundImage = '';
      userAvatar.style.backgroundSize = '';
      userAvatar.style.backgroundColor = '';
      userAvatar.style.backgroundPosition = '';
      userAvatar.style.display = '';
      userName.textContent = '';
      return;
    }

    userAvatar.style.display = '';
    userAvatar.style.backgroundColor = '';
    userAvatar.style.backgroundImage = '';
    userAvatar.classList.remove('has-photo');
    const profileName = getProfileName(session);
    userName.textContent = profileName;

    if (session.avatarUrl) {
      const image = new Image();
      image.src = session.avatarUrl;
      image.alt = profileName;
      image.onload = () => {
        if (renderId !== avatarRenderId) return;
        userAvatar.textContent = '';
        userAvatar.classList.add('has-photo');
        userAvatar.style.backgroundImage = `url("${session.avatarUrl}")`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.style.backgroundPosition = 'center';
      };
      image.onerror = () => {
        if (renderId !== avatarRenderId) return;
        renderAvatarFallback(userAvatar, session, profileName);
      };
      return;
    }

    renderAvatarFallback(userAvatar, session, profileName);
  };

  let activeSession: AppSession | null = null;
  let expirationTimer: number | undefined;
  let expirationSnackbarShown = false;
  const resetToGuestMode = (): void => {
    activeSession = null;
    if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    expirationTimer = undefined;
    clearAppSession();
    applySession(null);
  };
  const expireSession = (): void => {
    if (!activeSession) return;
    resetToGuestMode();
    if (!expirationSnackbarShown) {
      expirationSnackbarShown = true;
      showSnackbar('Your session has expired. Please sign in again.', 'error');
    }
    void logOut().catch((error: unknown) => {
      console.error('Failed to clear the expired Firebase session.', error);
    });
  };
  const setSession = (session: AppSession): void => {
    expirationSnackbarShown = false;
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
  actions.append(signInButton, signUpButton, userProfile, logoutButton, burgerButton);
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
    if (!activeSession) return;
    resetToGuestMode();
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
  window.addEventListener('focus', checkSessionExpiration);
  window.addEventListener('pageshow', checkSessionExpiration);
  document.addEventListener('click', checkSessionExpiration, true);
  window.addEventListener('popstate', checkSessionExpiration, true);

  try {
    const restoredSession = restoreAppSession();
    if (restoredSession.status === 'valid') {
      setSession(restoredSession.session);
    } else if (restoredSession.status === 'expired') {
      expirationSnackbarShown = true;
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

  header.getAppSession = (): AppSession | null => {
    checkSessionExpiration();
    return activeSession;
  };
  header.requireAuthentication = (): void => authDialog.openAuth('login');

  return header;
}
