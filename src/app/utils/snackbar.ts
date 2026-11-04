import { createElement } from '../create-element';
import { onLanguageChange, t, type TranslationKey } from '../../i18n';

export function showSnackbar(
  messageKey: TranslationKey,
  type: 'success' | 'error' | 'warning' = 'success',
): void {
  const snackbar = createElement('div', 'snackbar');
  snackbar.classList.add(`snackbar--${type}`);
  snackbar.setAttribute('role', type === 'error' ? 'alert' : 'status');
  snackbar.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  snackbar.textContent = t(messageKey);

  document.body.append(snackbar);
  const unsubscribe = onLanguageChange(() => {
    if (!snackbar.isConnected) {
      unsubscribe();
      return;
    }
    snackbar.textContent = t(messageKey);
  });

  requestAnimationFrame(() => snackbar.classList.add('snackbar--visible'));

  setTimeout(() => {
    unsubscribe();
    snackbar.classList.remove('snackbar--visible');
    setTimeout(() => snackbar.remove(), 300);
  }, 3000);
}
