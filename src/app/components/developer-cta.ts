import { createElement } from '../create-element';
import { onLanguageChange, t } from '../../i18n';

export function createDeveloperCta(): HTMLElement {
  const section = createElement('section', 'developer-cta');

  section.setAttribute('aria-labelledby', 'developer-cta-title');

  const container = createElement('div', 'developer-cta__container');

  const image = createElement('img', 'developer-cta__image');

  image.src = './assets/developer.png';
  image.alt = t('developerCta.imageAlt');

  const content = createElement('div', 'developer-cta__content');

  const title = createElement('h2', 'developer-cta__title', t('developerCta.title'));

  title.id = 'developer-cta-title';

  const description = createElement('p', 'developer-cta__description');

  const firstRow = createElement(
    'span',
    'developer-cta__description--span',
    t('developerCta.descriptionFirst'),
  );
  const secondRow = createElement(
    'span',
    'developer-cta__description--span',
    t('developerCta.descriptionSecond'),
  );
  const thirdtRow = createElement(
    'span',
    'developer-cta__description--span',
    t('developerCta.descriptionThird'),
  );

  description.append(firstRow, secondRow, thirdtRow);

  const button = createElement('a', 'developer-cta__button', t('developerCta.submit'));

  button.href = '#';

  const contact = createElement('p', 'developer-cta__contact');
  const updateTranslations = (): void => {
    image.alt = t('developerCta.imageAlt');
    title.textContent = t('developerCta.title');
    firstRow.textContent = t('developerCta.descriptionFirst');
    secondRow.textContent = t('developerCta.descriptionSecond');
    thirdtRow.textContent = t('developerCta.descriptionThird');
    button.textContent = t('developerCta.submit');
    contact.textContent = t('developerCta.contact', { email: 'developers@minigames.com' });
  };
  updateTranslations();

  content.append(title, description, button, contact);

  container.append(image, content);
  section.append(container);

  let unsubscribe = (): void => undefined;
  unsubscribe = onLanguageChange(() => {
    if (!section.isConnected) {
      unsubscribe();
      return;
    }
    updateTranslations();
  });

  return section;
}
