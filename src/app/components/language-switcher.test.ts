import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { changeLanguage, i18nReady } from '../../i18n';
import { createLanguageSwitcher } from './language-switcher';

describe('language switcher', () => {
  beforeEach(async () => {
    await i18nReady;
    await changeLanguage('en');
    document.body.replaceChildren();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await changeLanguage('en');
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('uses accessible native selects and synchronizes desktop and mobile selections', async () => {
    const initialUrl = window.location.href;
    const desktopSwitcher = createLanguageSwitcher('header__language-switcher');
    const mobileSwitcher = createLanguageSwitcher('mobile-menu__language-switcher');
    document.body.append(desktopSwitcher, mobileSwitcher);

    const desktopSelect = desktopSwitcher.querySelector('select')!;
    const mobileSelect = mobileSwitcher.querySelector('select')!;
    expect(desktopSelect.getAttribute('aria-label')).toBe('Select language');
    expect(desktopSelect.tagName).toBe('SELECT');
    expect(desktopSelect.value).toBe('en');

    mobileSelect.value = 'ru';
    mobileSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await vi.waitFor(() => {
      expect(desktopSelect.value).toBe('ru');
      expect(mobileSelect.value).toBe('ru');
    });

    desktopSelect.value = 'kk';
    desktopSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await vi.waitFor(() => {
      expect(desktopSelect.value).toBe('kk');
      expect(mobileSelect.value).toBe('kk');
    });

    expect(window.location.href).toBe(initialUrl);
  });
});
