import { createElement } from '../create-element';
import { getAppPath } from '../constants';
import { createLanguageSwitcher } from './language-switcher';
import { onLanguageChange, t } from '../../i18n';

export function createMobileMenu(): HTMLElement {
  const menu = createElement('div', 'mobile-menu');

  const header = createElement('div', 'mobile-menu__header');

  const logoContainer = createElement('div', 'mobile-menu__logo-container');
  const logoIcon = createElement('img', 'mobile-menu__logo-icon');
  logoIcon.src = './assets/minigames_logo.png';
  logoIcon.alt = t('common.logoAlt');
  const logo = createElement('a', 'mobile-menu__logo', 'MiniGames');
  logo.href = getAppPath('home');
  logo.setAttribute('aria-label', t('navigation.homeAriaLabel'));
  logoContainer.append(logoIcon, logo);

  const closeButton = createElement('button', 'mobile-menu__close', '×');

  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', t('navigation.closeMenu'));

  header.append(logoContainer, closeButton);

  const navigation = createElement('nav', 'mobile-menu__navigation');
  navigation.setAttribute('aria-label', t('navigation.menuAriaLabel'));

  const navigationList = createElement('ul', 'mobile-menu__list');

  const links = [
    [t('navigation.home'), getAppPath('home'), 'home', 'active'],
    [t('navigation.library'), getAppPath('library'), 'library'],
    [t('navigation.tournaments'), getAppPath('home')],
    [t('navigation.community'), getAppPath('home')],
  ];

  for (const [text, href, navData, className] of links) {
    const item = createElement('li', 'mobile-menu__item');

    const link = createElement('a', 'mobile-menu__link', text);

    link.href = href;

    if (navData) {
      link.setAttribute('data-nav', navData);
    }

    if (className) {
      link.classList.add(className);
    }

    item.append(link);
    navigationList.append(item);
  }

  navigation.append(navigationList);

  const actions = createElement('div', 'mobile-menu__actions');
  const languageSwitcher = createLanguageSwitcher(
    'mobile-menu__language-switcher',
    'mobile-menu-language-id',
  );

  const loginButton = createElement('button', 'mobile-menu__login', t('auth.logIn'));

  loginButton.type = 'button';

  const signUpButton = createElement('button', 'mobile-menu__signup', t('auth.signUp'));

  signUpButton.type = 'button';

  const logoutButton = createElement('button', 'mobile-menu__logout', t('auth.logOut'));
  logoutButton.type = 'button';
  logoutButton.hidden = true;

  actions.append(languageSwitcher, loginButton, signUpButton, logoutButton);

  menu.append(header, navigation, actions);

  onLanguageChange(() => {
    logoIcon.alt = t('common.logoAlt');
    logo.setAttribute('aria-label', t('navigation.homeAriaLabel'));
    closeButton.setAttribute('aria-label', t('navigation.closeMenu'));
    navigation.setAttribute('aria-label', t('navigation.menuAriaLabel'));

    const translatedLabels = [
      t('navigation.home'),
      t('navigation.library'),
      t('navigation.tournaments'),
      t('navigation.community'),
    ];
    navigationList.querySelectorAll('.mobile-menu__link').forEach((link, index) => {
      link.textContent = translatedLabels[index] ?? '';
    });

    loginButton.textContent = t('auth.logIn');
    signUpButton.textContent = t('auth.signUp');
    logoutButton.textContent = t('auth.logOut');
  });

  return menu;
}
