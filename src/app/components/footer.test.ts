import { afterEach, describe, expect, it } from 'vitest';
import { changeLanguage } from '../../i18n';
import { createFooter } from './footer';

describe('footer localization', () => {
  afterEach(async () => {
    await changeLanguage('en');
    document.body.replaceChildren();
  });

  it('updates footer text and accessible labels when the language changes', async () => {
    const footer = createFooter();
    document.body.append(footer);

    await changeLanguage('kk');

    expect(footer.querySelector('.footer__description')?.textContent).toContain('Үзіліс жасап');
    expect(footer.querySelector('.footer__column-title')?.textContent).toBe('Шолу');
    expect(footer.querySelector('.footer__social-link--share')?.getAttribute('aria-label')).toBe(
      'Бөлісу',
    );
    expect(footer.querySelector('.footer__design')?.textContent).toBe('Сүйіспеншілікпен жасалған');
  });
});
