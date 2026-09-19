import { createElement } from '../create-element';

export function createFooter(): HTMLElement {
  const footer = createElement('footer', 'footer');

  const container = createElement('div', 'footer__container');

  const logosWrapper = createElement('div', 'footer__wrapper');

  const brand = createElement('div', 'footer__brand');

  const logoContainer = createElement('div', 'footer__logo-container');
  const logoIcon = createElement('img', 'footer__logo-icon');
  logoIcon.src = '/src/assets/minigames_logo.png';
  logoIcon.alt = 'MiniGames logo';
  const logo = createElement('a', 'footer__logo', 'MiniGames');
  logo.href = '/';
  logo.setAttribute('aria-label', 'MiniGames home page');
  logoContainer.append(logoIcon, logo);

  const description = createElement(
    'p',
    'footer__description',
    'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.',
  );

  brand.append(logoContainer, description);

  const links = createElement('div', 'footer__links');

  const explore = createFooterColumn('Explore', [
    ['Home', '/'],
    ['Library', '/library'],
    ['Categories', '#'],
    ['Tournaments', '#'],
  ]);

  const company = createFooterColumn('Company', [
    ['About Us', '#'],
    ['Contact', '#'],
    ['Privacy Policy', '#'],
    ['Terms of Service', '#'],
  ]);

  const community = createFooterCommunity();

  links.append(explore, company, community);

  const bottom = createFooterBottom();

  logosWrapper.append(brand, links);
  container.append(logosWrapper, bottom);
  footer.append(container);

  return footer;
}

function createFooterColumn(
  titleText: string,
  items: string[][],
): HTMLElement {
  const column = createElement('nav', 'footer__column');

  const title = createElement('h3', 'footer__column-title', titleText);

  const list = createElement('ul', 'footer__list');

  for (const [text, href] of items) {
    const item = createElement('li', 'footer__item');

    const link = createElement('a', 'footer__link', text);
    link.href = href;

    item.append(link);
    list.append(item);
  }

  column.append(title, list);

  return column;
}

function createFooterCommunity(): HTMLElement {
  const column = createElement('div', 'footer__column');

  const title = createElement(
    'h3',
    'footer__column-title',
    'Community',
  );

  const socialLinks = createElement('div', 'footer__social');

  const share = createElement('a', 'footer__social-link footer__social-link--share');
  share.href = '#';
  share.setAttribute('aria-label', 'Share');

  const community = createElement('a', 'footer__social-link footer__social-link--community');
  community.href = '#';
  community.setAttribute('aria-label', 'Community');

  const rss = createElement('a', 'footer__social-link footer__social-link--rss');
  rss.href = '#';
  rss.setAttribute('aria-label', 'RSS feed');

  socialLinks.append(share, community, rss);
  column.append(title, socialLinks);

  return column;
}

function createFooterBottom(): HTMLElement {
  const bottom = createElement('div', 'footer__bottom');

  const copyright = createElement(
    'p',
    'footer__copyright',
    '© 2026 MiniGames. All rights reserved.',
  );

  const school = createElement(
    'span',
    'footer__school',
    'RS School',
  );

  const author = createElement(
    'span',
    'footer__author',
    '@student-nickname',
  );

  const design = createElement(
    'span',
    'footer__design',
    'Designed with love',
  );

  bottom.append(copyright, school, author, design);

  return bottom;
}