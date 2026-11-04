import { createElement } from '../create-element';
import { getAppPath } from '../constants';
import { onLanguageChange, t, type TranslationKey } from '../../i18n';

type FooterLink = [TranslationKey, string, string?];

export function createFooter(): HTMLElement {
  const footer = createElement('footer', 'footer');
  const translations: Array<() => void> = [];

  const setText = (element: HTMLElement, key: TranslationKey, year?: number): void => {
    const update = (): void => {
      element.textContent = t(key, year === undefined ? undefined : { year });
    };
    update();
    translations.push(update);
  };
  const setAttribute = (element: HTMLElement, attribute: string, key: TranslationKey): void => {
    const update = (): void => element.setAttribute(attribute, t(key));
    update();
    translations.push(update);
  };

  const container = createElement('div', 'footer__container');
  const logosWrapper = createElement('div', 'footer__wrapper');
  const brand = createElement('div', 'footer__brand');

  const logoContainer = createElement('div', 'footer__logo-container');
  const logoIcon = createElement('img', 'footer__logo-icon');
  logoIcon.src = './assets/minigames_logo.png';
  setAttribute(logoIcon, 'alt', 'common.logoAlt');
  const logo = createElement('a', 'footer__logo', 'MiniGames');
  logo.href = getAppPath('home');
  setAttribute(logo, 'aria-label', 'navigation.homeAriaLabel');
  logoContainer.append(logoIcon, logo);

  const description = createElement('p', 'footer__description');
  setText(description, 'footer.description');
  brand.append(logoContainer, description);

  const links = createElement('div', 'footer__links');
  const explore = createFooterColumn(
    'footer.explore',
    [
      ['navigation.home', getAppPath('home'), 'home'],
      ['navigation.library', getAppPath('library'), 'library'],
      ['footer.categories', '#'],
      ['navigation.tournaments', '#'],
    ],
    setText,
  );
  const company = createFooterColumn(
    'footer.company',
    [
      ['footer.aboutUs', '#'],
      ['footer.contact', '#'],
      ['footer.privacyPolicy', '#'],
      ['footer.termsOfService', '#'],
    ],
    setText,
  );
  const community = createFooterCommunity(setText, setAttribute);
  links.append(explore, company, community);

  const bottom = createFooterBottom(setText);
  logosWrapper.append(brand, links);
  container.append(logosWrapper, bottom);
  footer.append(container);

  onLanguageChange(() => translations.forEach((update) => update()));

  return footer;
}

function createFooterColumn(
  titleKey: TranslationKey,
  items: FooterLink[],
  setText: (element: HTMLElement, key: TranslationKey) => void,
): HTMLElement {
  const column = createElement('nav', 'footer__column');
  const title = createElement('h3', 'footer__column-title');
  setText(title, titleKey);

  const list = createElement('ul', 'footer__list');
  for (const [key, href, navData] of items) {
    const item = createElement('li', 'footer__item');
    const link = createElement('a', 'footer__link');
    setText(link, key);
    link.href = href;
    if (navData) link.setAttribute('data-nav', navData);
    item.append(link);
    list.append(item);
  }

  column.append(title, list);
  return column;
}

function createFooterCommunity(
  setText: (element: HTMLElement, key: TranslationKey) => void,
  setAttribute: (element: HTMLElement, attribute: string, key: TranslationKey) => void,
): HTMLElement {
  const column = createElement('div', 'footer__column');
  const title = createElement('h3', 'footer__column-title');
  setText(title, 'navigation.community');

  const socialLinks = createElement('div', 'footer__social');
  const share = createElement('a', 'footer__social-link footer__social-link--share');
  share.href = '#';
  setAttribute(share, 'aria-label', 'footer.share');

  const community = createElement('a', 'footer__social-link footer__social-link--community');
  community.href = '#';
  setAttribute(community, 'aria-label', 'navigation.community');

  const rss = createElement('a', 'footer__social-link footer__social-link--rss');
  rss.href = '#';
  setAttribute(rss, 'aria-label', 'footer.rssFeed');

  socialLinks.append(share, community, rss);
  column.append(title, socialLinks);
  return column;
}

function createFooterBottom(
  setText: (element: HTMLElement, key: TranslationKey, year?: number) => void,
): HTMLElement {
  const bottom = createElement('div', 'footer__bottom');
  const copyright = createElement('p', 'footer__copyright');
  setText(copyright, 'footer.copyright', 2026);
  const school = createElement('span', 'footer__school');
  setText(school, 'footer.school');
  const author = createElement('span', 'footer__author');
  setText(author, 'footer.author');
  const design = createElement('span', 'footer__design');
  setText(design, 'footer.design');
  bottom.append(copyright, school, author, design);
  return bottom;
}
