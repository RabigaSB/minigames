import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { changeLanguage } from '../../i18n';
import { createNotFoundPage } from './not-found';

describe('not-found page', () => {
  beforeEach(async () => {
    await changeLanguage('en');
    document.body.replaceChildren();
  });

  afterEach(async () => {
    document.body.replaceChildren();
    await changeLanguage('en');
  });

  it('updates page feedback when the active language changes', async () => {
    const page = createNotFoundPage();
    document.body.append(page);

    await changeLanguage('kk');

    expect(page.querySelector('.not-found__title')?.textContent).toBe('Бет табылмады');
    expect(page.querySelector('.not-found__message')?.textContent).toBe(
      'Сіз іздеген бет жоқ немесе басқа мекенжайға көшірілген.',
    );
    expect(page.querySelector('.not-found__home')?.textContent).toBe('Басты бетке оралу');
  });
});
